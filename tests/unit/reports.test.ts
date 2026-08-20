import assert from "node:assert/strict";
import test from "node:test";
import type { Recommendation } from "../../src/domain/types.js";
import { generateMarkdownReport } from "../../src/reports/markdownReport.js";

test("generateMarkdownReport includes recommendation details", () => {
  const recommendations: Recommendation[] = [
    {
      job: {
        id: "1",
        platform: "upwork",
        title: "Senior Java API",
        description: "Build API",
        url: "https://example.com",
        budgetType: "hourly",
        budgetMin: 40,
        budgetMax: 60,
        currency: "USD",
        experienceLevel: "expert",
        detectedSkills: ["Java"],
      },
      score: 90,
      summary: "Build API",
      matchReasons: ["Java"],
      warnings: [],
      analyzedAt: "2026-06-10T00:00:00.000Z",
    },
  ];

  const markdown = generateMarkdownReport(recommendations);

  assert.match(markdown, /Senior Java API/);
  assert.match(markdown, /Score: 90\/100/);
});
