import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCalendars } from "../src/generate.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "dist");
const feeds = await generateCalendars({ outDir });

for (const feed of Object.values(feeds)) {
  console.log(`${feed.fileName}: ${feed.events.length} events`);
}
