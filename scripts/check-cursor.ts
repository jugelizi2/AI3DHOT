// One paid connection check after CURSOR_API_KEY is configured. Does not switch production routing.
import { z } from "zod";
import { chatJson } from "@aihot/backend/providers/llm";
import { completeReceipt } from "@aihot/backend/providers/receipts";
import { closeDb, sql } from "@aihot/backend/db";

try {
  const result = await chatJson({ model: "cursor-agent", purpose: "cursor_connection_check",
    subject: `cursor-check:${crypto.randomUUID()}`, promptVersion: "cursor-check-v1",
    system: '请完成接口检查，只返回 JSON：{"ok":true}。', user: "AI+3D 行业站的模型连接检查。",
    schema: z.object({ ok: z.literal(true) }), maxTokens: 512 });
  await sql.begin(tx => completeReceipt(tx, result.receiptId));
  console.log(JSON.stringify({ ok: result.data.ok, model: result.model, receiptId: result.receiptId, usage: result.usage }));
} finally {
  await closeDb();
}
