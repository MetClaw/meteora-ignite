import type {
  IntakeInput,
  IntakeOutput,
  FounderContext,
  SkillResponse,
  LaunchPhase,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

// --- Asset classification ---

interface ClassificationResult {
  type: FounderContext["assetType"];
  confidence: number;
  reasoning: string;
}

const ASSET_KEYWORDS: Record<FounderContext["assetType"], string[]> = {
  meme: ["meme", "joke", "fun", "degen"],
  governance: ["governance", "dao", "vote"],
  stablecoin: ["stable", "peg", "usd"],
  lst: ["liquid staking", "lst", "staked"],
  rwa: ["real world", "rwa", "tokenized"],
  utility: [],
};

function classifyAsset(description: string): ClassificationResult {
  const lower = description.toLowerCase();

  for (const [type, keywords] of Object.entries(ASSET_KEYWORDS)) {
    if (type === "utility") continue;

    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Exact word boundary check for higher confidence
        const wordBoundary = new RegExp(`\\b${keyword}\\b`, "i");
        const isExact = wordBoundary.test(description);

        return {
          type: type as FounderContext["assetType"],
          confidence: isExact ? 90 : 70,
          reasoning: isExact
            ? `Matched keyword "${keyword}" in project description`
            : `Partial match on "${keyword}" in project description`,
        };
      }
    }
  }

  return {
    type: "utility",
    confidence: 50,
    reasoning: "No specific asset keywords detected -- defaulting to utility token",
  };
}

// --- Budget reality check ---

interface BudgetReality {
  totalBudget: string;
  breakdown: { category: string; amount: string; priority: string }[];
  warnings: string[];
}

function assessBudget(budget: IntakeInput["budget"]): BudgetReality {
  if (budget === "bootstrap") {
    return {
      totalBudget: "$300-500",
      breakdown: [
        { category: "DexScreener profile", amount: "$299", priority: "critical" },
        { category: "Jupiter burn (1000 JUP)", amount: "optional", priority: "recommended" },
      ],
      warnings: [
        "No budget for KOL outreach",
        "Community building will be 100% organic",
        "CoinGecko/CMC listing is free but slow",
      ],
    };
  }

  if (budget === "seed") {
    return {
      totalBudget: "$1K-3K",
      breakdown: [
        { category: "DexScreener profile", amount: "$299", priority: "critical" },
        { category: "KOL nano tier", amount: "$200-500", priority: "high" },
        { category: "Content tools", amount: "$50/mo", priority: "medium" },
      ],
      warnings:
        budget === "seed"
          ? ["Budget is tight -- prioritize DexScreener and one KOL partnership"]
          : [],
    };
  }

  // funded
  return {
    totalBudget: "$5K-20K+",
    breakdown: [
      { category: "DexScreener boosted listing", amount: "$1K-3K", priority: "critical" },
      { category: "KOL macro tier", amount: "$2K-10K", priority: "high" },
      { category: "Content creation", amount: "$1K-3K", priority: "high" },
      { category: "Community management tools", amount: "$500-1K", priority: "medium" },
    ],
    warnings: [],
  };
}

// --- Readiness preview ---

interface ReadinessPreview {
  phase: "qualify" | "arm" | "launch" | "sustain";
  blockers: string[];
  estimatedTimeToLaunch: string;
}

function assessReadiness(input: IntakeInput): ReadinessPreview {
  const blockers: string[] = [];
  let missingCount = 0;

  if (!input.hasSocials) {
    blockers.push("No social media presence -- create Twitter/X and Telegram at minimum");
    missingCount++;
  }

  if (!input.hasWebsite) {
    blockers.push("No website -- even a simple landing page builds credibility");
    missingCount++;
  }

  if (input.existingCommunitySize < 50) {
    blockers.push(
      `Community size is ${input.existingCommunitySize} -- aim for 100+ before launch`
    );
    missingCount++;
  }

  if (!input.isDoxxed) {
    blockers.push("Team is not doxxed -- this will hurt trust score significantly");
    missingCount++;
  }

  if (!input.hasToken) {
    blockers.push("Token not yet created -- this is a prerequisite for pool setup");
    missingCount++;
  }

  // Determine phase based on missing fundamentals
  const fundamentalsMissing = !input.hasSocials || !input.hasWebsite || !input.hasToken;
  const phase: ReadinessPreview["phase"] = fundamentalsMissing ? "qualify" : "arm";

  // Estimate time to launch
  let weeks = 1;
  if (!input.hasToken) weeks += 1;
  if (!input.hasSocials) weeks += 1;
  if (!input.hasWebsite) weeks += 1;
  if (input.existingCommunitySize < 50) weeks += 2;
  if (!input.isDoxxed) weeks += 1;

  const estimatedTimeToLaunch =
    missingCount === 0 ? "1-2 weeks" : `${weeks}-${weeks + 2} weeks`;

  return { phase, blockers, estimatedTimeToLaunch };
}

// --- Main executor ---

export async function executeIntake(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as IntakeInput;
  const classification = classifyAsset(params.projectDescription);
  const budgetReality = assessBudget(params.budget);
  const readinessPreview = assessReadiness(params);

  const founderContext: FounderContext = {
    projectName: params.projectName,
    projectDescription: params.projectDescription,
    assetType: classification.type,
    targetMarket: params.targetAudience,
    launchTimeline: params.launchTimeline,
    existingCommunitySize: params.existingCommunitySize,
    budget: params.budget,
    teamSize: params.teamSize,
    isDoxxed: params.isDoxxed,
    hasSocials: params.hasSocials,
    hasWebsite: params.hasWebsite,
    primaryGoal: params.primaryGoal ?? "awareness",
    currentPhase: readinessPreview.phase as LaunchPhase,
    trustScore: 0, // to be filled by trust-score skill
    completedSkills: {},
    launchMode: (input.launchMode as string) === "launchpad" ? "launchpad" : "custom",
  };

  const intakeOutput: IntakeOutput = {
    founderContext,
    assetClassification: classification,
    budgetReality,
    readinessPreview,
  };

  const blockerSummary =
    readinessPreview.blockers.length > 0
      ? ` ${readinessPreview.blockers.length} blocker(s) identified.`
      : " No blockers -- ready to proceed.";

  const summary =
    `Intake complete for ${params.projectName}. ` +
    `Classified as ${classification.type} (${classification.confidence}% confidence). ` +
    `Budget tier: ${params.budget} (${budgetReality.totalBudget}). ` +
    `Current phase: ${readinessPreview.phase}. ` +
    `Estimated time to launch: ${readinessPreview.estimatedTimeToLaunch}.` +
    blockerSummary;

  const sources = [makeSource("founder-input", "direct-intake")];

  return buildSkillResponse("intake", {
    data: intakeOutput,
    summary,
    nextSteps: ["trust-score", "tokenomics-review"],
    sources,
  });
}
