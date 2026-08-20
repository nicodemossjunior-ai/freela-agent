import type { Recommendation } from "../domain/types.js";

export function rankRecommendations(
  recommendations: Recommendation[],
  minScore: number,
  top: number,
): Recommendation[] {
  return [...recommendations]
    .filter((recommendation) => recommendation.score >= minScore)
    .sort((left, right) => right.score - left.score)
    .slice(0, top);
}
