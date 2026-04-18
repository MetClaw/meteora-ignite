export interface SkillInputMap {
  intake: IntakeInput;
  "trust-score": TrustScoreInput;
  "tokenomics-review": TokenomicsInput;
  "pool-setup": PoolSetupInput;
  "content-draft": ContentDraftInput;
  "listing-ops": ListingOpsInput;
  "community-setup": CommunitySetupInput;
  outreach: OutreachInput;
  "comms-calendar": CommsCalendarInput;
  "readiness-gate": ReadinessGateInput;
  "launch-sequence": LaunchSequenceInput;
  "post-launch-monitor": PostLaunchMonitorInput;
  "crisis-response": CrisisResponseInput;
  "growth-playbook": GrowthPlaybookInput;
  "buyback-reporter": BuybackReporterInput;
  analytics: AnalyticsInput;
}

// Union of all skill output types -- keyed by skill ID
export interface SkillOutputMap {
  intake: IntakeOutput;
  "trust-score": TrustScoreOutput;
  "tokenomics-review": TokenomicsOutput;
  "pool-setup": PoolSetupOutput;
  "content-draft": ContentDraftOutput;
  "listing-ops": ListingOpsOutput;
  "community-setup": CommunitySetupOutput;
  outreach: OutreachOutput;
  "comms-calendar": CommsCalendarOutput;
  "readiness-gate": ReadinessGateOutput;
  "launch-sequence": LaunchSequenceOutput;
  "post-launch-monitor": PostLaunchMonitorOutput;
  "crisis-response": CrisisResponseOutput;
  "growth-playbook": GrowthPlaybookOutput;
  "buyback-reporter": BuybackReporterOutput;
  analytics: AnalyticsOutput;
}

export type SkillId = keyof SkillInputMap;

// All possible skill input types (union)
export type AnySkillInput = SkillInputMap[SkillId];

// All possible skill output types (union)
export type AnySkillOutput = SkillOutputMap[SkillId];

// Partial input type -- used at form/API boundary where fields may be missing
export type SkillParams = Partial<AnySkillInput> & { [key: string]: string | number | boolean | string[] | undefined | null | FounderContext | Record<string, SkillResponse> | { category: string; percentage: number; vestingMonths: number }[] };

export interface SkillRequest {
  sessionId?: string;
  params: SkillParams;
  context?: FounderContext;
}

// Generic card display fields (used by data-table and checklist card types)
interface GenericCardFields {
  cardType?: string;
  title?: string;
  columns?: { key: string; label: string; align?: "left" | "center" | "right" }[];
  rows?: Record<string, string | number>[];
  items?: { label: string; status: "done" | "in-progress" | "pending" | "blocked"; detail?: string }[];
  highlightColumn?: string;
}

export interface SkillResponse {
  skillId: string;
  status: "success" | "error" | "partial";
  data: AnySkillOutput & GenericCardFields;
  summary: string;
  nextSteps: string[];
  sources: DataSource[];
  timestamp: string;
}

export type LaunchMode = "launchpad" | "custom";

export interface FounderContext {
  projectName: string;
  projectDescription: string;
  assetType: "utility" | "governance" | "meme" | "stablecoin" | "lst" | "rwa";
  targetMarket: string;
  launchTimeline: string;
  existingCommunitySize: number;
  budget: "bootstrap" | "seed" | "funded";
  teamSize: number;
  isDoxxed: boolean;
  hasSocials: boolean;
  hasWebsite: boolean;
  primaryGoal: "volume" | "holders" | "tvl" | "awareness";
  currentPhase: LaunchPhase;
  trustScore: number;
  completedSkills: Record<string, SkillResponse>;
  // Launch mode
  launchMode: LaunchMode;
  launchpad?: string; // which launchpad (if using launchpad mode)
  // Tokenomics (custom mode only)
  totalSupply?: number;
  initialCirculating?: number; // percentage of total supply
  hasLPLock?: boolean;
  hasMultisig?: boolean;
  distribution?: { category: string; percentage: number; vestingMonths: number }[];
}

export interface DataSource {
  name: string;
  endpoint: string;
  fetchedAt: string;
}

// Pool Setup types
export interface PoolSetupInput {
  tokenMint: string;
  assetType: string;
  initialLiquidity: number;
  targetVolume: "low" | "medium" | "high";
}

