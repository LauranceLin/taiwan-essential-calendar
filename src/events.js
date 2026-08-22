import { END_YEAR, FEEDS, START_YEAR, UID_DOMAIN } from "./config.js";
import { dateForRule } from "./date-calculation.js";
import { loadDefinitions } from "./definitions.js";

function sortEvents(events) {
  return events.toSorted((left, right) => {
    if (left.date !== right.date) {
      return left.date < right.date ? -1 : 1;
    }
    if (left.uid !== right.uid) {
      return left.uid < right.uid ? -1 : 1;
    }
    return 0;
  });
}

function expandSource(source, startYear, endYear) {
  const events = [];

  for (let year = startYear; year <= endYear; year += 1) {
    for (const definition of source.events) {
      const date = dateForRule(year, definition.rule);
      const gregorianYear = Number(date.slice(0, 4));
      if (gregorianYear < startYear || gregorianYear > endYear) {
        throw new Error(`${definition.summary} generated outside the supported range: ${date}`);
      }

      events.push(Object.freeze({
        id: definition.id,
        sourceId: source.id,
        summary: definition.summary,
        date,
        uid: `${definition.id}-${date}@${UID_DOMAIN}`
      }));
    }
  }

  return sortEvents(events);
}

export async function createFeeds({ startYear = START_YEAR, endYear = END_YEAR } = {}) {
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear > endYear) {
    throw new Error("The requested year range is invalid.");
  }

  const sources = await loadDefinitions();
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const feeds = {};

  for (const feed of Object.values(FEEDS).filter((item) => item.sourceId)) {
    const source = sourcesById.get(feed.sourceId);
    if (!source) {
      throw new Error(`Missing definition source: ${feed.sourceId}`);
    }
    feeds[feed.id] = Object.freeze({
      ...feed,
      calendarName: source.calendarName,
      description: source.description,
      events: expandSource(source, startYear, endYear)
    });
  }

  feeds.essential = Object.freeze({
    ...FEEDS.essential,
    events: sortEvents([
      ...feeds.public.events,
      ...feeds.traditional.events,
      ...feeds.modern.events
    ])
  });

  return Object.freeze(feeds);
}
