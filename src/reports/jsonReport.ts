import type { Recommendation } from "../domain/types.js";

export function generateJsonReport(recommendations: Recommendation[]): string {
  return `${JSON.stringify({ generatedAt: new Date().toISOString(), recommendations }, null, 2)}\n`;
}
