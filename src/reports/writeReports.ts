import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Recommendation } from "../domain/types.js";
import { generateJsonReport } from "./jsonReport.js";
import { generateMarkdownReport } from "./markdownReport.js";

export type ReportPaths = {
  markdownPath: string;
  jsonPath: string;
};

export async function writeReports(
  recommendations: Recommendation[],
  paths: ReportPaths,
): Promise<void> {
  await mkdir(dirname(paths.markdownPath), { recursive: true });
  await mkdir(dirname(paths.jsonPath), { recursive: true });
  await writeFile(paths.markdownPath, generateMarkdownReport(recommendations), "utf8");
  await writeFile(paths.jsonPath, generateJsonReport(recommendations), "utf8");
}
