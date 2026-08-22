import test from "node:test";
import assert from "node:assert/strict";
import lunarCalendar from "lunar-javascript";
import {
  addDays,
  lunarDate,
  nthWeekdayOfMonth,
  solarTermDate
} from "../src/date-calculation.js";

// Cross-checked against the Hong Kong Observatory Gregorian–Lunar Calendar
// Conversion Tables: https://www.hko.gov.hk/en/gts/time/conversion.htm
test("Chinese New Year matches representative authoritative dates", () => {
  assert.equal(lunarDate(2026, 1, 1), "2026-02-17");
  assert.equal(lunarDate(2033, 1, 1), "2033-01-31");
  assert.equal(lunarDate(2044, 1, 1), "2044-01-30");
  assert.equal(lunarDate(2099, 1, 1), "2099-01-21");
});

test("lunar New Year offsets handle variable lunar-year lengths", () => {
  const newYear = lunarDate(2026, 1, 1);
  assert.equal(addDays(newYear, -2), "2026-02-15");
  assert.equal(addDays(newYear, -1), "2026-02-16");
  assert.equal(addDays(newYear, 2), "2026-02-19");
});

test("representative lunar festivals match the 2026 conversion table", () => {
  assert.equal(lunarDate(2026, 1, 15), "2026-03-03");
  assert.equal(lunarDate(2026, 5, 5), "2026-06-19");
  assert.equal(lunarDate(2026, 7, 7), "2026-08-19");
  assert.equal(lunarDate(2026, 7, 15), "2026-08-27");
  assert.equal(lunarDate(2026, 8, 15), "2026-09-25");
  assert.equal(lunarDate(2026, 9, 9), "2026-10-18");
});

test("festival rules use the regular lunar month when a leap month exists", () => {
  const leapSeventhMonth = lunarCalendar.Lunar.fromYmd(2044, -7, 7).getSolar().toYmd();
  assert.equal(lunarCalendar.LunarYear.fromYear(2044).getLeapMonth(), 7);
  assert.equal(lunarDate(2044, 7, 7), "2044-07-31");
  assert.equal(leapSeventhMonth, "2044-08-29");
  assert.notEqual(lunarDate(2044, 7, 7), leapSeventhMonth);
});

test("Qingming and winter solstice match published solar-term dates", () => {
  assert.equal(
    solarTermDate(2026, { term: "清明", month: 4, searchStart: 3, searchEnd: 6 }),
    "2026-04-05"
  );
  assert.equal(
    solarTermDate(2026, { term: "冬至", month: 12, searchStart: 20, searchEnd: 23 }),
    "2026-12-22"
  );
  assert.equal(
    solarTermDate(2044, { term: "清明", month: 4, searchStart: 3, searchEnd: 6 }),
    "2044-04-04"
  );
  assert.equal(
    solarTermDate(2044, { term: "冬至", month: 12, searchStart: 20, searchEnd: 23 }),
    "2044-12-21"
  );
});

test("Mother's Day is the second Sunday in May", () => {
  assert.equal(nthWeekdayOfMonth(2026, 5, 0, 2), "2026-05-10");
  assert.equal(nthWeekdayOfMonth(2032, 5, 0, 2), "2032-05-09");
});

test("Gregorian arithmetic handles leap years and year boundaries", () => {
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2028-02-29", 1), "2028-03-01");
  assert.equal(addDays("2124-12-31", 1), "2125-01-01");
});
