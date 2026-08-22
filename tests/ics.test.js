import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import ICAL from "ical.js";
import { createFeeds } from "../src/events.js";
import { generateCalendars } from "../src/generate.js";
import { serializeCalendar } from "../src/ics.js";

const feeds = await createFeeds();

function parseEvents(contents) {
  const component = new ICAL.Component(ICAL.parse(contents));
  return component.getAllSubcomponents("vevent");
}

test("serialized calendars are deterministic", () => {
  for (const feed of Object.values(feeds)) {
    assert.equal(serializeCalendar(feed), serializeCalendar(feed));
  }
});

test("all generated feeds are valid UTF-8 and parse with ical.js", async (context) => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), "taiwan-calendar-"));
  context.after(() => rm(outDir, { recursive: true, force: true }));
  await generateCalendars({ outDir });

  for (const feed of Object.values(feeds)) {
    const bytes = await readFile(path.join(outDir, feed.fileName));
    const contents = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const events = parseEvents(contents);

    assert.equal(events.length, feed.events.length);
    assert.ok(contents.endsWith("\r\n"));
    assert.doesNotMatch(contents, /(?<!\r)\n/);
    assert.ok(contents.split("\r\n").every((line) => Buffer.byteLength(line, "utf8") <= 75));
    assert.doesNotMatch(contents, /RRULE/);
  }
});

test("all-day semantics, language, and summaries survive round-trip parsing", () => {
  const contents = serializeCalendar(feeds.essential);
  const events = parseEvents(contents);
  const parsedByUid = new Map(events.map((event) => [event.getFirstPropertyValue("uid"), event]));

  for (const sourceEvent of feeds.essential.events) {
    const parsed = parsedByUid.get(sourceEvent.uid);
    assert.ok(parsed, `Missing parsed event ${sourceEvent.uid}`);
    assert.equal(parsed.getFirstPropertyValue("summary"), sourceEvent.summary);
    assert.equal(parsed.getFirstProperty("summary").getParameter("language"), "zh-TW");
    assert.equal(parsed.getFirstPropertyValue("dtstart").isDate, true);
    assert.equal(parsed.getFirstPropertyValue("dtend").isDate, true);
    assert.equal(parsed.getFirstPropertyValue("transp"), "TRANSPARENT");
  }
});

test("DTEND is the exclusive day after DTSTART", () => {
  const parsed = parseEvents(serializeCalendar(feeds.public))[0];
  const start = parsed.getFirstPropertyValue("dtstart");
  const end = parsed.getFirstPropertyValue("dtend");
  assert.equal(start.toString(), "2026-01-01");
  assert.equal(end.toString(), "2026-01-02");
});

test("RFC TEXT escaping and UTF-8 line folding preserve content", () => {
  const summary = "測試，逗號, 分號; 反斜線\\ 與很長的繁體中文內容需要安全地跨越七十五位元組的限制";
  const customFeed = {
    calendarName: "測試, Calendar",
    description: "第一行\n第二行;仍然完整",
    events: [{
      uid: "serialization-test-2026-01-01@calendar.laurancelin.com",
      date: "2026-01-01",
      summary
    }]
  };
  const contents = serializeCalendar(customFeed);
  const parsed = parseEvents(contents)[0];

  assert.equal(parsed.getFirstPropertyValue("summary"), summary);
  assert.ok(contents.split("\r\n").every((line) => Buffer.byteLength(line, "utf8") <= 75));
});
