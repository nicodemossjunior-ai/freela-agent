import type { JobOpportunity, UserProfile } from "../domain/types.js";
import type { ScoreBreakdown } from "./calculateScore.js";

export type ScoreExplanation = {
  matchReasons: string[];
  warnings: string[];
};

export function explainScore(
  profile: UserProfile,
  job: JobOpportunity,
  breakdown: ScoreBreakdown,
  score: number,
): ScoreExplanation {
  const matchReasons: string[] = [];
  const warnings: string[] = [];

  if (breakdown.matchedTechnologies.length > 0) {
    matchReasons.push(`Matches technologies: ${breakdown.matchedTechnologies.join(", ")}`);
  }
  if (breakdown.matchedJobTypes.length > 0) {
    matchReasons.push(`Matches preferred job types: ${breakdown.matchedJobTypes.join(", ")}`);
  }
  if (job.experienceLevel === "expert" && profile.experienceYears >= 8) {
    matchReasons.push("Aligned with senior/expert profile");
  }
  if (job.budgetType === "hourly" && (job.budgetMax ?? job.budgetMin ?? 0) >= profile.minimumHourlyRate) {
    matchReasons.push(`Budget is compatible with minimum rate of USD ${profile.minimumHourlyRate}/h`);
  }
  if (breakdown.positiveSignals.length > 0) {
    matchReasons.push(`Positive signals: ${breakdown.positiveSignals.join(", ")}`);
  }

  if (breakdown.redFlags.length > 0) {
    warnings.push(...breakdown.redFlags);
  }
  if (breakdown.matchedTechnologies.length === 0) {
    warnings.push("No direct technology match found");
  }
  if (score < 60) {
    warnings.push("Low score for current profile");
  }

  return {
    matchReasons: matchReasons.length > 0 ? matchReasons : ["Partial match based on available data"],
    warnings,
  };
}
