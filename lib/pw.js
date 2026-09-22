import { spawn } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function which(cmd) {
  const safe = String(cmd || "").replace(/[^a-zA-Z0-9._+-]/g, "");
  if (!safe) return Promise.resolve("");
  return new Promise((r) => {
    const child = spawn("bash", ["-lc", `command -v ${safe}`], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", (c) => r(c === 0 ? out.trim() : ""));
  });
}

export function assertUrl(url) {
  const u = String(url || "").trim();
  if (!u || u.length > 2000) throw new Error("invalid url");
  let parsed;
  try {
    parsed = new URL(u);
  } catch {
    throw new Error("invalid url");
  }
  if (!/^https?:$/i.test(parsed.protocol)) throw new Error("only http(s) urls");
  return u;
}

export function run(bin, args, { timeoutMs = 90_000, maxOut = 120_000 } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const t = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      stdout += d;
      if (stdout.length > maxOut * 2) child.kill("SIGKILL");
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => {
      clearTimeout(t);
      resolvePromise({
        code,
        stdout: stdout.slice(0, maxOut),
        stderr: stderr.slice(0, 8000),
        truncated: stdout.length > maxOut,
      });
    });
    child.on("error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function pwStatus() {
  return {
    ok: true,
    npx: (await which("npx")) || null,
    node: (await which("node")) || null,
    note: "Headless Chromium via npx -p playwright. First run may download browsers. Prefer Windows dsh-wsl-browser for GUI; use this for WSL-side automation only.",
  };
}

export async function pwFetch({ url, timeoutMs = 90_000, maxChars = 30_000 } = {}) {
  const u = assertUrl(url);
  const npx = (await which("npx")) || "npx";
  const dir = mkdtempSync(join(tmpdir(), "dsh-pw-"));
  const script = join(dir, "fetch.mjs");
  writeFileSync(
    script,
    `
import { chromium } from 'playwright';
const url = process.argv[2];
const max = Number(process.argv[3] || 30000);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const title = await page.title();
  let text = '';
  try { text = await page.locator('body').innerText({ timeout: 10000 }); } catch {}
  text = String(text || '').slice(0, max);
  process.stdout.write(JSON.stringify({ ok: true, url, title, chars: text.length, text }));
} catch (e) {
  process.stdout.write(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
  process.exitCode = 1;
} finally {
  await browser.close();
}
`,
  );
  try {
    const r = await run(npx, ["--yes", "-p", "playwright", "node", script, u, String(maxChars)], {
      timeoutMs,
      maxOut: maxChars + 8000,
    });
    const line = r.stdout.trim();
    if (!line) throw new Error(`playwright empty output: ${r.stderr || r.code}`);
    let json;
    try {
      json = JSON.parse(line);
    } catch {
      throw new Error(`playwright non-JSON: ${line.slice(0, 200)} ${r.stderr}`);
    }
    if (json.ok === false) throw new Error(json.error || "playwright failed");
    return json;
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      try {
        unlinkSync(script);
      } catch {
        /* ignore */
      }
    }
  }
}
