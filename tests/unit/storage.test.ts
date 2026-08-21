import assert from "node:assert/strict";
import test from "node:test";
import type { JobOpportunity, Recommendation, UserProfile } from "../../src/domain/types.js";
import { openDatabase } from "../../src/storage/db.js";
import { StorageRepositories } from "../../src/storage/repositories.js";

const profile: UserProfile = {
  name: "Nicodemos",
  title: "Senior Software Developer",
  technologies: ["Java", "Spring Boot", "Node.js"],
  experienceYears: 17,
  englishLevel: "intermediate",
  minimumHourlyRate: 35,
  preferredJobTypes: ["backend", "api"],
  avoid: ["wordpress"],
};

const job: JobOpportunity = {
  id: "upwork-1",
  platform: "upwork",
  externalId: "upwork-1",
  title: "Spring Boot API Developer",
  description: "Build REST APIs with Spring Boot and PostgreSQL.",
  url: "https://example.com/jobs/upwork-1",
  budgetType: "hourly",
  budgetMin: 40,
  budgetMax: 60,
  currency: "USD",
  experienceLevel: "expert",
  detectedSkills: ["Spring Boot", "PostgreSQL"],
};

test("persistRun saves recommendations and reuses existing jobs", () => {
  const db = openDatabase(":memory:");
  const repositories = new StorageRepositories(db);
  const recommendation = recommendationFor(job);

  const firstRun = repositories.persistRun(profile, [job], [recommendation]);
  const secondRun = repositories.persistRun(profile, [job], [recommendation]);

  assert.equal(firstRun.insertedJobs, 1);
  assert.equal(firstRun.reusedJobs, 0);
  assert.equal(secondRun.insertedJobs, 0);
  assert.equal(secondRun.reusedJobs, 1);
  assert.equal(repositories.jobs.count(), 1);
  assert.equal(repositories.recommendations.count(), 2);

  db.close();
});

test("jobs without externalId are deduplicated by URL", () => {
  const db = openDatabase(":memory:");
  const repositories = new StorageRepositories(db);
  const firstJob = { ...job, id: "hash-a", externalId: undefined };
  const secondJob = { ...job, id: "hash-b", externalId: undefined, title: "Updated API Developer" };

  const firstSaved = repositories.jobs.save(firstJob);
  const secondSaved = repositories.jobs.save(secondJob);

  assert.equal(firstSaved.inserted, true);
  assert.equal(secondSaved.inserted, false);
  assert.equal(firstSaved.id, secondSaved.id);
  assert.equal(repositories.jobs.count(), 1);

  db.close();
});

function recommendationFor(opportunity: JobOpportunity): Recommendation {
  return {
    job: opportunity,
    score: 88,
    summary: "Strong backend match.",
    matchReasons: ["Matches Spring Boot"],
    warnings: [],
    analyzedAt: "2026-08-20T00:00:00.000Z",
  };
}
