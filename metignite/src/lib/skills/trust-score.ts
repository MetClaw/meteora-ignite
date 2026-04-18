import type {
  TrustScoreInput,
  TrustScoreOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

// Dimension weights -- modeled on what the BD team actually checks
const WEIGHTS = {
  trackRecord: 0.20,
  narrativeOwnership: 0.15,
  socialPresence: 0.15,
  securitySetup: 0.20,
  communityPreLaunch: 0.10,
  vestingTransparency: 0.10,
  independence: 0.10,
};

interface DimensionResult {
  name: string;
  score: number;
  weight: number;
  assessment: string;
  recommendation: string;
}

function scoreTrackRecord(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  let score = 0;

  if (input.isDoxxed) score += 40;
  if (input.hasPriorProjects) score += 30;

  const outcome = input.priorProjectOutcome ?? "none";
  switch (outcome) {
    case "success":
      score += 30;
      break;
    case "mixed":
      score += 15;
      break;
    case "failed":
      score += 5;
      break;
    case "rugged":
      score = -100;
      redFlags.push("Serial rug profile detected");
      break;
    case "none":
      break;
  }

  score = Math.max(0, Math.min(100, score));

  const assessment =
    outcome === "rugged"
      ? "Prior project was rugged -- automatic disqualification."
      : input.isDoxxed && input.hasPriorProjects && outcome === "success"
      ? "Doxxed founder with a successful track record -- strong credibility signal."
      : input.isDoxxed
      ? "Doxxed founder, but track record could be stronger."
      : "Anonymous founder -- higher bar for everything else.";

  const recommendation =
    outcome === "rugged"
      ? "This profile cannot proceed through MetIgnite."
      : !input.isDoxxed
      ? "Consider doxxing to at least one trusted third party or KYC provider."
      : !input.hasPriorProjects
      ? "Document any prior work -- even non-crypto projects help build credibility."
      : "Track record looks solid. Make it visible in your public materials.";

  return {
    name: "Track Record",
    score,
    weight: WEIGHTS.trackRecord,
    assessment,
    recommendation,
  };
}

function scoreNarrativeOwnership(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  const score = input.ownsNarrative ? 100 : 30;

  if (!input.ownsNarrative) {
    redFlags.push(
      "Founder does not own their narrative -- depends on external marketing to drive interest"
    );
  }

  const assessment = input.ownsNarrative
    ? "Founder owns their narrative and can articulate their vision independently."
    : "Founder depends on Meteora's marketing for success -- historically these teams don't make it.";

  const recommendation = input.ownsNarrative
    ? "Keep refining your story. The best founders can pitch in 30 seconds or 30 minutes."
    : "Before launching, you need a clear story only you can tell. No platform can manufacture that for you.";

  return {
    name: "Narrative Ownership",
    score,
    weight: WEIGHTS.narrativeOwnership,
    assessment,
    recommendation,
  };
}

function scoreSocialPresence(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  const score = Math.max(0, Math.min(100, input.socialPresenceScore));

  if (score < 30) {
    redFlags.push("No established social presence before launch");
  }

  const assessment =
    score >= 80
      ? "Strong social presence -- audience already exists before launch."
      : score >= 50
      ? "Moderate social presence -- enough to seed early traction."
      : score >= 30
      ? "Weak social presence -- will need significant effort to build awareness."
      : "Virtually no social presence -- launching into a void.";

  const recommendation =
    score >= 70
      ? "Leverage your existing audience. They are your launch multiplier."
      : score >= 40
      ? "Spend 2-4 weeks building social presence before launch. Post daily, engage in Solana communities."
      : "Do not launch yet. Build a real social presence first -- at least 4-6 weeks of consistent activity.";

  return {
    name: "Social Presence",
    score,
    weight: WEIGHTS.socialPresence,
    assessment,
    recommendation,
  };
}

function scoreSecuritySetup(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  let score = 0;

  if (input.hasMultisig) score += 35;
  if (input.hasLPLock) score += 35;
  if (input.willRevokeAuthorities) score += 30;

  if (score === 0) {
    redFlags.push(
      "No security measures in place -- no multisig, no LP lock, no authority revocation"
    );
  }

  const assessment =
    score === 100
      ? "Full security setup -- multisig, LP lock, and authority revocation."
      : score >= 65
      ? "Partial security setup -- some measures in place but gaps remain."
      : score > 0
      ? "Minimal security setup -- significant trust gaps."
      : "Zero security measures -- this is a dealbreaker for serious evaluation.";

  const missing: string[] = [];
  if (!input.hasMultisig) missing.push("set up a multisig");
  if (!input.hasLPLock) missing.push("lock LP tokens");
  if (!input.willRevokeAuthorities) missing.push("plan to revoke mint/freeze authorities");

  const recommendation =
    missing.length === 0
      ? "Security setup is complete. Document it publicly for community trust."
      : `Before launch: ${missing.join(", ")}. These are table stakes for credibility.`;

  return {
    name: "Security Setup",
    score,
    weight: WEIGHTS.securitySetup,
    assessment,
    recommendation,
  };
}

function scoreCommunityPreLaunch(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  let score = 0;

  if (input.hasCommunityPreLaunch) {
    score = 60;

    if (input.communitySize > 500) {
      score += 40;
    } else if (input.communitySize > 200) {
      score += 25;
    } else if (input.communitySize > 50) {
      score += 15;
    }
  }

  const assessment = input.hasCommunityPreLaunch
    ? input.communitySize > 500
      ? `Pre-launch community of ${input.communitySize} -- strong foundation for launch day.`
      : input.communitySize > 200
      ? `Pre-launch community of ${input.communitySize} -- decent base to build on.`
      : `Pre-launch community of ${input.communitySize} -- exists but needs growth before launch.`
    : "No pre-launch community -- launching cold.";

  const recommendation = !input.hasCommunityPreLaunch
    ? "Build a community before you launch. Even 50 engaged members beats 0."
    : input.communitySize <= 200
    ? "Grow your community to at least 200 engaged members before launch. Focus on quality over quantity."
    : "Community base looks healthy. Focus on engagement quality and converting members to advocates.";

  return {
    name: "Community Pre-Launch",
    score,
    weight: WEIGHTS.communityPreLaunch,
    assessment,
    recommendation,
  };
}

function scoreVestingTransparency(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  let score = 0;

  if (input.hasVesting) score += 60;
  if (input.budgetTransparency) score += 40;

  if (!input.hasVesting && !input.budgetTransparency) {
    redFlags.push("No vesting schedule and no budget transparency");
  }

  const assessment =
    score === 100
      ? "Vesting in place and budget is transparent -- strong accountability signals."
      : input.hasVesting
      ? "Vesting schedule exists but budget transparency is lacking."
      : input.budgetTransparency
      ? "Budget is transparent but no vesting schedule -- team tokens can dump at any time."
      : "No vesting and no budget transparency -- trust deficit.";

  const recommendation =
    score === 100
      ? "Publish your vesting schedule and budget breakdown publicly. Transparency compounds trust."
      : !input.hasVesting
      ? "Implement a vesting schedule for team tokens. Minimum 6-12 months with a cliff."
      : "Publish a clear budget breakdown. Communities reward transparency.";

  return {
    name: "Vesting & Transparency",
    score,
    weight: WEIGHTS.vestingTransparency,
    assessment,
    recommendation,
  };
}

function scoreIndependence(
  input: TrustScoreInput,
  redFlags: string[]
): DimensionResult {
  let score = 0;
  let factors = 0;

  if (input.ownsNarrative) {
    score += 33;
    factors++;
  }
  if (input.socialPresenceScore > 50) {
    score += 34;
    factors++;
  }
  if (input.hasCommunityPreLaunch) {
    score += 33;
    factors++;
  }

  const assessment =
    factors === 3
      ? "Fully independent -- this founder can sustain without MetIgnite pushing them."
      : factors === 2
      ? "Mostly independent -- one gap to close before full self-sufficiency."
      : factors === 1
      ? "Partially dependent -- needs significant support to sustain post-launch."
      : "Fully dependent -- cannot sustain without external support.";

  const recommendation =
    factors === 3
      ? "You have the foundation to run independently. MetIgnite accelerates you -- it doesn't carry you."
      : "Build self-sufficiency before launch. Can you sustain momentum for 30 days without anyone's help?";

  return {
    name: "Independence",
    score,
    weight: WEIGHTS.independence,
    assessment,
    recommendation,
  };
}

function getBdComparison(verdict: TrustScoreOutput["verdict"]): string {
  switch (verdict) {
    case "rejected":
      return (
        "Your trust profile is comparable to teams that get filtered out immediately " +
        "by the BD team. Fundamental issues need to be resolved before any evaluation can happen."
      );
    case "not-ready":
      return (
        "Your trust profile is comparable to teams asked to come back when they've built " +
        "more foundation. The potential may be there, but the basics aren't in place yet."
      );
    case "conditional":
      return (
        "Your trust profile is comparable to teams that get a second look with conditions. " +
        "Address the flagged items and you move into active consideration."
      );
    case "approved":
      return (
        "Your trust profile is comparable to teams that move to active evaluation by the BD team. " +
        "You've cleared the credibility bar -- now it's about execution."
      );
    case "strong":
      return (
        "Your trust profile is comparable to the top tier teams that get fast-tracked by the BD team. " +
        "Strong fundamentals across the board."
      );
  }
}

export async function executeTrustScore(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as TrustScoreInput;
  const redFlags: string[] = [];
  const greenFlags: string[] = [];
  const requiredActions: string[] = [];

  // Score all 7 dimensions
  const dimensions: DimensionResult[] = [
    scoreTrackRecord(params, redFlags),
    scoreNarrativeOwnership(params, redFlags),
    scoreSocialPresence(params, redFlags),
    scoreSecuritySetup(params, redFlags),
    scoreCommunityPreLaunch(params, redFlags),
    scoreVestingTransparency(params, redFlags),
    scoreIndependence(params, redFlags),
  ];

  // Check for instant disqualification
  const isRugger = params.priorProjectOutcome === "rugged";

  // Calculate weighted overall score
  let overallScore: number;

  if (isRugger) {
    overallScore = 0;
  } else {
    overallScore = dimensions.reduce(
      (sum, dim) => sum + dim.score * dim.weight,
      0
    );
    overallScore = Math.round(overallScore * 100) / 100;
  }

  // Generate green flags (dimensions scoring > 80)
  for (const dim of dimensions) {
    if (dim.score > 80) {
      greenFlags.push(`${dim.name}: ${dim.assessment}`);
    }
  }

  // Generate required actions (dimensions scoring < 50)
  for (const dim of dimensions) {
    if (dim.score < 50) {
      requiredActions.push(`${dim.name}: ${dim.recommendation}`);
    }
  }

  // Determine verdict
  let verdict: TrustScoreOutput["verdict"];
  if (isRugger) {
    verdict = "rejected";
  } else if (overallScore < 30) {
    verdict = "rejected";
  } else if (overallScore < 50) {
    verdict = "not-ready";
  } else if (overallScore < 70) {
    verdict = "conditional";
  } else if (overallScore < 85) {
    verdict = "approved";
  } else {
    verdict = "strong";
  }

  const bdComparison = getBdComparison(verdict);

  const output: TrustScoreOutput = {
    overallScore,
    verdict,
    dimensions: dimensions.map((d) => ({
      name: d.name,
      score: d.score,
      weight: d.weight,
      assessment: d.assessment,
      recommendation: d.recommendation,
    })),
    redFlags,
    greenFlags,
    requiredActions,
    bdComparison,
  };

  const sources = [makeSource("MetIgnite Trust Rubric", "internal://skills/trust-score")];

  const verdictLabels: Record<TrustScoreOutput["verdict"], string> = {
    rejected: "Rejected",
    "not-ready": "Not Ready",
    conditional: "Conditional",
    approved: "Approved",
    strong: "Strong",
  };

  const summary =
    `Trust Score: ${overallScore}/100 -- Verdict: ${verdictLabels[verdict]}. ` +
    `${redFlags.length} red flag${redFlags.length !== 1 ? "s" : ""}, ` +
    `${greenFlags.length} green flag${greenFlags.length !== 1 ? "s" : ""}, ` +
    `${requiredActions.length} required action${requiredActions.length !== 1 ? "s" : ""}.`;

  const nextSteps: string[] = [];

  if (verdict === "rejected") {
    nextSteps.push("Address all red flags before reapplying.");
  } else if (verdict === "not-ready") {
    nextSteps.push("Complete required actions and resubmit for evaluation.");
    nextSteps.push("Focus on security setup and social presence first.");
  } else if (verdict === "conditional") {
    nextSteps.push("Address required actions to move to approved status.");
    nextSteps.push("Run tokenomics-review to continue the qualify phase.");
  } else {
    nextSteps.push("Proceed to tokenomics-review and pool-setup.");
    nextSteps.push("Your trust profile clears the bar -- focus on execution now.");
  }

  return buildSkillResponse("trust-score", {
    data: output,
    summary,
    nextSteps,
    sources,
  });
}
