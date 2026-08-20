export type EnglishLevel = "basic" | "intermediate" | "advanced" | "fluent";

export type BudgetType = "hourly" | "fixed" | "unknown";

export type ExperienceLevel = "entry" | "intermediate" | "expert" | "unknown";

export type Seniority = "junior" | "mid" | "senior" | "unknown";

export type JobType =
  | "backend"
  | "frontend"
  | "fullstack"
  | "devops"
  | "mobile"
  | "data"
  | "api"
  | "integration"
  | "unknown";

export type UserProfile = {
  name: string;
  title: string;
  technologies: string[];
  experienceYears: number;
  englishLevel: EnglishLevel;
  minimumHourlyRate: number;
  preferredJobTypes: string[];
  avoid: string[];
};

export type JobOpportunity = {
  id: string;
  platform: "upwork";
  externalId?: string;
  title: string;
  description: string;
  url: string;
  budgetType: BudgetType;
  budgetMin?: number;
  budgetMax?: number;
  currency: "USD";
  experienceLevel: ExperienceLevel;
  postedAt?: string;
  detectedSkills: string[];
  rawData?: unknown;
};

export type AiJobAnalysis = {
  summary: string;
  requiredSkills: string[];
  seniority: Seniority;
  jobType: JobType;
  redFlags: string[];
  positiveSignals: string[];
};

export type Recommendation = {
  job: JobOpportunity;
  score: number;
  summary: string;
  matchReasons: string[];
  warnings: string[];
  analyzedAt: string;
};

export type PlatformProvider = {
  name: string;
  search(profile: UserProfile, limit: number): Promise<unknown[]>;
  normalize(raw: unknown): JobOpportunity;
};

