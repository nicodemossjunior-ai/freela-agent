import { createHash } from "node:crypto";
import type { JobOpportunity, Recommendation, UserProfile } from "../domain/types.js";
import type { AppDatabase } from "./db.js";

export type PersistenceSummary = {
  profileId: number;
  savedJobs: number;
  insertedJobs: number;
  reusedJobs: number;
  savedRecommendations: number;
};

type JobRow = {
  id: number;
};

type ChangeResult = {
  changes: number;
  lastInsertRowid: number | bigint;
};

export class ProfileRepository {
  constructor(private readonly db: AppDatabase) {}

  save(profile: UserProfile): number {
    const profileKey = profileHash(profile);
    const existing = this.db.prepare("SELECT id FROM profiles WHERE profile_key = ?").get(profileKey) as
      | { id: number }
      | undefined;

    if (existing) {
      this.db
        .prepare(
          `UPDATE profiles
           SET name = ?, title = ?, technologies_json = ?, experience_years = ?,
               english_level = ?, minimum_hourly_rate = ?, preferred_job_types_json = ?,
               avoid_json = ?, raw_json = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
        )
        .run(...profileValues(profile), existing.id);
      return existing.id;
    }

    const result = this.db
      .prepare(
        `INSERT INTO profiles (
          profile_key, name, title, technologies_json, experience_years, english_level,
          minimum_hourly_rate, preferred_job_types_json, avoid_json, raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(profileKey, ...profileValues(profile)) as ChangeResult;

    return Number(result.lastInsertRowid);
  }
}

export class JobRepository {
  constructor(private readonly db: AppDatabase) {}

  save(job: JobOpportunity): { id: number; inserted: boolean } {
    const existing = this.findExisting(job);
    if (existing) {
      this.update(existing.id, job);
      return { id: existing.id, inserted: false };
    }

    const result = this.db
      .prepare(
        `INSERT INTO jobs (
          platform, external_id, title, description, url, budget_type, budget_min,
          budget_max, currency, experience_level, posted_at, detected_skills_json, raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(...jobValues(job)) as ChangeResult;

    return { id: Number(result.lastInsertRowid), inserted: true };
  }

  count(): number {
    const row = this.db.prepare("SELECT COUNT(*) as total FROM jobs").get() as { total: number };
    return row.total;
  }

  private findExisting(job: JobOpportunity): JobRow | undefined {
    if (job.externalId) {
      const byExternalId = this.db
        .prepare("SELECT id FROM jobs WHERE platform = ? AND external_id = ?")
        .get(job.platform, job.externalId) as JobRow | undefined;
      if (byExternalId) return byExternalId;
    }

    if (job.url !== "unknown") {
      return this.db.prepare("SELECT id FROM jobs WHERE url = ?").get(job.url) as JobRow | undefined;
    }

    return undefined;
  }

  private update(id: number, job: JobOpportunity): void {
    this.db
      .prepare(
        `UPDATE jobs
         SET platform = ?, external_id = ?, title = ?, description = ?, url = ?,
             budget_type = ?, budget_min = ?, budget_max = ?, currency = ?,
             experience_level = ?, posted_at = ?, detected_skills_json = ?, raw_json = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      )
      .run(...jobValues(job), id);
  }
}

export class RecommendationRepository {
  constructor(private readonly db: AppDatabase) {}

  save(profileId: number, jobId: number, recommendation: Recommendation): number {
    const result = this.db
      .prepare(
        `INSERT INTO recommendations (
          profile_id, job_id, score, summary, match_reasons_json, warnings_json, analyzed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        profileId,
        jobId,
        recommendation.score,
        recommendation.summary,
        JSON.stringify(recommendation.matchReasons),
        JSON.stringify(recommendation.warnings),
        recommendation.analyzedAt,
      ) as ChangeResult;

    return Number(result.lastInsertRowid);
  }

  count(): number {
    const row = this.db.prepare("SELECT COUNT(*) as total FROM recommendations").get() as { total: number };
    return row.total;
  }
}

export class StorageRepositories {
  readonly profiles: ProfileRepository;
  readonly jobs: JobRepository;
  readonly recommendations: RecommendationRepository;

  constructor(private readonly db: AppDatabase) {
    this.profiles = new ProfileRepository(db);
    this.jobs = new JobRepository(db);
    this.recommendations = new RecommendationRepository(db);
  }

  persistRun(
    profile: UserProfile,
    jobs: JobOpportunity[],
    recommendations: Recommendation[],
  ): PersistenceSummary {
    const persist = this.db.transaction(() => {
      const profileId = this.profiles.save(profile);
      let insertedJobs = 0;
      const jobIds = new Map<string, number>();

      for (const job of jobs) {
        const savedJob = this.jobs.save(job);
        if (savedJob.inserted) insertedJobs += 1;
        jobIds.set(jobIdentity(job), savedJob.id);
      }

      for (const recommendation of recommendations) {
        const jobId = jobIds.get(jobIdentity(recommendation.job)) ?? this.jobs.save(recommendation.job).id;
        this.recommendations.save(profileId, jobId, recommendation);
      }

      return {
        profileId,
        savedJobs: jobs.length,
        insertedJobs,
        reusedJobs: jobs.length - insertedJobs,
        savedRecommendations: recommendations.length,
      };
    });

    return persist();
  }
}

function profileValues(profile: UserProfile): unknown[] {
  return [
    profile.name,
    profile.title,
    JSON.stringify(profile.technologies),
    profile.experienceYears,
    profile.englishLevel,
    profile.minimumHourlyRate,
    JSON.stringify(profile.preferredJobTypes),
    JSON.stringify(profile.avoid),
    JSON.stringify(profile),
  ];
}

function jobValues(job: JobOpportunity): unknown[] {
  return [
    job.platform,
    job.externalId ?? null,
    job.title,
    job.description,
    job.url,
    job.budgetType,
    job.budgetMin ?? null,
    job.budgetMax ?? null,
    job.currency,
    job.experienceLevel,
    job.postedAt ?? null,
    JSON.stringify(job.detectedSkills),
    job.rawData === undefined ? null : JSON.stringify(job.rawData),
  ];
}

function jobIdentity(job: JobOpportunity): string {
  if (job.externalId) return `${job.platform}:external:${job.externalId}`;
  return `${job.platform}:url:${job.url}`;
}

function profileHash(profile: UserProfile): string {
  return createHash("sha1").update(JSON.stringify(profile)).digest("hex");
}
