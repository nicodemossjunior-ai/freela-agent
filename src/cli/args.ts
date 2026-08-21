export type CliOptions = {
  profilePath: string;
  limit: number;
  minScore: number;
  top: number;
  mock: boolean;
  markdownPath: string;
  jsonPath: string;
  databasePath: string;
};

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    profilePath: "data/profile.json",
    limit: 20,
    minScore: 50,
    top: 10,
    mock: true,
    markdownPath: "output/recommendations.md",
    jsonPath: "output/recommendations.json",
    databasePath: "data/freela-agent.sqlite",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--profile":
        options.profilePath = readValue(arg, next);
        index += 1;
        break;
      case "--limit":
        options.limit = readNumber(arg, next);
        index += 1;
        break;
      case "--min-score":
        options.minScore = readNumber(arg, next);
        index += 1;
        break;
      case "--top":
        options.top = readNumber(arg, next);
        index += 1;
        break;
      case "--mock":
        options.mock = true;
        break;
      case "--markdown":
        options.markdownPath = readValue(arg, next);
        index += 1;
        break;
      case "--json":
        options.jsonPath = readValue(arg, next);
        index += 1;
        break;
      case "--db":
        options.databasePath = readValue(arg, next);
        index += 1;
        break;
      case "--help":
      case "-h":
        throw new HelpRequested(helpText());
      default:
        throw new Error(`Unknown argument: ${arg}\n\n${helpText()}`);
    }
  }

  return options;
}

export class HelpRequested extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HelpRequested";
  }
}

export function helpText(): string {
  return [
    "Usage: npm run dev -- [options]",
    "",
    "Options:",
    "  --profile <path>     Profile JSON path. Default: data/profile.json",
    "  --limit <number>     Max jobs to collect. Default: 20",
    "  --min-score <number> Minimum score to include. Default: 50",
    "  --top <number>       Max recommendations in report. Default: 10",
    "  --mock               Use mocked Upwork jobs. Default: enabled",
    "  --markdown <path>    Markdown output path. Default: output/recommendations.md",
    "  --json <path>        JSON output path. Default: output/recommendations.json",
    "  --db <path>          SQLite database path. Default: data/freela-agent.sqlite",
    "  --help               Show this help message",
  ].join("\n");
}

function readValue(argument: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${argument}`);
  }
  return value;
}

function readNumber(argument: string, value: string | undefined): number {
  const parsed = Number(readValue(argument, value));
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid number for ${argument}: ${value}`);
  }
  return parsed;
}
