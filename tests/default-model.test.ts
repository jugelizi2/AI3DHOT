// The engine's own model: one OpenAI-compatible model (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL) runs every
// step of the analysis when nothing picks another one for a step.
import { stub, tag } from "./setup.ts";
import { analysisStep, SELECTING_SCORE, type AnalysisStep } from "./analysis-steps.ts";
import assert from "node:assert/strict";
import { after, before, mock, test, type TestContext } from "node:test";
import { stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { AgentOptions, SDKAgent, RunResult } from "@cursor/sdk";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { analyzeArticle } from "@aihot/backend/editorial/analyze";
import { CAPABILITIES, modelRoute, type Capability } from "@aihot/backend/editorial/models";
import { modelsOverview, switchModel } from "@aihot/backend/admin/models";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { chatJson } from "@aihot/backend/providers/llm";
import { cursorRuntime } from "@aihot/backend/providers/cursor";
import { BudgetExceededError, ModelOutputError, ModelUnavailableError, ReceiptUnknownError, failureKind } from "@aihot/backend/providers/receipts";

// Nothing chosen per step: every capability falls back to the `default` model (a step the site
// gives a model of its own is sent back to it by its environment variable).
for (const c of Object.values(CAPABILITIES) as Capability[]) {
  if (c.default === "default") delete process.env[c.env];
  else process.env[c.env] = "default";
}

const T = tag();
const SOURCE = `test-default-model-${T}`;
const seen: Array<{ model: string; step: AnalysisStep }> = [];
const provider = await stub((_hit, req) => {
  const step = analysisStep(req.body);
  seen.push({ model: (JSON.parse(req.body) as { model: string }).model, step });
  const content =
    step === "prefilter" ? { label: "PASS", reason: "测试" }
    : step === "score" ? { attentionScore: SELECTING_SCORE }
    : step === "understand" ? { itemType: "product_launch", authorRole: "principal", tags: ["产品更新"], editorialJudgment: "理由", titleZh: "一个模型的标题", summaryZh: "一个模型写的摘要。第二句。" }
    : step === "structure" ? { category: "ai-products", tags: ["产品更新"], subjects: [], fact: null }
    : "title_zh: 标题\nsummary_zh: 摘要。";
  return { id: `stub-${seen.length}`, choices: [{ message: { content: typeof content === "string" ? content : JSON.stringify(content) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } };
});
Object.assign(process.env, { LLM_BASE_URL: `${provider.url}/v1`, LLM_API_KEY: "test-key", LLM_MODEL: "one-model", MODEL_CALLS_ENABLED: "true" });

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, next_fetch_at) VALUES (${SOURCE}, 'Test default model', 'rss', 'T1', 'editorial', '2100-01-01')`;
  await sql`INSERT INTO budgets(service,per_minute,per_hour,per_day,note) VALUES('cursor',1000,10000,100000,'local SDK fixture')
    ON CONFLICT(service) DO UPDATE SET per_minute=1000,per_hour=10000,per_day=100000`;
});

const sdkRequest = (name: string) => ({ model: "cursor-agent", purpose: "sdk_test", subject: `cursor:${T}:${name}`,
  promptVersion: "sdk-test-v1", system: "Write a Chinese AI+3D summary.", user: `AI3D ${name}`,
  schema: z.object({ ok: z.literal(true) }) });
const sdkAnswer = (text = '{"ok":true}'): RunResult => ({ id: "run-test", requestId: "cursor-request-test", status: "finished", result: text,
  usage: { inputTokens: 8, cacheReadTokens: 3, cacheWriteTokens: 2, outputTokens: 4, totalTokens: 17 } });

function stubCursor(t: TestContext, options: { wait?: () => Promise<RunResult>; sendError?: Error; noCost?: boolean; pendingCost?: boolean; cancel?: () => void } = {}) {
  process.env.CURSOR_API_KEY = "cursor-local-test-key";
  process.env.CURSOR_MODEL = "composer-2.5";
  const seen: { options?: AgentOptions; prompt?: string; calls: number; disposed: number; cancelled: number } = { calls: 0, disposed: 0, cancelled: 0 };
  const stubbed = mock.method(cursorRuntime, "create", async (settings: AgentOptions) => {
    seen.calls++; seen.options = settings;
    return {
      agentId: "agent-test",
      send: async (prompt: string) => {
        seen.prompt = prompt;
        if (options.sendError) throw options.sendError;
        return { wait: options.wait ?? (async () => sdkAnswer()), cancel: async () => { seen.cancelled++; options.cancel?.(); } };
      },
      getUsage: async () => {
        if (options.pendingCost) await new Promise<never>(() => {});
        if (options.noCost) throw Object.assign(new Error("feature_unavailable"), { status: 403 });
        return { cost: { chargedCents: 1.5, rawCostCents: 2 } };
      },
      [Symbol.asyncDispose]: async () => { seen.disposed++; },
    } as unknown as SDKAgent;
  });
  t.after(() => stubbed.mock.restore());
  return seen;
}

test("Cursor reuses a paid answer, records tokens and billed cost, and has no tools or project context", async t => {
  const seen = stubCursor(t);
  const first = await chatJson(sdkRequest("reuse"));
  assert.deepEqual(first.data, { ok: true });
  assert.deepEqual(await chatJson(sdkRequest("reuse")), { ...first, reused: true });
  assert.equal(seen.calls, 1);
  assert.deepEqual(seen.options!.tools, []);
  assert.deepEqual(seen.options!.local!.settingSources, []);
  assert.equal(seen.options!.local!.enableAgentRetries, false);
  assert.notEqual(path.resolve(seen.options!.local!.cwd!), process.cwd());
  await assert.rejects(stat(seen.options!.local!.cwd!), { code: "ENOENT" });
  assert.equal(seen.disposed, 1);
  assert.match(seen.prompt!, /AI3D reuse/);
  assert.match(seen.prompt!, /valid JSON object/);
  const [receipt] = await sql`SELECT status,usage,cost,cost_basis,currency,request FROM receipts WHERE id=${first.receiptId}`;
  assert.equal(receipt!.status, "received");
  assert.equal(receipt!.usage.prompt_tokens, 13);
  assert.equal(receipt!.usage.prompt_tokens_details.cached_tokens, 3);
  assert.equal(Number(receipt!.cost), 0.015);
  assert.equal(receipt!.cost_basis, "actual");
  assert.equal(receipt!.currency, "USD");
  assert.ok(!JSON.stringify(receipt!.request).includes(process.env.CURSOR_API_KEY!));
});

test("Cursor supports the existing text-format parsers without forcing JSON", async t => {
  const seen = stubCursor(t, { wait: async () => sdkAnswer("ok: yes") });
  const result = await chatJson({ ...sdkRequest("text-format"), json: false, parse: content => ({ ok: content === "ok: yes" }) });
  assert.equal(result.data.ok, true);
  assert.doesNotMatch(seen.prompt!, /valid JSON object/);
});

test("Cursor without a key or with image input sends nothing and creates no paid receipt", async t => {
  const seen = stubCursor(t);
  delete process.env.CURSOR_API_KEY;
  await assert.rejects(chatJson(sdkRequest("missing-key")), ModelUnavailableError);
  process.env.CURSOR_API_KEY = "cursor-local-test-key";
  await assert.rejects(chatJson({ ...sdkRequest("image"), user: [{ type: "image_url", image_url: { url: "https://example.org/image.png" } }] }), ModelUnavailableError);
  assert.equal(seen.calls, 0);
  assert.equal((await sql`SELECT 1 FROM receipts WHERE subject IN (${sdkRequest("missing-key").subject},${sdkRequest("image").subject})`).length, 0);
});

test("Cursor budget exhaustion prevents SDK initialization", async t => {
  const seen = stubCursor(t);
  await sql`UPDATE budgets SET per_minute=0 WHERE service='cursor'`;
  try { await assert.rejects(chatJson(sdkRequest("budget")), BudgetExceededError); }
  finally { await sql`UPDATE budgets SET per_minute=1000 WHERE service='cursor'`; }
  assert.equal(seen.calls, 0);
});

test("Cursor schema failures reject the received answer; a new attempt can replace it", async t => {
  let text = '{"ok":false}';
  const seen = stubCursor(t, { wait: async () => sdkAnswer(text) });
  await assert.rejects(chatJson(sdkRequest("schema")), ModelOutputError);
  const [receipt] = await sql`SELECT status FROM receipts WHERE subject=${sdkRequest("schema").subject}`;
  assert.equal(receipt!.status, "failed");
  text = '{"ok":true}';
  assert.equal((await chatJson(sdkRequest("schema"))).data.ok, true);
  assert.equal(seen.calls, 2);
});

test("Cursor explicit auth refusals are unbilled failures and redact the key", async t => {
  stubCursor(t, { sendError: Object.assign(new Error("Invalid key cursor-local-test-key"), { status: 401 }) });
  await assert.rejects(chatJson(sdkRequest("auth")), error => failureKind(error) === "refused" && !String(error).includes("cursor-local-test-key"));
  const [receipt] = await sql`SELECT status,error FROM receipts WHERE subject=${sdkRequest("auth").subject}`;
  assert.equal(receipt!.status, "failed");
  assert.ok(!receipt!.error.includes("cursor-local-test-key"));
});

test("Cursor timeout cancels the run, cleans its workspace, and does not buy another answer on retry", async t => {
  let release!: (result: RunResult) => void;
  const waiting = new Promise<RunResult>(resolve => { release = resolve; });
  const seen = stubCursor(t, { wait: () => waiting, cancel: () => release({ id: "run-timeout", status: "cancelled" }) });
  await assert.rejects(chatJson({ ...sdkRequest("timeout"), timeoutMs: 25 }), ReceiptUnknownError);
  await assert.rejects(chatJson(sdkRequest("timeout")), ReceiptUnknownError);
  assert.equal(seen.calls, 1);
  assert.equal(seen.cancelled, 1);
  assert.equal(seen.disposed, 1);
  await assert.rejects(stat(seen.options!.local!.cwd!), { code: "ENOENT" });
});

test("Cursor failed runs remain unknown rather than being automatically resent", async t => {
  const seen = stubCursor(t, { wait: async () => ({ id: "run-failed", status: "error", error: { message: "transport interrupted" } }) });
  await assert.rejects(chatJson(sdkRequest("failed-run")), ReceiptUnknownError);
  await assert.rejects(chatJson(sdkRequest("failed-run")), ReceiptUnknownError);
  assert.equal(seen.calls, 1);
});

test("Cursor accounts without usage access retain token counts and leave cost unknown", async t => {
  stubCursor(t, { noCost: true });
  const result = await chatJson(sdkRequest("no-cost-access"));
  const [receipt] = await sql`SELECT cost,usage FROM receipts WHERE id=${result.receiptId}`;
  assert.equal(receipt!.cost, null);
  assert.equal(receipt!.usage.completion_tokens, 4);
});

test("a slow Cursor billing lookup does not discard an already received answer", async t => {
  const seen = stubCursor(t, { pendingCost: true });
  const result = await chatJson({ ...sdkRequest("slow-cost"), timeoutMs: 25 });
  assert.equal(result.data.ok, true);
  assert.equal(seen.cancelled, 0);
  const [receipt] = await sql`SELECT status,cost FROM receipts WHERE id=${result.receiptId}`;
  assert.equal(receipt!.status, "received");
  assert.equal(receipt!.cost, null);
});

test("the admin can select Cursor for a capability and switch back without changing the other steps", async () => {
  const info = await modelsOverview();
  assert.ok(info.choices.some(choice => choice.key === "cursor-agent" && choice.service === "cursor" && !choice.vision));
  await switchModel("summarize", "cursor-agent", "Local SDK routing check", "test");
  try {
    assert.equal((await modelRoute("summarize")).model, "cursor-agent");
    assert.equal((await modelRoute("prefilter")).model, "default");
  } finally {
    await switchModel("summarize", null, "Restore local routing", "test");
  }
  assert.equal((await modelRoute("summarize")).model, "default");
});
after(async () => {
  await provider.close();
  await stopBoss();
  await closeDb();
});

test("one model runs the prefilter, both scores, the writing and the structure", async () => {
  const { articleId } = await upsertMaterial({
    sourceId: SOURCE, url: `https://example.com/${T}`, title: `A product launch ${T}`, bodyText: `A company launched a product with pricing and availability. ${T} `.repeat(6),
    bodyStatus: "ok", via: "fetch", publishedAt: new Date(),
  } as never);
  const res = await analyzeArticle(articleId);
  assert.equal(res!.output!.selected, true);
  assert.equal(res!.output!.titleZh, "一个模型的标题");
  assert.deepEqual(seen.map((r) => r.step).sort(), ["prefilter", "score", "score", "structure", "understand"]);
  assert.ok(seen.every((r) => r.model === "one-model"), "every request names the configured model");
  const services = await sql<{ service: string }[]>`SELECT DISTINCT service FROM receipts WHERE subject LIKE ${`article:${articleId}%`}`;
  assert.deepEqual(services.map((s) => s.service), ["llm"]);
});
