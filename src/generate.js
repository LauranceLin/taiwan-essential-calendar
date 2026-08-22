import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createFeeds } from "./events.js";
import { serializeCalendar } from "./ics.js";

export async function generateCalendars({ outDir = "dist", startYear, endYear } = {}) {
  const feeds = await createFeeds({ startYear, endYear });
  await mkdir(outDir, { recursive: true });

  for (const feed of Object.values(feeds)) {
    await writeFile(path.join(outDir, feed.fileName), serializeCalendar(feed), "utf8");
  }

  return feeds;
}
