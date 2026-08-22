import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateCalendars } from "../src/generate.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const siteDir = path.join(projectRoot, "site");
const outputDir = path.join(projectRoot, "_site");

await rm(distDir, { recursive: true, force: true });
await rm(outputDir, { recursive: true, force: true });
await generateCalendars({ outDir: distDir });
await mkdir(outputDir, { recursive: true });
await cp(siteDir, outputDir, { recursive: true });
await cp(distDir, outputDir, { recursive: true });
await writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");

console.log(`Built GitHub Pages artifact at ${outputDir}`);