export interface PoolSetupOutput {
  recommendedPool: "DLMM" | "DAMM_v2" | "DBC";
  binStep: number;
  baseFee: number;
  positionStrategy: "spot" | "curve" | "bid-ask";
  priceRange: { min: number; max: number };
  estimatedFees: { daily: number; monthly: number; annual: number };
  comparisons: {
    poolType: string;
    estimatedFees: number;
    tradeoffs: string;
  }[];
}

// Tokenomics Review types
export interface TokenomicsInput {
  totalSupply: number;
  distribution: {
    category: string;
    percentage: number;
    vestingMonths: number;
  }[];
  initialCirculating: number;
  hasLPLock: boolean;
  hasMultisig: boolean;
}

export interface TokenomicsOutput {
  overallScore: number;
  dimensions: {
    name: string;
    score: number;
    assessment: string;
    recommendation: string;
  }[];
  redFlags: string[];
  benchmarks: {
    project: string;
    metric: string;
    value: string;
  }[];
}

export const READINESS_DIMENSIONS = [
  { name: "Trust & Credibility", weight: 0.20, skills: ["trust-score"] },
  { name: "Tokenomics", weight: 0.20, skills: ["tokenomics-review"] },
  { name: "Liquidity Setup", weight: 0.20, skills: ["pool-setup"] },
  { name: "Community", weight: 0.10, skills: ["community-setup"] },
  { name: "Content & Comms", weight: 0.10, skills: ["content-draft", "comms-calendar"] },
  { name: "Visibility & Listings", weight: 0.10, skills: ["listing-ops", "outreach"] },
  { name: "Growth Plan", weight: 0.10, skills: ["growth-playbook"] },
] as const;

// Content Draft types
export interface ContentDraftInput {
  projectName: string;
  assetType: string;
  tagline?: string;
  keyFeatures: string[];
  launchDate?: string;
  poolType?: string;
  tokenTicker?: string;
  targetAudience?: string;
  tone?: "professional" | "degen" | "balanced";
  formats: ("announcement" | "thread" | "pitch" | "telegram-pin")[];
}

export interface ContentDraftOutput {
  drafts: {
    format: string;
    title: string;
    content: string;
    charCount: number;
    platform: string;
    tips: string[];
  }[];
  hashtags: string[];
  postingStrategy: {
    timing: string;
    sequence: string[];
    cadence: string;
  };
}

// Growth Playbook types
export interface GrowthPlaybookInput {
  projectName: string;
  assetType: string;
  launchTimeline: string;
  budget: "bootstrap" | "seed" | "funded";
  existingCommunitySize: number;
  poolType?: string;
  tokenTicker?: string;
  hasContentDraft?: boolean;
  hasCommunitySetup?: boolean;
  primaryGoal?: "volume" | "holders" | "tvl" | "awareness";
}

export interface GrowthPlaybookOutput {
  timeframe: string;
  weeks: {
    week: number;
    theme: string;
    objectives: string[];
    actions: {
      action: string;
      channel: string;
      effort: "low" | "medium" | "high";
      impact: "low" | "medium" | "high";
      budgetRequired: boolean;
    }[];
    kpis: { metric: string; target: string }[];
  }[];
  budgetBreakdown: {
    category: string;
    allocation: string;
    notes: string;
  }[];
  risks: {
    risk: string;
    mitigation: string;
    severity: "low" | "medium" | "high";
  }[];
  benchmarks: {
    metric: string;
    week4Target: string;
    week8Target: string;
    topDecile: string;
  }[];
}

// Community Setup types
export interface CommunitySetupInput {
  projectName: string;
  assetType: string;
  tokenTicker?: string;
  platforms: ("telegram" | "discord" | "both")[];
  existingCommunitySize: number;
  budget: "bootstrap" | "seed" | "funded";
  launchDate?: string;
}

export interface CommunitySetupOutput {
  platforms: {
    platform: string;
    channels: {
      name: string;
      purpose: string;
      permissions: string;
      priority: "required" | "recommended" | "optional";
    }[];
    bots: {
      name: string;
      purpose: string;
      free: boolean;
      setupUrl: string;
    }[];
    moderationRules: string[];
  }[];
  prelaunchChecklist: {
    task: string;
    category: string;
    completed: boolean;
    priority: "critical" | "high" | "medium";
  }[];
  templates: {
    name: string;
    content: string;
    useCase: string;
  }[];
  timeline: {
    phase: string;
    tasks: string[];
    daysBeforeLaunch: number;
  }[];
}

