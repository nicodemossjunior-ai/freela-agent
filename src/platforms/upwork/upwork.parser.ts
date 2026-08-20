import { createHash } from "node:crypto";
import type { BudgetType, ExperienceLevel, JobOpportunity } from "../../domain/types.js";
import type { RawUpworkJob } from "./upwork.types.js";

export function normalizeUpworkJob(raw: RawUpworkJob): JobOpportunity {
  const url = raw.url?.trim() || "unknown";
  const externalId = raw.externalId?.trim() || undefined;

  return {
    id: externalId ?? hashId(url),
    platform: "upwork",
    externalId,
    title: raw.title?.trim() || "Untitled Upwork opportunity",
    description: raw.description?.trim() || "",
    url,
    budgetType: normalizeBudgetType(raw.budget?.type),
    budgetMin: numberOrUndefined(raw.budget?.min),
    budgetMax: numberOrUndefined(raw.budget?.max),
    currency: "USD",
    experienceLevel: normalizeExperienceLevel(raw.experienceLevel),
    postedAt: raw.postedAt,
    detectedSkills: normalizeSkills(raw.skills),
    rawData: raw,
  };
}

export function deduplicateJobs(jobs: JobOpportunity[]): JobOpportunity[] {
  const seen = new Set<string>();
  const result: JobOpportunity[] = [];

  for (const job of jobs) {
    const key = job.externalId ? `external:${job.externalId}` : `url:${job.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(job);
  }

  return result;
}

function hashId(value: string): string {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function normalizeBudgetType(value: unknown): BudgetType {
  return value === "hourly" || value === "fixed" ? value : "unknown";
}

function normalizeExperienceLevel(value: unknown): ExperienceLevel {
  if (value === "entry" || value === "intermediate" || value === "expert") {
    return value;
  }
  return "unknown";
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}
