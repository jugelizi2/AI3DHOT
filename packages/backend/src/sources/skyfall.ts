// Skyfall's Vite blog ships its dated posts and article HTML in public script chunks.
// Read static string literals only; never execute the publisher's JavaScript.
import * as cheerio from "cheerio";
import { requireOk } from "../lib/http-fetch.ts";
import { collapseWhitespace, stripTags } from "../lib/text.ts";
import { sanitizeBody } from "../content/sanitize.ts";
import { fetchListing } from "./listing-fetch.ts";
import { readPublicationDate } from "./dates.ts";
import { FetchError, type Candidate, type SourceRow } from "./types.ts";

const STRING = String.raw`(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\x60(?:[^\x60\\$]|\$(?!\{)|\\[\s\S])*\x60)`;

function literal(value: string): string {
  if (value.startsWith('"')) return JSON.parse(value);
  return value.slice(1, -1).replace(/\\(?:u\{[\da-f]+\}|u[\da-f]{4}|x[\da-f]{2}|\r\n|[\s\S])/gi, (escape) => {
    const code = escape.slice(1);
    if (/^[ux]/i.test(code)) return String.fromCodePoint(parseInt(code.replace(/^u\{|\}$|^[ux]/gi, ""), 16));
    return ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "0": "\0", "\n": "", "\r\n": "" } as Record<string, string>)[code] ?? code;
  });
}

function asset(file: string, base: string): string {
  const url = new URL(file, base);
  if (url.origin !== new URL(base).origin || !url.pathname.startsWith("/assets/") || !url.pathname.endsWith(".js")) {
    throw new FetchError("skyfall_blog: unexpected script address");
  }
  return url.toString();
}

const script = async (url: string) => requireOk(await fetchListing(url, { timeoutMs: 60_000, redirectPolicy: "same-origin" })).text();

export async function fromSkyfallBlog(html: string, base: string, source: SourceRow): Promise<Candidate[]> {
  const $ = cheerio.load(html);
  const entry = $('script[type="module"][src]').first().attr("src");
  if (!entry) throw new FetchError("skyfall_blog: no module entry");
  const entryUrl = asset(entry, base);
  const main = await script(entryUrl);
  const chunk = /import\((["'`])(\.\/BlogPage-[\w-]+\.js)\1\)/.exec(main)?.[2];
  if (!chunk) throw new FetchError("skyfall_blog: no blog chunk in the module entry");
  const blogUrl = asset(chunk, entryUrl);
  const blog = await script(blogUrl);
  const headers = [...blog.matchAll(new RegExp(String.raw`\{slug:(${STRING}),title:(${STRING}),author:(${STRING}),date:(${STRING}),iso:(${STRING}),`, "g"))];
  const out: Candidate[] = [];
  for (let i = 0; i < headers.length; i++) {
    const match = headers[i]!;
    const slug = literal(match[1]!);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
    const section = blog.slice(match.index! + match[0].length, headers[i + 1]?.index);
    const field = (key: string) => {
      const value = new RegExp(String.raw`\b${key}:(${STRING})`).exec(section)?.[1];
      return value ? literal(value) : "";
    };
    const url = new URL(`/blog/${slug}`, base).toString();
    if (source.config.allowUrlPrefixes?.length && !source.config.allowUrlPrefixes.some((prefix: string) => url.startsWith(prefix))) continue;
    const date = readPublicationDate(literal(match[5]!), source.config.publishedAtUtcOffset);
    if (!date.publishedAt) throw new FetchError(`skyfall_blog: invalid date for ${slug}`);
    let body = field("html");
    // Embedded articles use a separate exported HTML literal, named by the blog's own chunk map.
    if (!body) {
      const mapping = blog.indexOf(`../../blog-embeds/${slug}/article.html`);
      const file = mapping < 0 ? null : /import\((["'`])(\.\/article-[\w-]+\.js)\1\)/.exec(blog.slice(mapping, mapping + 240))?.[2];
      if (file) {
        const embedded = await script(asset(file, blogUrl));
        const value = new RegExp(String.raw`^\s*(?:var|const|let)\s+(\w+)=(${STRING});?\s*export\{\1 as default\};?\s*$`).exec(embedded)?.[2];
        if (!value) throw new FetchError(`skyfall_blog: no static article HTML for ${slug}`);
        body = literal(value);
      }
    }
    const clean = body ? sanitizeBody(body, url) : "";
    out.push({ url, title: collapseWhitespace(literal(match[2]!)), author: literal(match[3]!), ...date,
      excerpt: collapseWhitespace(field("excerpt")) || null,
      ...(clean ? { bodyHtml: clean, bodyText: stripTags(clean), bodyStatus: "ok" as const } : {}) });
  }
  if (!out.length) throw new FetchError("skyfall_blog: no dated posts in the blog chunk");
  return out;
}
