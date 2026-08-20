import type { Recommendation } from "../domain/types.js";

export function generateMarkdownReport(recommendations: Recommendation[]): string {
  const lines = ["# Recomendações Upwork", ""];

  if (recommendations.length === 0) {
    lines.push("Nenhuma oportunidade atingiu o score mínimo nesta execução.", "");
    return lines.join("\n");
  }

  recommendations.forEach((recommendation, index) => {
    const { job } = recommendation;
    lines.push(`## ${index + 1}. ${job.title}`);
    lines.push("");
    lines.push(`- Score: ${recommendation.score}/100`);
    lines.push(`- Plataforma: ${job.platform}`);
    lines.push(`- Orçamento: ${formatBudget(job)}`);
    lines.push(`- Link: ${job.url}`);
    lines.push(`- Resumo: ${recommendation.summary || "Sem resumo disponível."}`);
    lines.push("- Motivos do match:");
    for (const reason of recommendation.matchReasons) {
      lines.push(`  - ${reason}`);
    }
    lines.push("- Pontos de atenção:");
    if (recommendation.warnings.length === 0) {
      lines.push("  - Nenhum ponto crítico identificado no mock atual.");
    } else {
      for (const warning of recommendation.warnings) {
        lines.push(`  - ${warning}`);
      }
    }
    lines.push("");
  });

  return lines.join("\n");
}

function formatBudget(job: Recommendation["job"]): string {
  if (job.budgetType === "hourly") {
    const min = job.budgetMin !== undefined ? `USD ${job.budgetMin}` : "unknown";
    const max = job.budgetMax !== undefined ? `USD ${job.budgetMax}` : undefined;
    return max ? `${min}-${max}/h` : `${min}/h`;
  }
  if (job.budgetType === "fixed") {
    return job.budgetMax !== undefined ? `USD ${job.budgetMax} fixed` : "fixed price";
  }
  return "unknown";
}
