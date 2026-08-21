#!/usr/bin/env node
import { performance } from "node:perf_hooks";
import { HelpRequested, parseArgs } from "./cli/args.js";
import { loadProfile, ProfileValidationError } from "./config/loadProfile.js";
import { calculateRecommendation } from "./scoring/calculateScore.js";
import { rankRecommendations } from "./scoring/rankRecommendations.js";
import { deduplicateJobs, normalizeUpworkJob } from "./platforms/upwork/upwork.parser.js";
import { searchMockUpworkJobs } from "./platforms/upwork/upwork.search.js";
import { writeReports } from "./reports/writeReports.js";
import { openDatabase } from "./storage/db.js";
import { StorageRepositories } from "./storage/repositories.js";

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const startedAt = performance.now();
  const options = parseArgs(argv);

  if (!options.mock) {
    throw new Error("Only --mock mode is implemented in the current MVP.");
  }

  const profile = await loadProfile(options.profilePath);
  const rawJobs = await searchMockUpworkJobs(profile, options.limit);
  const normalizedJobs = rawJobs.map(normalizeUpworkJob);
  const uniqueJobs = deduplicateJobs(normalizedJobs);
  const recommendations = uniqueJobs.map((job) => calculateRecommendation(profile, job));
  const ranked = rankRecommendations(recommendations, options.minScore, options.top);
  const db = openDatabase(options.databasePath);
  const persistence = new StorageRepositories(db).persistRun(profile, uniqueJobs, ranked);
  db.close();

  await writeReports(ranked, {
    markdownPath: options.markdownPath,
    jsonPath: options.jsonPath,
  });

  const elapsedMs = Math.round(performance.now() - startedAt);
  console.log(`Profile: ${profile.name} (${profile.title})`);
  console.log(`Collected jobs: ${rawJobs.length}`);
  console.log(`Normalized unique jobs: ${uniqueJobs.length}`);
  console.log(`Recommendations: ${ranked.length}`);
  console.log(`SQLite database: ${options.databasePath}`);
  console.log(`Persisted jobs: ${persistence.savedJobs} (${persistence.insertedJobs} new, ${persistence.reusedJobs} reused)`);
  console.log(`Persisted recommendations: ${persistence.savedRecommendations}`);
  console.log(`Markdown report: ${options.markdownPath}`);
  console.log(`JSON report: ${options.jsonPath}`);
  console.log(`Elapsed: ${elapsedMs}ms`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error: unknown) => {
    if (error instanceof HelpRequested) {
      console.log(error.message);
      process.exitCode = 0;
      return;
    }

    if (error instanceof ProfileValidationError) {
      console.error(error.message);
      if (error.missingFields.length > 0) {
        console.error(`Missing fields: ${error.missingFields.join(", ")}`);
      }
      process.exitCode = 1;
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
