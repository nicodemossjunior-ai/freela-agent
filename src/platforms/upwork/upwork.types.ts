import type { BudgetType, ExperienceLevel } from "../../domain/types.js";

export type RawUpworkJob = {
  externalId?: string;
  title?: string;
  description?: string;
  url?: string;
  budget?: {
    type?: BudgetType;
    min?: number;
    max?: number;
    currency?: string;
  };
  experienceLevel?: ExperienceLevel;
  postedAt?: string;
  skills?: string[];
  client?: {
    paymentVerified?: boolean;
    rating?: number;
    country?: string;
  };
};
