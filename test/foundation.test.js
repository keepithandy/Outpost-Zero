import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("provides the primary application landmarks", () => {
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /id="outpost-summary"/);
  assert.match(html, /id="resource-list"/);
  assert.match(html, /id="event-timeline"/);
});

test("loads only local styles and JavaScript", () => {
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/src\/main\.js"/);
  assert.doesNotMatch(html, /https?:\/\//);
});
