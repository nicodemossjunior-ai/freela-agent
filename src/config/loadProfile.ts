import { readFile } from "node:fs/promises";
import type { EnglishLevel, UserProfile } from "../domain/types.js";

const requiredFields = [
  "name",
  "title",
  "technologies",
  "experienceYears",
  "englishLevel",
  "minimumHourlyRate",
  "preferredJobTypes",
  "avoid",
] as const;

const englishLevels: EnglishLevel[] = ["basic", "intermediate", "advanced", "fluent"];

export class ProfileValidationError extends Error {
  constructor(message: string, public readonly missingFields: string[] = []) {
    super(message);
    this.name = "ProfileValidationError";
  }
}

export async function loadProfile(profilePath: string): Promise<UserProfile> {
  let raw: string;

  try {
    raw = await readFile(profilePath, "utf8");
  } catch (error) {
    const cause = error instanceof Error ? ` ${error.message}` : "";
    throw new ProfileValidationError(
      `Profile file not found or unreadable: ${profilePath}.${cause}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const cause = error instanceof Error ? error.message : "Invalid JSON";
    throw new ProfileValidationError(`Profile file is not valid JSON: ${cause}`);
  }

  return validateProfile(parsed);
}

export function validateProfile(value: unknown): UserProfile {
  if (!isRecord(value)) {
    throw new ProfileValidationError("Profile must be a JSON object.", [...requiredFields]);
  }

  const missingFields = requiredFields.filter((field) => !(field in value));
  if (missingFields.length > 0) {
    throw new ProfileValidationError(
      `Profile is missing required fields: ${missingFields.join(", ")}`,
      missingFields,
    );
  }

  const errors: string[] = [];

  if (!isNonEmptyString(value.name)) errors.push("name must be a non-empty string");
  if (!isNonEmptyString(value.title)) errors.push("title must be a non-empty string");
  if (!isStringArray(value.technologies) || value.technologies.length === 0) {
    errors.push("technologies must be a non-empty string array");
  }
  if (!isPositiveNumber(value.experienceYears)) {
    errors.push("experienceYears must be a positive number");
  }
  if (!isNonEmptyString(value.englishLevel) || !englishLevels.includes(value.englishLevel as EnglishLevel)) {
    errors.push(`englishLevel must be one of: ${englishLevels.join(", ")}`);
  }
  if (!isPositiveNumber(value.minimumHourlyRate)) {
    errors.push("minimumHourlyRate must be a positive number");
  }
  if (!isStringArray(value.preferredJobTypes)) {
    errors.push("preferredJobTypes must be a string array");
  }
  if (!isStringArray(value.avoid)) {
    errors.push("avoid must be a string array");
  }

  if (errors.length > 0) {
    throw new ProfileValidationError(`Invalid profile: ${errors.join("; ")}`);
  }

  const profile = value as {
    name: string;
    title: string;
    technologies: string[];
    experienceYears: number;
    englishLevel: EnglishLevel;
    minimumHourlyRate: number;
    preferredJobTypes: string[];
    avoid: string[];
  };

  return {
    name: profile.name,
    title: profile.title,
    technologies: normalizeStringArray(profile.technologies),
    experienceYears: profile.experienceYears,
    englishLevel: profile.englishLevel,
    minimumHourlyRate: profile.minimumHourlyRate,
    preferredJobTypes: normalizeStringArray(profile.preferredJobTypes),
    avoid: normalizeStringArray(profile.avoid),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeStringArray(value: string[]): string[] {
  return value.map((item) => item.trim()).filter(Boolean);
}
