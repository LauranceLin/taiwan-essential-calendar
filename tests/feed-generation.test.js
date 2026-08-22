import test from "node:test";
import assert from "node:assert/strict";
import { createFeeds } from "../src/events.js";

const feeds = await createFeeds();

test("all feeds cover 2026 through 2125", () => {
  assert.equal(feeds.public.events.length, 16 * 100);
  assert.equal(feeds.traditional.events.length, 5 * 100);
  assert.equal(feeds.modern.events.length, 5 * 100);
  assert.equal(feeds.essential.events.length, 26 * 100);

  for (const feed of Object.values(feeds)) {
    for (const event of feed.events) {
      assert.match(event.date, /^20\d\d-|^21\d\d-/);
      const year = Number(event.date.slice(0, 4));
      assert.ok(year >= 2026 && year <= 2125, `${event.summary} is out of range`);
    }
  }
});

test("Modern and Essential exclude New Year's Eve", () => {
  assert.ok(feeds.modern.events.every((event) => event.summary !== "跨年夜"));
  assert.ok(feeds.essential.events.every((event) => event.summary !== "跨年夜"));
});

test("Essential is exactly the union of the three component feeds", () => {
  const componentUids = [
    ...feeds.public.events,
    ...feeds.traditional.events,
    ...feeds.modern.events
  ].map((event) => event.uid).toSorted();
  const essentialUids = feeds.essential.events.map((event) => event.uid).toSorted();
  assert.deepEqual(essentialUids, componentUids);
});

test("same-day events remain distinct in Essential", () => {
  for (let year = 2026; year <= 2125; year += 1) {
    const christmas = feeds.essential.events.filter((event) => event.date === `${year}-12-25`);
    assert.deepEqual(
      christmas.map((event) => event.summary).toSorted(),
      ["行憲紀念日", "聖誕節"].toSorted()
    );
    assert.notEqual(christmas[0].uid, christmas[1].uid);
  }
});

test("Traditional does not duplicate holidays assigned to Public Holidays", () => {
  const excluded = new Set([
    "小年夜", "除夕", "正月初一", "正月初二", "正月初三", "清明節", "端午節", "中秋節"
  ]);
  assert.ok(feeds.traditional.events.every((event) => !excluded.has(event.summary)));
});

test("UIDs are unique within every feed and stable between builds", async () => {
  for (const feed of Object.values(feeds)) {
    const uids = feed.events.map((event) => event.uid);
    assert.equal(new Set(uids).size, uids.length);
    assert.ok(uids.every((uid) => uid.endsWith("@calendar.laurancelin.com")));
  }

  const secondBuild = await createFeeds();
  for (const id of Object.keys(feeds)) {
    assert.deepEqual(
      secondBuild[id].events.map((event) => event.uid),
      feeds[id].events.map((event) => event.uid)
    );
  }
});

test("the final supported year generates lunar and solar events", () => {
  const lastYearEvents = feeds.essential.events.filter((event) => event.date.startsWith("2125-"));
  assert.equal(lastYearEvents.length, 26);
  assert.ok(lastYearEvents.some((event) => event.summary === "正月初一" && event.date === "2125-02-03"));
  assert.ok(lastYearEvents.some((event) => event.summary === "清明節"));
  assert.ok(lastYearEvents.some((event) => event.summary === "冬至"));
});