// Outreach types
export interface OutreachInput {
  projectName: string;
  assetType: string;
  tokenTicker?: string;
  targetAudience?: string;
  budget: "bootstrap" | "seed" | "funded";
  existingCommunitySize: number;
  keyFeatures: string[];
  launchDate?: string;
}

export interface OutreachOutput {
  spaces: {
    name: string;
    platform: string;
    audience: string;
    relevance: "high" | "medium" | "low";
    contactMethod: string;
    notes: string;
  }[];
  podcasts: {
    name: string;
    audience: string;
    relevance: "high" | "medium" | "low";
    pitchAngle: string;
    contactMethod: string;
  }[];
  kols: {
    tier: "mega" | "macro" | "micro" | "nano";
    description: string;
    estimatedCost: string;
    expectedReach: string;
    bestFor: string;
  }[];
  pitchTemplates: {
    target: string;
    subject: string;
    body: string;
    tips: string[];
  }[];
  outreachTimeline: {
    week: number;
    actions: string[];
    focus: string;
  }[];
}

// Analytics types
export interface AnalyticsInput {
  tokenMint?: string;
  poolAddress?: string;
  projectName: string;
  assetType: string;
  timeframe?: "24h" | "7d" | "30d";
}

export interface AnalyticsOutput {
  poolMetrics: {
    metric: string;
    value: string;
    change: string;
    trend: "up" | "down" | "flat";
  }[];
  lpActivity: {
    metric: string;
    value: string;
    percentile: string;
  }[];
  volumeBreakdown: {
    period: string;
    volume: string;
    fees: string;
    transactions: number;
  }[];
  healthScore: number;
  healthFactors: {
    factor: string;
    score: number;
    assessment: string;
  }[];
  recommendations: string[];
  dataSource: string;
}

// Intake types
export interface IntakeInput {
  projectName: string;
  projectDescription: string;
  teamSize: number;
  isDoxxed: boolean;
  targetAudience: string;
  launchTimeline: string;
  budget: "bootstrap" | "seed" | "funded";
  existingCommunitySize: number;
  hasToken: boolean;
  hasSocials: boolean;
  hasWebsite: boolean;
  primaryGoal?: "volume" | "holders" | "tvl" | "awareness";
}

export interface IntakeOutput {
  founderContext: FounderContext;
  assetClassification: {
    type: FounderContext["assetType"];
    confidence: number;
    reasoning: string;
  };
  budgetReality: {
    totalBudget: string;
    breakdown: { category: string; amount: string; priority: string }[];
    warnings: string[];
  };
  readinessPreview: {
    phase: "qualify" | "arm" | "launch" | "sustain";
    blockers: string[];
    estimatedTimeToLaunch: string;
  };
}

// Trust Score types
export interface TrustScoreInput {
  isDoxxed: boolean;
  hasMultisig: boolean;
  hasLPLock: boolean;
  hasVesting: boolean;
  willRevokeAuthorities: boolean;
  hasPriorProjects: boolean;
  priorProjectOutcome?: "success" | "mixed" | "failed" | "rugged" | "none";
  socialPresenceScore: number; // 0-100
  ownsNarrative: boolean;
  hasCommunityPreLaunch: boolean;
  communitySize: number;
  budgetTransparency: boolean;
}

export interface TrustScoreOutput {
  overallScore: number;
  verdict: "rejected" | "not-ready" | "conditional" | "approved" | "strong";
  dimensions: {
    name: string;
    score: number;
    weight: number;
    assessment: string;
    recommendation: string;
  }[];
  redFlags: string[];
  greenFlags: string[];
  requiredActions: string[];
  bdComparison: string;
}

// Listing Ops types
export interface ListingOpsInput {
  projectName: string;
  tokenMint: string;
  tokenTicker?: string;
  assetType: string;
  hasLogo: boolean;
  hasSocials: boolean;
  hasWebsite: boolean;
  poolAddress?: string;
  budget: "bootstrap" | "seed" | "funded";
}

export interface ListingOpsOutput {
  platforms: {
    platform: string;
    status: "ready" | "missing-requirements" | "submitted" | "not-applicable";
    cost: string;
    roi: string;
    requirements: { item: string; met: boolean; notes: string }[];
    submissionUrl: string;
    estimatedTime: string;
    priority: "critical" | "high" | "medium" | "low";
    preFilled: Record<string, string>;
  }[];
  totalCost: string;
  submissionOrder: { step: number; platform: string; when: string; why: string }[];
  budgetPlan: { tier: string; platforms: string[]; totalCost: string; impact: string }[];
  overallReadiness: number;
}

