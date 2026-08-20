import assert from "node:assert/strict";
import test from "node:test";
import { ProfileValidationError, validateProfile } from "../../src/config/loadProfile.js";

test("validateProfile returns normalized profile", () => {
  const profile = validateProfile({
    name: "Nicodemos",
    title: "Senior Software Developer",
    technologies: [" Java ", "Spring Boot"],
    experienceYears: 17,
    englishLevel: "intermediate",
    minimumHourlyRate: 35,
    preferredJobTypes: ["backend"],
    avoid: ["wordpress"],
  });

  assert.equal(profile.name, "Nicodemos");
  assert.deepEqual(profile.technologies, ["Java", "Spring Boot"]);
});

test("validateProfile lists missing required fields", () => {
  assert.throws(
    () => validateProfile({ name: "Nicodemos" }),
    (error) =>
      error instanceof ProfileValidationError &&
      error.missingFields.includes("technologies") &&
      error.missingFields.includes("minimumHourlyRate"),
  );
});
