import { BUILD_TIMESTAMP, PRODID } from "./config.js";
import { addDays, compactDate } from "./date-calculation.js";

function escapeText(value) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(/\r?\n/g, "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function foldLine(line, byteLimit = 75) {
  const result = [];
  let current = "";
  let currentBytes = 0;

  for (const character of line) {
    const characterBytes = Buffer.byteLength(character, "utf8");
    if (currentBytes + characterBytes > byteLimit) {
      result.push(current);
      current = ` ${character}`;
      currentBytes = 1 + characterBytes;
    } else {
      current += character;
      currentBytes += characterBytes;
    }
  }

  result.push(current);
  return result;
}

export function serializeCalendar(feed) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(feed.calendarName)}`,
    `X-WR-CALDESC:${escapeText(feed.description)}`,
    "X-WR-TIMEZONE:Asia/Taipei"
  ];

  for (const event of feed.events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${BUILD_TIMESTAMP}`,
      `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
      `DTEND;VALUE=DATE:${compactDate(addDays(event.date, 1))}`,
      `SUMMARY;LANGUAGE=zh-TW:${escapeText(event.summary)}`,
      "TRANSP:TRANSPARENT",
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.flatMap((line) => foldLine(line)).join("\r\n")}\r\n`;
}
