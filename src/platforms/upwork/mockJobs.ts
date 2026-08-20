import type { RawUpworkJob } from "./upwork.types.js";

export const mockUpworkJobs: RawUpworkJob[] = [
  {
    externalId: "upwork-001",
    title: "Senior Java Spring Boot API Developer",
    description:
      "We need a senior backend developer to build REST APIs with Java, Spring Boot, PostgreSQL, Docker, and third-party integrations. Clear specs and weekly milestones.",
    url: "https://www.upwork.com/jobs/~001",
    budget: { type: "hourly", min: 40, max: 60, currency: "USD" },
    experienceLevel: "expert",
    postedAt: "2026-06-10T12:00:00.000Z",
    skills: ["Java", "Spring Boot", "REST API", "PostgreSQL", "Docker"],
    client: { paymentVerified: true, rating: 4.9, country: "United States" },
  },
  {
    externalId: "upwork-002",
    title: "React and Node.js fullstack engineer for SaaS dashboard",
    description:
      "Looking for a fullstack developer to improve a SaaS dashboard using React, Node.js, TypeScript, and PostgreSQL. Remote async collaboration.",
    url: "https://www.upwork.com/jobs/~002",
    budget: { type: "hourly", min: 35, max: 50, currency: "USD" },
    experienceLevel: "expert",
    postedAt: "2026-06-10T11:30:00.000Z",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    client: { paymentVerified: true, rating: 4.7, country: "Canada" },
  },
  {
    externalId: "upwork-003",
    title: "Fix WordPress plugin issue",
    description:
      "Need quick cheap help fixing a WordPress plugin. Low budget but more work later. Crypto payment possible.",
    url: "https://www.upwork.com/jobs/~003",
    budget: { type: "fixed", min: 80, max: 80, currency: "USD" },
    experienceLevel: "entry",
    postedAt: "2026-06-10T10:00:00.000Z",
    skills: ["WordPress", "PHP"],
    client: { paymentVerified: false, rating: 3.8, country: "Unknown" },
  },
  {
    externalId: "upwork-004",
    title: "Dockerize legacy Oracle integration service",
    description:
      "Existing Java integration service needs Docker packaging, Oracle connection cleanup, and deployment documentation.",
    url: "https://www.upwork.com/jobs/~004",
    budget: { type: "hourly", min: 30, max: 45, currency: "USD" },
    experienceLevel: "intermediate",
    postedAt: "2026-06-09T18:00:00.000Z",
    skills: ["Java", "Docker", "Oracle", "Integration"],
    client: { paymentVerified: true, rating: 4.5, country: "Germany" },
  },
  {
    externalId: "upwork-005",
    title: "Mobile app landing page",
    description:
      "Need frontend changes for a mobile app landing page. Mostly CSS and visual adjustments.",
    url: "https://www.upwork.com/jobs/~005",
    budget: { type: "hourly", min: 18, max: 25, currency: "USD" },
    experienceLevel: "intermediate",
    postedAt: "2026-06-09T15:00:00.000Z",
    skills: ["CSS", "HTML", "React"],
    client: { paymentVerified: true, rating: 4.2, country: "United Kingdom" },
  },
  {
    externalId: "upwork-006",
    title: "Backend API integration with payment provider",
    description:
      "Build and document backend payment integration. Need REST API design, Node.js, PostgreSQL, Docker, and clean error handling.",
    url: "https://www.upwork.com/jobs/~006",
    budget: { type: "hourly", min: 45, max: 70, currency: "USD" },
    experienceLevel: "expert",
    postedAt: "2026-06-10T09:45:00.000Z",
    skills: ["Node.js", "REST API", "PostgreSQL", "Docker", "Integration"],
    client: { paymentVerified: true, rating: 5, country: "Australia" },
  },
];
