import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the site links every production feed at its root URL", async () => {
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
  for (const fileName of [
    "tw-essential.ics",
    "tw-public-holidays.ics",
    "tw-traditional.ics",
    "tw-modern.ics"
  ]) {
    assert.ok(html.includes(`https://calendar.laurancelin.com/${fileName}`));
    assert.ok(html.includes(`webcal://calendar.laurancelin.com/${fileName}`));
  }
  assert.match(html, /本日曆並非台灣政府官方日曆/);
  assert.match(html, /2026 至 2125/);
});

test("the Pages workflow gates deployment on a successful build", async () => {
  const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /needs: build/);
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /environment:\s+name: github-pages/);
});