// Comms Calendar types
export interface CommsCalendarInput {
  projectName: string;
  assetType: string;
  tokenTicker?: string;
  launchDate?: string;
  platforms: string[];
  budget: "bootstrap" | "seed" | "funded";
  existingCommunitySize: number;
}

export interface CommsCalendarOutput {
  days: {
    day: number;
    date: string;
    theme: string;
    posts: {
      platform: string;
      time: string;
      content: string;
      type: "announcement" | "engagement" | "education" | "update" | "crisis-prep";
      tips: string[];
    }[];
  }[];
  weeklyThemes: { week: number; theme: string; focus: string }[];
  crisisTemplates: { scenario: string; response: string; timing: string }[];
  cadenceRules: { platform: string; frequency: string; bestTimes: string }[];
}

// Readiness Gate types
export interface ReadinessGateInput {
  completedSkills: Record<string, SkillResponse>;
  founderContext: FounderContext;
  trustScore?: number;
}

export interface ReadinessGateOutput {
  overallReadiness: number;
  verdict: "blocked" | "not-ready" | "almost" | "ready" | "strong";
  dimensions: {
    name: string;
    score: number;
    weight: number;
    source: string;
    status: "complete" | "partial" | "missing";
  }[];
  blockers: { item: string; severity: "critical" | "high" | "medium"; fix: string }[];
  canLaunch: boolean;
  launchRisk: "low" | "medium" | "high" | "critical";
}

// Launch Sequence types
export interface LaunchSequenceInput {
  projectName: string;
  tokenTicker: string;
  poolType: string;
  launchTime: string;
  platforms: string[];
  contentReady: boolean;
  listingsReady: boolean;
}

export interface LaunchSequenceOutput {
  preLaunch: { time: string; action: string; channel: string; template?: string }[];
  launchMoment: { time: string; action: string; channel: string; template?: string }[];
  postLaunch: { time: string; action: string; channel: string; template?: string }[];
  checklist: { item: string; critical: boolean; done: boolean }[];
  emergencyPlaybook: { scenario: string; response: string; timing: string }[];
}

// Post-Launch Monitor types
export interface PostLaunchMonitorInput {
  projectName: string;
  tokenTicker: string;
  assetType: string;
  daysSinceLaunch: number;
  poolAddress?: string;
}

export interface PostLaunchMonitorOutput {
  healthScore: number;
  alerts: { type: "warning" | "critical" | "info"; message: string; action: string }[];
  dailySuggestions: { type: string; content: string; platform: string }[];
  weeklyReport: {
    volume: string;
    holders: string;
    lpActivity: string;
    sentiment: string;
    grade: string;
  };
  nudges: { message: string; priority: "high" | "medium" | "low"; dayTriggered: number }[];
}

// Crisis Response types
export interface CrisisResponseInput {
  projectName: string;
  tokenTicker: string;
  crisisType: "price-dump" | "fud" | "exploit" | "whale-exit" | "social-attack" | "general";
  severity: "low" | "medium" | "high" | "critical";
  context: string;
}

export interface CrisisResponseOutput {
  responseTimeline: { time: string; action: string; channel: string }[];
  draftResponses: { platform: string; message: string; tone: string }[];
  doList: string[];
  dontList: string[];
  recoveryPlan: { phase: string; actions: string[]; timeline: string }[];
}

// Buyback Reporter types
export interface BuybackReporterInput {
  projectName: string;
  tokenTicker: string;
  buybackAmount: number;
  tokensBurned?: number;
  treasuryBalance?: number;
  solscanTxHash?: string;
}

export interface BuybackReporterOutput {
  report: {
    title: string;
    body: string;
    stats: { label: string; value: string }[];
    solscanLink: string;
  };
  tweetDraft: string;
  telegramDraft: string;
  discordDraft: string;
  impact: string;
}

// Compliance types
export interface ComplianceResult {
  passed: boolean;
  originalText: string;
  cleanedText: string;
  violations: {
    phrase: string;
    reason: string;
    replacement: string;
  }[];
}

// Phase definitions
export type LaunchPhase = "qualify" | "arm" | "launch" | "sustain";

