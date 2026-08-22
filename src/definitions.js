import { readFile } from "node:fs/promises";

const DATA_FILES = [
  new URL("../data/public-holidays.json", import.meta.url),
  new URL("../data/traditional.json", import.meta.url),
  new URL("../data/modern.json", import.meta.url)
];

function validateSource(source) {
  if (!source.id || !source.calendarName || !Array.isArray(source.events)) {
    throw new Error("Each source needs an id, calendarName, and events array.");
  }

  for (const event of source.events) {
    if (!event.id || !event.summary || !event.rule?.type) {
      throw new Error(`Invalid event definition in ${source.id}.`);
    }
  }
}

export async function loadDefinitions() {
  const sources = await Promise.all(
    DATA_FILES.map(async (file) => JSON.parse(await readFile(file, "utf8")))
  );

  const sourceIds = new Set();
  const eventIds = new Set();

  for (const source of sources) {
    validateSource(source);
    if (sourceIds.has(source.id)) {
      throw new Error(`Duplicate source id: ${source.id}`);
    }
    sourceIds.add(source.id);

    for (const event of source.events) {
      if (eventIds.has(event.id)) {
        throw new Error(`Duplicate event id: ${event.id}`);
      }
      eventIds.add(event.id);
    }
  }

  return sources;
}
