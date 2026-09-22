import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertUrl } from "../lib/pw.js";
describe("pw", () => {
  it("url", () => assert.ok(assertUrl("https://example.com")));
  it("bad", () => assert.throws(() => assertUrl("file:///x"), /http/));
});
