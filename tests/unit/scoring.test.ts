import assert from "node:assert/strict";
import test from "node:test";
import type { JobOpportunity, UserProfile } from "../../src/domain/types.js";
import { calculateRecommendation } from "../../src/scoring/calculateScore.js";

const profile: UserProfile = {
  name: "Nicodemos",
  title: "Senior Software Developer",
  technologies: ["Java", "Spring Boot", "Node.js", "React", "PostgreSQL", "Docker"],
  experienceYears: 17,
  englishLevel: "intermediate",
  minimumHourlyRate: 35,
  preferredJobTypes: ["backend", "fullstack", "api", "integration"],
  avoid: ["wordpress", "crypto scam"],
};

test("calculateRecommendation gives high score for strong backend match", () => {
  const job: JobOpportunity = {
    id: "1",
    platform: "upwork",
    title: "Senior Java Spring Boot API Developer",
    description: "REST API backend with Java, Spring Boot, PostgreSQL and Docker. Clear specs.",
    url: "https://example.com",
    budgetType: "hourly",
    budgetMin: 40,
    budgetMax: 60,
    currency: "USD",
    experienceLevel: "expert",
    detectedSkills: ["Java", "Spring Boot", "REST API", "Docker"],
  };

  const recommendation = calculateRecommendation(profile, job, "2026-06-10T00:00:00.000Z");

  assert.ok(recommendation.score >= 75);
  assert.ok(recommendation.matchReasons.some((reason) => reason.includes("Java")));
});

test("calculateRecommendation penalizes avoided low-budget work", () => {
  const job: JobOpportunity = {
    id: "2",
    platform: "upwork",
    title: "Cheap WordPress fix",
    description: "Low budget WordPress job with crypto payment.",
    url: "https://example.com",
    budgetType: "fixed",
    budgetMax: 50,
    currency: "USD",
    experienceLevel: "entry",
    detectedSkills: ["WordPress"],
  };

  const recommendation = calculateRecommendation(profile, job, "2026-06-10T00:00:00.000Z");

  assert.ok(recommendation.score < 45);
  assert.ok(recommendation.warnings.length > 0);
});
