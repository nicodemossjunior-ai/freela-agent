import assert from "node:assert/strict";
import test from "node:test";
import { deduplicateJobs, normalizeUpworkJob } from "../../src/platforms/upwork/upwork.parser.js";

test("normalizeUpworkJob fills missing values safely", () => {
  const job = normalizeUpworkJob({});

  assert.equal(job.platform, "upwork");
  assert.equal(job.title, "Untitled Upwork opportunity");
  assert.equal(job.budgetType, "unknown");
  assert.deepEqual(job.detectedSkills, []);
});

test("deduplicateJobs removes repeated external IDs", () => {
  const first = normalizeUpworkJob({ externalId: "same", title: "A", url: "https://example.com/a" });
  const second = normalizeUpworkJob({ externalId: "same", title: "B", url: "https://example.com/b" });

  assert.equal(deduplicateJobs([first, second]).length, 1);
});
