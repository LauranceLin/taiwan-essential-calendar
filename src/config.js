export const START_YEAR = 2026;
export const END_YEAR = 2125;
export const UID_DOMAIN = "calendar.laurancelin.com";
export const PRODID = "-//calendar.laurancelin.com//Taiwan Essential Calendar//ZH-TW";
export const BUILD_TIMESTAMP = "20260101T000000Z";

export const FEEDS = Object.freeze({
  public: Object.freeze({
    id: "public",
    fileName: "tw-public-holidays.ics",
    sourceId: "public-holidays"
  }),
  traditional: Object.freeze({
    id: "traditional",
    fileName: "tw-traditional.ics",
    sourceId: "traditional"
  }),
  modern: Object.freeze({
    id: "modern",
    fileName: "tw-modern.ics",
    sourceId: "modern"
  }),
  essential: Object.freeze({
    id: "essential",
    fileName: "tw-essential.ics",
    calendarName: "Taiwan Essential",
    description: "Public holidays, traditional festivals, and modern observances curated for everyday life in Taiwan."
  })
});
