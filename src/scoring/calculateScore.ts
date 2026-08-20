import type { JobOpportunity, Recommendation, UserProfile } from "../domain/types.js";
import { explainScore } from "./explainScore.js";

export type ScoreBreakdown = {
  technologyMatch: number;
  seniorityMatch: number;
  budgetMatch: number;
  jobTypeMatch: number;
  qualitySignals: number;
  redFlagPenalty: number;
  matchedTechnologies: string[];
  matchedJobTypes: string[];
  redFlags: string[];
  positiveSignals: string[];
};

export function calculateRecommendation(
  profile: UserProfile,
  job: JobOpportunity,
  analyzedAt = new Date().toISOString(),
): Recommendation {
  const breakdown = calculateScoreBreakdown(profile, job);
  const score = clampScore(
    breakdown.technologyMatch * 40 +
      breakdown.seniorityMatch * 20 +
      breakdown.budgetMatch * 15 +
      breakdown.jobTypeMatch * 15 +
      breakdown.qualitySignals * 10 -
      breakdown.redFlagPenalty,
  );
  const explanation = explainScore(profile, job, breakdown, score);

  return {
    job,
    score,
    summary: createSummary(job),
    matchReasons: explanation.matchReasons,
    warnings: explanation.warnings,
    analyzedAt,
  };
}

export function calculateScoreBreakdown(
  profile: UserProfile,
  job: JobOpportunity,
): ScoreBreakdown {
  const jobText = normalize(`${job.title} ${job.description} ${job.detectedSkills.join(" ")}`);
  const profileTechnologies = profile.technologies.map(normalize);
  const matchedTechnologies = profile.technologies.filter((technology, index) => {
    const normalizedTechnology = profileTechnologies[index];
    return jobText.includes(normalizedTechnology);
  });

  const technologyMatch =
    profile.technologies.length === 0 ? 0 : matchedTechnologies.length / profile.technologies.length;

  const seniorityMatch = matchSeniority(profile, job);
  const budgetMatch = matchBudget(profile, job);
  const matchedJobTypes = profile.preferredJobTypes.filter((jobType) =>
    jobText.includes(normalize(jobType)),
  );
  const jobTypeMatch =
    profile.preferredJobTypes.length === 0
      ? 0
      : Math.min(1, matchedJobTypes.length / Math.min(2, profile.preferredJobTypes.length));

  const redFlags = detectRedFlags(profile, job, jobText);
  const positiveSignals = detectPositiveSignals(job, jobText);

  return {
    technologyMatch,
    seniorityMatch,
    budgetMatch,
    jobTypeMatch,
    qualitySignals: Math.min(1, positiveSignals.length / 3),
    redFlagPenalty: Math.min(35, redFlags.length * 8),
    matchedTechnologies,
    matchedJobTypes,
    redFlags,
    positiveSignals,
  };
}

function matchSeniority(profile: UserProfile, job: JobOpportunity): number {
  if (job.experienceLevel === "expert") return profile.experienceYears >= 8 ? 1 : 0.7;
  if (job.experienceLevel === "intermediate") return profile.experienceYears >= 3 ? 0.8 : 0.5;
  if (job.experienceLevel === "entry") return profile.experienceYears >= 8 ? 0.25 : 0.6;
  return 0.45;
}

function matchBudget(profile: UserProfile, job: JobOpportunity): number {
  if (job.budgetType !== "hourly") return 0.45;
  const bestHourlyRate = job.budgetMax ?? job.budgetMin;
  if (bestHourlyRate === undefined) return 0.35;
  if (bestHourlyRate >= profile.minimumHourlyRate) return 1;

  return Math.max(0, bestHourlyRate / profile.minimumHourlyRate);
}

function detectRedFlags(profile: UserProfile, job: JobOpportunity, jobText: string): string[] {
  const flags = new Set<string>();
  for (const avoided of profile.avoid) {
    if (jobText.includes(normalize(avoided))) {
      flags.add(`mentions avoided term: ${avoided}`);
    }
  }

  const weakTerms = ["cheap", "low budget", "more work later", "urgent", "crypto payment"];
  for (const term of weakTerms) {
    if (jobText.includes(term)) flags.add(term);
  }

  if (job.budgetType === "hourly" && (job.budgetMax ?? job.budgetMin ?? 0) < profile.minimumHourlyRate) {
    flags.add("hourly rate below minimum");
  }
  if (job.budgetType === "fixed") flags.add("fixed price requires manual review");
  if (job.url === "unknown") flags.add("missing job URL");

  return [...flags];
}

function detectPositiveSignals(job: JobOpportunity, jobText: string): string[] {
  const signals = new Set<string>();
  const terms = [
    "clear specs",
    "weekly milestones",
    "remote",
    "async",
    "documentation",
    "clean error handling",
    "rest api",
    "integration",
  ];

  for (const term of terms) {
    if (jobText.includes(term)) signals.add(term);
  }
  if (job.budgetType === "hourly" && (job.budgetMax ?? 0) >= 40) {
    signals.add("strong hourly budget");
  }
  if (job.experienceLevel === "expert") signals.add("expert-level role");

  return [...signals];
}

function createSummary(job: JobOpportunity): string {
  const description = job.description.trim().replace(/\s+/g, " ");
  if (description.length <= 180) return description;
  return `${description.slice(0, 177)}...`;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
