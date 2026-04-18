import type {
  SkillResponse,
  FounderContext,
  PoolSetupInput,
  PoolSetupOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

// BD intel: default to DBC/DAMM v2 for new founders, DLMM only for experienced
function recommendPoolType(
  assetType: string,
  initialLiquidity: number,
  targetVolume: string,
  isExperienced?: boolean
): PoolSetupOutput["recommendedPool"] {
  // Stablecoins and LSTs always use DAMM v2 (stable swap curve)
  if (assetType === "stablecoin" || assetType === "lst") return "DAMM_v2";
  // Experienced founders with high volume targets can use DLMM
  if (isExperienced && targetVolume === "high") return "DLMM";
  // New token launches use DBC -- built-in price discovery, fee split for creators
  // DBC is the default for new founders: simpler, creator fee split, less IL risk
  if (initialLiquidity < 50000) return "DBC";
  // Medium liquidity with utility/governance -- DAMM v2 for passive management
  if (assetType === "utility" || assetType === "governance") return "DAMM_v2";
  // Meme tokens with substantial liquidity can use DLMM
  if (assetType === "meme" && initialLiquidity >= 50000) return "DLMM";
  // Default to DBC for safety -- founders can graduate to DLMM later
  return "DBC";
}

function recommendBinStep(
  assetType: string,
  targetVolume: string
): number {
  // Tighter bins for stable assets, wider for volatile
  if (assetType === "stablecoin") return 1;
  if (assetType === "lst") return 5;
  if (assetType === "meme" && targetVolume === "high") return 80;
  if (assetType === "meme") return 100;
  if (targetVolume === "high") return 40;
  return 20;
}

function recommendBaseFee(poolType: string, assetType: string): number {
  if (poolType === "DAMM_v2" && assetType === "stablecoin") return 1; // 0.01%
  if (poolType === "DAMM_v2") return 4; // 0.04%
  if (assetType === "meme") return 80; // 0.8% -- high volatility = high fees
  return 30; // 0.3% standard
}

function recommendStrategy(
  assetType: string,
  targetVolume: string
): PoolSetupOutput["positionStrategy"] {
  if (assetType === "stablecoin" || assetType === "lst") return "curve";
  if (assetType === "meme" && targetVolume === "high") return "bid-ask";
  return "spot";
}

function estimateFees(
  initialLiquidity: number,
  baseFee: number,
  targetVolume: string
): PoolSetupOutput["estimatedFees"] {
  // Volume multiplier based on target
  const volumeMultiplier =
    targetVolume === "high" ? 5 : targetVolume === "medium" ? 2 : 0.5;
  const dailyVolume = initialLiquidity * volumeMultiplier;
  const dailyFees = dailyVolume * (baseFee / 10000);

  return {
    daily: Math.round(dailyFees * 100) / 100,
    monthly: Math.round(dailyFees * 30 * 100) / 100,
    annual: Math.round(dailyFees * 365 * 100) / 100,
  };
}

function buildComparisons(
  recommended: string,
  initialLiquidity: number,
  targetVolume: string
): PoolSetupOutput["comparisons"] {
  const allTypes = [
    {
      poolType: "DLMM",
      feeRate: 30,
      tradeoffs: "Highest fee capture. Requires active management (rebalancing). Best for volatile pairs.",
    },
    {
      poolType: "DAMM_v2",
      feeRate: 4,
      tradeoffs: "Lower fees, passive management. Best for stable/correlated pairs.",
    },
    {
      poolType: "DBC",
      feeRate: 50,
      tradeoffs: "Built-in price discovery curve. Best for new token launches with limited initial liquidity.",
    },
  ];

  return allTypes
    .filter((t) => t.poolType !== recommended)
    .map((t) => ({
      poolType: t.poolType,
      estimatedFees: estimateFees(initialLiquidity, t.feeRate, targetVolume)
        .monthly,
      tradeoffs: t.tradeoffs,
    }));
}

export async function executePoolSetup(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as PoolSetupInput;
  const assetType = params.assetType || context?.assetType || "utility";

  const isExperienced = (input.isExperienced as boolean) || false;
  const recommendedPool = recommendPoolType(
    assetType,
    params.initialLiquidity,
    params.targetVolume,
    isExperienced
  );
  const binStep = recommendBinStep(assetType, params.targetVolume);
  const baseFee = recommendBaseFee(recommendedPool, assetType);
  const positionStrategy = recommendStrategy(assetType, params.targetVolume);
  const fees = estimateFees(params.initialLiquidity, baseFee, params.targetVolume);
  const comparisons = buildComparisons(
    recommendedPool,
    params.initialLiquidity,
    params.targetVolume
  );

  // Price range: wider for volatile, tighter for stable
  const rangeMultiplier =
    assetType === "stablecoin" ? 0.01 : assetType === "meme" ? 0.8 : 0.3;
  const priceRange = {
    min: 1 - rangeMultiplier,
    max: 1 + rangeMultiplier,
  };

  const sources = [makeSource("Meteora Pool Logic", "local/pool-recommendation-engine")];

  // Fee scheduler education -- Meteora's moat feature
  const feeSchedulerNote = recommendedPool === "DBC"
    ? "DBC includes built-in fee scheduling: higher fees early (anti-snipe) that decrease as trading stabilizes. Creators earn fees from day 1 via the contributor fee split."
    : recommendedPool === "DLMM"
    ? "Consider using Meteora's fee scheduler: start with higher fees (80-100bp) in the first hours to discourage snipers, then reduce to standard (20-40bp) as volume stabilizes."
    : "DAMM v2 pools support fee-by-market-cap: fees automatically adjust based on token market cap. Lower mcap = higher fees (compensates for volatility), higher mcap = lower fees (attracts more volume).";

  const growthPath = recommendedPool !== "DLMM"
    ? `Growth path: Start with ${recommendedPool} (simpler, lower IL risk). As your token matures and you gain experience managing liquidity, consider migrating to DLMM for maximum fee capture.`
    : "You're using DLMM -- this requires active position management. Monitor bins daily and rebalance as price moves.";

  const data: PoolSetupOutput = {
    recommendedPool,
    binStep,
    baseFee,
    positionStrategy,
    priceRange,
    estimatedFees: fees,
    comparisons,
  };

  const summary = `Recommended **${recommendedPool}** pool with ${binStep}-step bins, ${baseFee}bp base fee, and ${positionStrategy} position strategy. Estimated monthly fees: $${fees.monthly.toLocaleString()} on $${params.initialLiquidity.toLocaleString()} liquidity.\n\n${feeSchedulerNote}\n\n${growthPath}`;

  return buildSkillResponse("pool-setup", {
    data,
    summary,
    nextSteps: [
      "tokenomics-review",
      "community-setup",
      "content-draft",
    ],
    sources,
  });
}