// Custom mode: all 17 skills
export const PHASE_SKILLS_CUSTOM: Record<LaunchPhase, string[]> = {
  qualify: ["intake", "trust-score", "tokenomics-review", "pool-setup"],
  arm: ["content-draft", "listing-ops", "community-setup", "outreach", "comms-calendar"],
  launch: ["readiness-gate", "launch-sequence"],
  sustain: ["post-launch-monitor", "crisis-response", "growth-playbook", "buyback-reporter", "analytics"],
};

// Launchpad mode: comms, strategy, trench -- no pool/tokenomics/listing config
export const PHASE_SKILLS_LAUNCHPAD: Record<LaunchPhase, string[]> = {
  qualify: ["intake", "trust-score"],
  arm: ["content-draft", "community-setup", "outreach", "comms-calendar"],
  launch: ["readiness-gate", "launch-sequence"],
  sustain: ["post-launch-monitor", "crisis-response", "growth-playbook"],
};

// Helper: get the right phase skills for a mode
export function getPhaseSkills(mode: LaunchMode): Record<LaunchPhase, string[]> {
  return mode === "launchpad" ? PHASE_SKILLS_LAUNCHPAD : PHASE_SKILLS_CUSTOM;
}

export const PHASE_ORDER: LaunchPhase[] = ["qualify", "arm", "launch", "sustain"];

export const SKILL_DEPENDENCIES: Record<string, string[]> = {
  // QUALIFY -- intake is always first, everything flows from it
  "intake": [],
  "trust-score": ["intake"],
  "tokenomics-review": ["intake"],
  "pool-setup": ["tokenomics-review"],
  // ARM -- comms needs content + community; outreach needs content
  "content-draft": ["intake"],
  "listing-ops": ["pool-setup"],
  "community-setup": ["intake"],
  "outreach": ["content-draft"],
  "comms-calendar": ["content-draft", "community-setup"],
  // LAUNCH -- readiness checks everything; sequence needs readiness
  "readiness-gate": ["comms-calendar"],
  "launch-sequence": ["readiness-gate"],
  // SUSTAIN -- all need launch to have happened
  "post-launch-monitor": ["launch-sequence"],
  "crisis-response": ["launch-sequence"],
  "growth-playbook": ["launch-sequence"],
  "buyback-reporter": ["launch-sequence"],
  "analytics": ["launch-sequence"],
};

// Get unmet dependencies for a skill given completed skills
export function getUnmetDeps(skillId: string, completedSkills: Set<string>, mode: LaunchMode): string[] {
  const deps = SKILL_DEPENDENCIES[skillId] ?? [];
  const modeSkills = new Set(Object.values(getPhaseSkills(mode)).flat());
  // Only enforce deps that exist in this mode
  return deps.filter(d => modeSkills.has(d) && !completedSkills.has(d));
}

// Skill executor interface
export type SkillExecutor = (
  input: SkillParams,
  context?: FounderContext
) => Promise<SkillResponse>;

// ---------------------------------------------------------------------------
// Shared utilities — DRY helpers used by all 16 skill executors
// ---------------------------------------------------------------------------

/** Create a DataSource entry with auto-timestamped fetchedAt */
export function makeSource(name: string, endpoint: string): DataSource {
  return { name, endpoint, fetchedAt: new Date().toISOString() };
}

/** Build a SkillResponse with auto-timestamped timestamp field */
export function buildSkillResponse(
  skillId: string,
  opts: {
    status?: SkillResponse["status"];
    data: SkillResponse["data"];
    summary: string;
    nextSteps: string[];
    sources: DataSource[];
  }
): SkillResponse {
  return {
    skillId,
    status: opts.status ?? "success",
    data: opts.data,
    summary: opts.summary,
    nextSteps: opts.nextSteps,
    sources: opts.sources,
    timestamp: new Date().toISOString(),
  };
}

/** Resolve common params that most skills need, falling back to context then defaults */
export function resolveCommonParams(
  input: SkillParams,
  context?: FounderContext
): {
  projectName: string;
  assetType: string;
  budget: string;
  communitySize: number;
  ticker: string;
} {
  const projectName = (input.projectName as string) || context?.projectName || "Project";
  const assetType = (input.assetType as string) || context?.assetType || "utility";
  const budget = (input.budget as string) || context?.budget || "bootstrap";
  const communitySize = (input.existingCommunitySize as number) || context?.existingCommunitySize || 0;
  const ticker = (input.tokenTicker as string) || projectName.toUpperCase().slice(0, 5);
  return { projectName, assetType, budget, communitySize, ticker };
}
