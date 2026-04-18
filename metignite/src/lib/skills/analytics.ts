import type {
  SkillResponse,
  FounderContext,
  AnalyticsOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

// Generates simulated metrics; wire to DefiLlama/Dune/Birdeye for real data.

function generatePoolMetrics(
  assetType: string,
  timeframe: string
): AnalyticsOutput["poolMetrics"] {
  // MVP: realistic mock data by asset type
  // Phase 3: replace with DefiLlama/Meteora SDK calls
  const baseVolume = assetType === "meme" ? 250000 : assetType === "stablecoin" ? 1500000 : 500000;
  const baseFees = baseVolume * 0.003;
  const baseTvl = assetType === "meme" ? 50000 : assetType === "stablecoin" ? 2000000 : 200000;

  const timeMultiplier = timeframe === "24h" ? 1 : timeframe === "7d" ? 7 : 30;

  return [
    {
      metric: "Volume",
      value: `$${(baseVolume * timeMultiplier).toLocaleString()}`,
      change: assetType === "meme" ? "+34.2%" : "+12.5%",
      trend: "up",
    },
    {
      metric: "Fees Earned",
      value: `$${(baseFees * timeMultiplier).toLocaleString()}`,
      change: assetType === "meme" ? "+28.7%" : "+10.1%",
      trend: "up",
    },
    {
      metric: "TVL",
      value: `$${baseTvl.toLocaleString()}`,
      change: assetType === "meme" ? "+15.3%" : "+5.2%",
      trend: "up",
    },
    {
      metric: "Price",
      value: assetType === "meme" ? "$0.00042" : assetType === "stablecoin" ? "$1.0002" : "$2.45",
      change: assetType === "meme" ? "+85.2%" : assetType === "stablecoin" ? "+0.02%" : "+8.3%",
      trend: assetType === "stablecoin" ? "flat" : "up",
    },
    {
      metric: "Unique Traders",
      value: `${Math.round((assetType === "meme" ? 1200 : 350) * timeMultiplier * 0.6)}`,
      change: "+22.1%",
      trend: "up",
    },
    {
      metric: "Fee APR",
      value: `${assetType === "meme" ? "145.3" : assetType === "stablecoin" ? "8.2" : "42.7"}%`,
      change: assetType === "meme" ? "+18.5%" : "+3.1%",
      trend: "up",
    },
  ];
}

function generateLpActivity(
  assetType: string
): AnalyticsOutput["lpActivity"] {
  return [
    {
      metric: "Active LP Positions",
      value: assetType === "meme" ? "47" : "128",
      percentile: assetType === "meme" ? "Top 35%" : "Top 20%",
    },
    {
      metric: "Average Position Size",
      value: assetType === "meme" ? "$1,064" : "$15,625",
      percentile: assetType === "meme" ? "Top 50%" : "Top 25%",
    },
    {
      metric: "LP Retention (7d)",
      value: assetType === "meme" ? "62%" : "84%",
      percentile: assetType === "meme" ? "Top 40%" : "Top 15%",
    },
    {
      metric: "Position Duration (avg)",
      value: assetType === "meme" ? "3.2 days" : "14.5 days",
      percentile: assetType === "meme" ? "Top 55%" : "Top 25%",
    },
    {
      metric: "Concentrated Liquidity Ratio",
      value: assetType === "stablecoin" ? "92%" : "78%",
      percentile: "Top 20%",
    },
  ];
}

function generateVolumeBreakdown(
  assetType: string,
  timeframe: string
): AnalyticsOutput["volumeBreakdown"] {
  const baseDaily = assetType === "meme" ? 250000 : assetType === "stablecoin" ? 1500000 : 500000;
  const feeRate = assetType === "meme" ? 0.008 : assetType === "stablecoin" ? 0.001 : 0.003;

  if (timeframe === "24h") {
    return [
      {
        period: "0-6h",
        volume: `$${Math.round(baseDaily * 0.2).toLocaleString()}`,
        fees: `$${Math.round(baseDaily * 0.2 * feeRate).toLocaleString()}`,
        transactions: Math.round(assetType === "meme" ? 340 : 120),
      },
      {
        period: "6-12h",
        volume: `$${Math.round(baseDaily * 0.35).toLocaleString()}`,
        fees: `$${Math.round(baseDaily * 0.35 * feeRate).toLocaleString()}`,
        transactions: Math.round(assetType === "meme" ? 580 : 200),
      },
      {
        period: "12-18h",
        volume: `$${Math.round(baseDaily * 0.3).toLocaleString()}`,
        fees: `$${Math.round(baseDaily * 0.3 * feeRate).toLocaleString()}`,
        transactions: Math.round(assetType === "meme" ? 490 : 170),
      },
      {
        period: "18-24h",
        volume: `$${Math.round(baseDaily * 0.15).toLocaleString()}`,
        fees: `$${Math.round(baseDaily * 0.15 * feeRate).toLocaleString()}`,
        transactions: Math.round(assetType === "meme" ? 250 : 90),
      },
    ];
  }

  // 7d or 30d breakdown by day groups
  const periods = timeframe === "7d"
    ? ["Day 1-2", "Day 3-4", "Day 5-6", "Day 7"]
    : ["Week 1", "Week 2", "Week 3", "Week 4"];

  const weights = timeframe === "7d" ? [0.35, 0.25, 0.25, 0.15] : [0.3, 0.25, 0.25, 0.2];
  const multiplier = timeframe === "7d" ? 7 : 30;
  const totalVolume = baseDaily * multiplier;

  return periods.map((period, i) => ({
    period,
    volume: `$${Math.round(totalVolume * weights[i]).toLocaleString()}`,
    fees: `$${Math.round(totalVolume * weights[i] * feeRate).toLocaleString()}`,
    transactions: Math.round((assetType === "meme" ? 1660 : 580) * multiplier * weights[i]),
  }));
}

function calculateHealthScore(
  assetType: string
): { score: number; factors: AnalyticsOutput["healthFactors"] } {
  const factors: AnalyticsOutput["healthFactors"] = [
    {
      factor: "Volume Consistency",
      score: assetType === "meme" ? 65 : 82,
      assessment: assetType === "meme"
        ? "Volatile -- typical for meme tokens. Volume spikes then drops."
        : "Steady volume with moderate growth trend.",
    },
    {
      factor: "LP Depth",
      score: assetType === "meme" ? 55 : assetType === "stablecoin" ? 90 : 72,
      assessment: assetType === "meme"
        ? "Thin liquidity relative to volume. Slippage risk on large trades."
        : "Healthy liquidity depth for current volume levels.",
    },
    {
      factor: "Fee Efficiency",
      score: assetType === "meme" ? 78 : assetType === "stablecoin" ? 85 : 75,
      assessment: "Fee capture is efficient. DLMM concentrated positions are well-placed.",
    },
    {
      factor: "Trader Diversity",
      score: assetType === "meme" ? 60 : 75,
      assessment: assetType === "meme"
        ? "High concentration -- top 10 wallets drive 45% of volume."
        : "Good distribution across trader wallets.",
    },
    {
      factor: "Price Stability",
      score: assetType === "meme" ? 35 : assetType === "stablecoin" ? 95 : 68,
      assessment: assetType === "meme"
        ? "High volatility. Expected for meme tokens but impacts LP impermanent loss."
        : assetType === "stablecoin"
          ? "Tight peg. Minimal price deviation."
          : "Moderate volatility within acceptable range.",
    },
  ];

  const score = Math.round(
    factors.reduce((sum, f) => sum + f.score, 0) / factors.length
  );

  return { score, factors };
}

function getRecommendations(
  assetType: string,
  healthScore: number
): string[] {
  const recs: string[] = [];

  if (healthScore < 60) {
    recs.push("Pool health is below average. Consider adding more liquidity to improve depth and reduce slippage.");
  }

  if (assetType === "meme") {
    recs.push(
      "Meme token pools benefit from wider bin ranges to handle volatility spikes",
      "Consider setting a higher base fee (80-100 bps) to maximize LP fee capture during high-volume periods",
      "Monitor top wallet concentration -- if top 10 wallets exceed 50% of volume, diversify outreach"
    );
  } else if (assetType === "stablecoin") {
    recs.push(
      "Tight bin ranges (1-2 step) maximize capital efficiency for stable pairs",
      "Low base fee (1-5 bps) keeps you competitive with other stable pools",
      "Focus on TVL growth -- stablecoin pools need depth more than marketing"
    );
  } else {
    recs.push(
      "Consider adjusting bin step width based on recent volatility",
      "Monitor fee APR vs. impermanent loss -- rebalance if IL exceeds fees",
      "Engage LP community with transparent performance updates"
    );
  }

  recs.push(
    "Run the growth-playbook skill for a structured plan to increase volume and TVL",
    "Track these metrics weekly to spot trends early"
  );

  return recs;
}

export async function executeAnalytics(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const projectName = (input.projectName as string) || context?.projectName || "Project";
  const assetType = (input.assetType as string) || context?.assetType || "utility";
  const timeframe = (input.timeframe as string) || "7d";

  // MVP: mock data shaped for real API integration
  // Phase 3: atlas replaces with DefiLlama/Dune/Birdeye/Meteora SDK calls
  const poolMetrics = generatePoolMetrics(assetType, timeframe);
  const lpActivity = generateLpActivity(assetType);
  const volumeBreakdown = generateVolumeBreakdown(assetType, timeframe);
  const { score: healthScore, factors: healthFactors } = calculateHealthScore(assetType);
  const recommendations = getRecommendations(assetType, healthScore);

  const sources = [makeSource("Mock data (MVP)", "internal://analytics-mock")];

  const volume = poolMetrics.find((m) => m.metric === "Volume")?.value || "N/A";
  const fees = poolMetrics.find((m) => m.metric === "Fees Earned")?.value || "N/A";

  return buildSkillResponse("analytics", {
    status: "partial",
    data: {
      poolMetrics,
      lpActivity,
      volumeBreakdown,
      healthScore,
      healthFactors,
      recommendations,
      dataSource: "Mock data for MVP. Phase 3 will connect to DefiLlama, Dune, Birdeye, and Meteora SDK for real-time data.",
    } satisfies AnalyticsOutput,
    summary: `${projectName} pool analytics (${timeframe}): ${volume} volume, ${fees} fees earned, ${healthScore}/100 health score. Note: using simulated data for MVP.`,
    nextSteps: [
      "Review health score factors to identify areas for improvement",
      healthScore < 70
        ? "Focus on improving LP depth and trader diversity"
        : "Pool metrics are healthy. Focus on growth and volume",
      "Run growth-playbook skill for strategies to improve these metrics",
      "Phase 3 will connect real-time data from DefiLlama, Dune, and Birdeye",
    ],
    sources,
  });
}
