import lunarCalendar from "lunar-javascript";

const { Lunar, Solar } = lunarCalendar;

function pad(number) {
  return String(number).padStart(2, "0");
}

export function formatDate(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function compactDate(date) {
  return date.replaceAll("-", "");
}

export function addDays(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return formatDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
}

export function lunarDate(lunarYear, month, day) {
  const solar = Lunar.fromYmd(lunarYear, month, day).getSolar();
  return formatDate(solar.getYear(), solar.getMonth(), solar.getDay());
}

export function solarTermDate(year, { term, month, searchStart, searchEnd }) {
  for (let day = searchStart; day <= searchEnd; day += 1) {
    const solar = Solar.fromYmd(year, month, day);
    if (solar.getLunar().getJieQi() === term) {
      return formatDate(year, month, day);
    }
  }

  throw new Error(`Could not find solar term ${term} in ${year}.`);
}

export function nthWeekdayOfMonth(year, month, weekday, nth) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
  return formatDate(year, month, day);
}

export function dateForRule(year, rule) {
  switch (rule.type) {
    case "gregorian":
      return formatDate(year, rule.month, rule.day);
    case "lunar":
      return lunarDate(year, rule.month, rule.day);
    case "lunar-new-year-offset":
      return addDays(lunarDate(year, 1, 1), rule.days);
    case "solar-term":
      return solarTermDate(year, rule);
    case "nth-weekday":
      return nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.nth);
    default:
      throw new Error(`Unsupported date rule: ${rule.type}`);
  }
}
