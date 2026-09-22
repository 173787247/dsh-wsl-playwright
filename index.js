import { pwStatus, pwFetch } from "./lib/pw.js";

export const name = "dsh-wsl-playwright";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-playwright] disabled");
    return;
  }
  const timeoutMs = positive(config.timeoutMs, 90_000);
  const maxChars = positive(config.maxChars, 30_000);
  console.log("[dsh-wsl-playwright] headless fetch only");

  ctx.systemPrompt.section({
    name: "tool:playwright-wsl",
    order: 138,
    text: "dsh-wsl-playwright does headless Chromium fetch in WSL (pw_fetch). For interactive Windows browsing prefer dsh-wsl-browser. Do not drive both on the same task. First run may download Playwright browsers via npx.",
  });

  ctx.tools.register({
    name: "pw_status",
    description: "Whether npx/node available for Playwright headless runs.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v) }] },
    timeoutMs: 5_000,
    isConcurrencySafe: () => true,
    async execute() {
      return pwStatus();
    },
    presentCall: () => ({ card: "generic", title: "pw status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "pw status", content: r.content }),
  });

  ctx.tools.register({
    name: "pw_fetch",
    description: "Headless open an http(s) URL; return title + body text (capped). Slow; may download browsers once.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["url"],
      properties: { url: { type: "string" } },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [
        { type: "text", text: v.ok === false ? v.error : `title=${v.title}\n\n${v.text || ""}` },
      ],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await pwFetch({ url: args.url, timeoutMs, maxChars });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "pw fetch" }),
    presentResult: (_a, r) => ({ card: "generic", title: "pw fetch", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}
