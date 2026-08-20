import type { UserProfile } from "../../domain/types.js";
import { mockUpworkJobs } from "./mockJobs.js";
import type { RawUpworkJob } from "./upwork.types.js";

export async function searchMockUpworkJobs(
  profile: UserProfile,
  limit: number,
): Promise<RawUpworkJob[]> {
  const profileTerms = [
    ...profile.technologies,
    ...profile.preferredJobTypes,
  ].map((term) => term.toLowerCase());

  const scored = mockUpworkJobs.map((job) => {
    const haystack = `${job.title ?? ""} ${job.description ?? ""} ${(job.skills ?? []).join(" ")}`.toLowerCase();
    const matches = profileTerms.filter((term) => haystack.includes(term.toLowerCase())).length;
    return { job, matches };
  });

  return scored
    .sort((left, right) => right.matches - left.matches)
    .slice(0, Math.max(0, limit))
    .map(({ job }) => job);
}
