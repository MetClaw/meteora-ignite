import type {
  SkillResponse,
  FounderContext,
  TokenomicsInput,
  TokenomicsOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

const WEIGHTS = {
  supplyDistribution: 0.30,
  vestingSchedule: 0.25,
  initialCirculating: 0.20,
  security: 0.15,
  concentrationRisk: 0.10,
};

function scoreSupplyDistribution(
  distribution: TokenomicsInput["distribution"],
  redFlags: string[]
): { score: number; assessment: string; recommendation: string } {
  const teamAlloc = distribution
    .filter((d) =>
      ["team", "founders", "advisors", "insiders"].some((k) =>
        d.category.toLowerCase().includes(k)
      )
    )
    .reduce((sum, d) => sum + d.percentage, 0);

  const communityAlloc = distribution
    .filter((d) =>
      ["community", "ecosystem", "public", "airdrop", "rewards"].some((k) =>
        d.category.toLowerCase().includes(k)
      )
    )
    .reduce((sum, d) => sum + d.percentage, 0);

  let score = 100;

  if (teamAlloc > 30) {
    score -= 50;
    redFlags.push(
      `Team/insider allocation is ${teamAlloc.toFixed(1)}% -- above the 30% red-flag threshold.`
    );
  } else if (teamAlloc > 20) {
    score -= 20;
  }

  if (communityAlloc < 40) {
    score -= 20;
  }

  score = Math.max(0, score);

  const assessment =
    score >= 80
      ? `Team at ${teamAlloc.toFixed(1)}%, community at ${communityAlloc.toFixed(1)}% -- healthy distribution.`
      : score >= 50
      ? `Team at ${teamAlloc.toFixed(1)}%, community at ${communityAlloc.toFixed(1)}% -- acceptable but worth improving.`
      : `Team at ${teamAlloc.toFixed(1)}%, community at ${communityAlloc.toFixed(1)}% -- distribution skewed toward insiders.`;

  const recommendation =
    teamAlloc > 20
      ? "Reduce team/insider allocation below 20% and increase community/ecosystem share above 40%."
      : communityAlloc < 40
      ? "Increase community allocation above 40% to signal long-term alignment."
      : "Distribution looks solid. Document rationale publicly to build trust.";

  return { score, assessment, recommendation };
}

function scoreVestingSchedule(
  distribution: TokenomicsInput["distribution"],
  redFlags: string[]
): { score: number; assessment: string; recommendation: string } {
  const hasAnyVesting = distribution.some((d) => d.vestingMonths > 0);

  if (!hasAnyVesting) {
    redFlags.push(
      "No vesting periods found. Tokens are fully unlocked at launch -- severe dump risk."
    );
    return {
      score: 0,
      assessment: "No vesting schedules detected. This is a critical red flag.",
      recommendation:
        "Implement at least 6-month vesting with a 1-month cliff for all team and investor allocations.",
    };
  }

  const insiderAllocs = distribution.filter((d) =>
    ["team", "founders", "advisors", "insiders", "investor", "seed", "private"].some((k) =>
      d.category.toLowerCase().includes(k)
    )
  );

  const unvestedInsiders = insiderAllocs.filter((d) => d.vestingMonths === 0);
  if (unvestedInsiders.length > 0) {
    redFlags.push(
      `Insider allocation(s) with no vesting: ${unvestedInsiders.map((d) => d.category).join(", ")}.`
    );
  }

  const relevantAllocs = insiderAllocs.length > 0 ? insiderAllocs : distribution;
  const avgVesting =
    relevantAllocs.reduce((sum, d) => sum + d.vestingMonths, 0) / relevantAllocs.length;

  let score: number;
  if (avgVesting >= 6 && avgVesting <= 12) {
    score = 100;
  } else if (avgVesting > 12) {
    score = 85; // Long vesting is fine, slightly less flexible
  } else if (avgVesting >= 3) {
    score = 60;
  } else {
    score = 30;
    if (avgVesting > 0) {
      redFlags.push(
        `Average vesting of ${avgVesting.toFixed(1)} months is too short -- under 3 months is insufficient protection.`
      );
    }
  }

  if (unvestedInsiders.length > 0) {
    score = Math.max(0, score - 40);
  }

  const assessment =
    score >= 80
      ? `Average insider vesting of ~${avgVesting.toFixed(0)} months. Good unlock timeline.`
      : score >= 50
      ? `Average insider vesting of ~${avgVesting.toFixed(0)} months. Adequate but could be stronger.`
      : `Vesting is insufficient. Average ~${avgVesting.toFixed(0)} months for insiders.`;

  const recommendation =
    avgVesting < 6
      ? "Extend vesting to 6-12 months minimum for team and investors. Add a 1-3 month cliff."
      : unvestedInsiders.length > 0
      ? `Add vesting to: ${unvestedInsiders.map((d) => d.category).join(", ")}.`
      : "Vesting structure is solid. Publish the full schedule on-chain or in a public doc.";

  return { score, assessment, recommendation };
}

function scoreInitialCirculating(
  initialCirculating: number,
  redFlags: string[]
): { score: number; assessment: string; recommendation: string } {
  let score: number;

  if (initialCirculating > 50) {
    score = 10;
    redFlags.push(
      `Initial circulating supply is ${initialCirculating}% -- above 50% creates significant sell pressure at launch.`
    );
  } else if (initialCirculating < 5) {
    score = 20;
    redFlags.push(
      `Initial circulating supply is only ${initialCirculating}% -- below 5% can suppress liquidity and inflate perceived FDV.`
    );
  } else if (initialCirculating >= 10 && initialCirculating <= 30) {
    score = 100; // Sweet spot
  } else if (initialCirculating >= 5 && initialCirculating < 10) {
    score = 65;
  } else {
    // 30-50%
    score = 70;
  }

  const assessment =
    score >= 80
      ? `${initialCirculating}% circulating at launch -- sits in the ideal 10-30% range.`
      : score >= 50
      ? `${initialCirculating}% circulating at launch -- workable but outside the optimal range.`
      : `${initialCirculating}% circulating at launch -- this level presents meaningful risk.`;

  const recommendation =
    initialCirculating > 50
      ? "Reduce launch-day circulation below 30% by staggering unlock schedules."
      : initialCirculating < 5
      ? "Increase initial float above 5% to ensure sufficient liquidity and price discovery."
      : initialCirculating >= 10 && initialCirculating <= 30
      ? "Float is in the ideal range. Communicate the unlock schedule clearly to the community."
      : "Consider adjusting float toward the 10-30% sweet spot for balanced launch dynamics.";

  return { score, assessment, recommendation };
}

function scoreSecurity(
  hasLPLock: boolean,
  hasMultisig: boolean,
  redFlags: string[]
): { score: number; assessment: string; recommendation: string } {
  const score = hasLPLock && hasMultisig ? 100 : hasLPLock || hasMultisig ? 50 : 0;

  if (!hasLPLock) {
    redFlags.push("LP is not locked -- liquidity can be pulled at any time (rug risk).");
  }
  if (!hasMultisig) {
    redFlags.push("No multisig on treasury/admin keys -- single point of failure for fund control.");
  }

  const assessment =
    score === 100
      ? "LP is locked and treasury uses multisig. Strong security posture."
      : score === 50
      ? hasLPLock
        ? "LP is locked but no multisig on admin keys."
        : "Multisig is in place but LP is unlocked."
      : "Neither LP lock nor multisig detected. High rug risk.";

  const recommendation =
    score === 100
      ? "Security setup is solid. Consider publishing lock and multisig addresses publicly."
      : !hasLPLock
      ? "Lock LP immediately using a service like Streamflow or Meteora's built-in lock. Minimum 6-12 months."
      : "Set up a 2-of-3 or 3-of-5 multisig for any admin or treasury key using Squads Protocol.";

  return { score, assessment, recommendation };
}

function scoreConcentrationRisk(
  distribution: TokenomicsInput["distribution"],
  redFlags: string[]
): { score: number; assessment: string; recommendation: string } {
  const dominant = distribution.filter((d) => d.percentage > 50);

  if (dominant.length > 0) {
    dominant.forEach((d) => {
      redFlags.push(
        `"${d.category}" holds ${d.percentage}% of supply -- single-category concentration above 50%.`
      );
    });

    return {
      score: 0,
      assessment: `${dominant.map((d) => `"${d.category}" at ${d.percentage}%`).join(", ")} dominate${dominant.length > 1 ? "" : "s"} supply.`,
      recommendation:
        "No single category should exceed 50% of total supply. Redistribute across community, ecosystem, and liquidity buckets.",
    };
  }

  const highConcentration = distribution.filter((d) => d.percentage > 35);
  const score = highConcentration.length === 0 ? 100 : 70;

  const assessment =
    score === 100
      ? "No single category exceeds 35% of supply. Well-balanced."
      : `${highConcentration.map((d) => `"${d.category}" at ${d.percentage}%`).join(", ")} -- elevated but below critical threshold.`;

  const recommendation =
    score === 100
      ? "Concentration risk is low. Keep monitoring as vesting unlocks occur."
      : "Consider reducing the largest allocation below 35% to improve resilience.";

  return { score, assessment, recommendation };
}

export async function executeTokenomicsReview(
  input: SkillParams,
  _context?: FounderContext
): Promise<SkillResponse> {
  const params = input as TokenomicsInput;
  const redFlags: string[] = [];

  // Score each dimension, passing redFlags array to collect issues
  const supplyResult = scoreSupplyDistribution(params.distribution, redFlags);
  const vestingResult = scoreVestingSchedule(params.distribution, redFlags);
  const circulatingPct = (params.initialCirculating / params.totalSupply) * 100;
  const circulatingResult = scoreInitialCirculating(circulatingPct, redFlags);
  const securityResult = scoreSecurity(params.hasLPLock, params.hasMultisig, redFlags);
  const concentrationResult = scoreConcentrationRisk(params.distribution, redFlags);

  const dimensions: TokenomicsOutput["dimensions"] = [
    {
      name: "Supply Distribution",
      score: supplyResult.score,
      assessment: supplyResult.assessment,
      recommendation: supplyResult.recommendation,
    },
    {
      name: "Vesting Schedule",
      score: vestingResult.score,
      assessment: vestingResult.assessment,
      recommendation: vestingResult.recommendation,
    },
    {
      name: "Initial Circulating",
      score: circulatingResult.score,
      assessment: circulatingResult.assessment,
      recommendation: circulatingResult.recommendation,
    },
    {
      name: "Security",
      score: securityResult.score,
      assessment: securityResult.assessment,
      recommendation: securityResult.recommendation,
    },
    {
      name: "Concentration Risk",
      score: concentrationResult.score,
      assessment: concentrationResult.assessment,
      recommendation: concentrationResult.recommendation,
    },
  ];

  const overallScore = Math.round(
    supplyResult.score * WEIGHTS.supplyDistribution +
      vestingResult.score * WEIGHTS.vestingSchedule +
      circulatingResult.score * WEIGHTS.initialCirculating +
      securityResult.score * WEIGHTS.security +
      concentrationResult.score * WEIGHTS.concentrationRisk
  );

  const benchmarks: TokenomicsOutput["benchmarks"] = [
    {
      project: "Top 10 Meme Launch",
      metric: "Team Allocation",
      value: "10-15%",
    },
    {
      project: "Top 10 Meme Launch",
      metric: "Initial Circulating",
      value: "15-25%",
    },
    {
      project: "Top 10 Meme Launch",
      metric: "Vesting (Team)",
      value: "12 months",
    },
    {
      project: "Successful Utility Token",
      metric: "Team Allocation",
      value: "18-22%",
    },
    {
      project: "Successful Utility Token",
      metric: "Initial Circulating",
      value: "10-20%",
    },
    {
      project: "Successful Utility Token",
      metric: "Vesting (Team)",
      value: "24-36 months",
    },
    {
      project: "Blue Chip DeFi",
      metric: "Team Allocation",
      value: "15-20%",
    },
    {
      project: "Blue Chip DeFi",
      metric: "Initial Circulating",
      value: "5-15%",
    },
    {
      project: "Blue Chip DeFi",
      metric: "Vesting (Team)",
      value: "48 months",
    },
  ];

  const sources = [makeSource("Tokenomics Review Engine", "local/tokenomics-scoring")];

  const data: TokenomicsOutput = {
    overallScore,
    dimensions,
    redFlags,
    benchmarks,
  };

  const verdict =
    overallScore >= 80
      ? "Strong tokenomics structure."
      : overallScore >= 60
      ? "Solid foundation with room to improve."
      : overallScore >= 40
      ? "Several issues need addressing before launch."
      : "Significant structural problems -- do not launch without remediation.";

  const flagSummary =
    redFlags.length === 0
      ? "No red flags found."
      : `${redFlags.length} red flag${redFlags.length > 1 ? "s" : ""} identified.`;

  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  const summary = `Tokenomics scored **${overallScore}/100**. ${verdict} ${flagSummary} Weakest dimension: ${weakest.name} (${weakest.score}/100).`;

  return buildSkillResponse("tokenomics-review", {
    status: redFlags.length > 3 ? "partial" : "success",
    data,
    summary,
    nextSteps: ["pool-setup", "community-setup", "content-draft"],
    sources,
  });
}
