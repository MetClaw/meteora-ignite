import type {
  ListingOpsInput,
  ListingOpsOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

type Platform = ListingOpsOutput["platforms"][0];
type Budget = ListingOpsInput["budget"];

function buildDexScreenerProfile(input: ListingOpsInput): Platform {
  const hasLogo = input.hasLogo;
  const hasSocials = input.hasSocials;
  const hasWebsite = input.hasWebsite;

  const requirements = [
    {
      item: "Active trading pool on supported DEX",
      met: Boolean(input.poolAddress),
      notes: input.poolAddress
        ? "Pool detected on Meteora"
        : "Deploy pool on Meteora first -- DexScreener indexes automatically",
    },
    {
      item: "Token logo (256x256 PNG, transparent background)",
      met: hasLogo,
      notes: hasLogo
        ? "Logo available"
        : "Upload via DexScreener token profile update",
    },
    {
      item: "Social links (Twitter, Telegram, Website)",
      met: hasSocials,
      notes: hasSocials
        ? "Socials configured"
        : "Add at least Twitter and one community link",
    },
    {
      item: "Website URL",
      met: hasWebsite,
      notes: hasWebsite ? "Website available" : "Even a simple landing page works",
    },
    {
      item: "$299 payment for enhanced profile",
      met: true,
      notes: "Pay via DexScreener token profile page -- crypto accepted",
    },
  ];

  const allMet = requirements.every((r) => r.met);
  const ticker = input.tokenTicker || input.projectName.toUpperCase().slice(0, 4);

  return {
    platform: "DexScreener Enhanced Profile",
    status: allMet ? "ready" : "missing-requirements",
    cost: "$299",
    roi: "Highest impact per dollar. Traders check DexScreener first -- empty profile = assumed scam",
    requirements,
    submissionUrl: "https://dexscreener.com/solana",
    estimatedTime: "Live within minutes of payment",
    priority: "critical",
    preFilled: {
      projectName: input.projectName,
      tokenTicker: `$${ticker}`,
      tokenMint: input.tokenMint,
      socialLinks: "[Twitter, Telegram, Website -- fill before submitting]",
      description: `${input.projectName} ($${ticker}) -- ${input.assetType} token on Solana`,
    },
  };
}

function buildDexScreenerBoosting(input: ListingOpsInput): Platform {
  const ticker = input.tokenTicker || input.projectName.toUpperCase().slice(0, 4);
  const recommended = input.budget === "funded";

  return {
    platform: "DexScreener Boosting (Golden Ticker)",
    status: recommended ? "ready" : "not-applicable",
    cost: "$4,000+ ($8/boost x 500 for Golden Ticker)",
    roi: "Temporarily boosts trending score. High cost, short-lived impact. Skip unless funded.",
    requirements: [
      {
        item: "Enhanced profile already active",
        met: false,
        notes: "Must have enhanced profile ($299) before boosting",
      },
      {
        item: "Budget of $4,000+ for meaningful boost",
        met: recommended,
        notes: recommended
          ? "Funded budget -- boosting is an option"
          : "Not recommended for bootstrap/seed budgets",
      },
    ],
    submissionUrl: "https://dexscreener.com/solana",
    estimatedTime: "Instant activation, effect lasts while boosts are active",
    priority: "low",
    preFilled: {
      tokenMint: input.tokenMint,
      tokenTicker: `$${ticker}`,
      boostTarget: "500 boosts for Golden Ticker",
    },
  };
}

function buildJupiterVerified(input: ListingOpsInput): Platform {
  const hasPool = Boolean(input.poolAddress);
  const hasLogo = input.hasLogo;
  const hasSocials = input.hasSocials;
  const hasWebsite = input.hasWebsite;
  const ticker = input.tokenTicker || input.projectName.toUpperCase().slice(0, 4);

  const canAffordExpress = input.budget !== "bootstrap";
  const costNote = canAffordExpress
    ? "Free (or burn 1,000 JUP for express 24hr review -- ~$700-1000)"
    : "Free (express review available but not recommended for bootstrap)";

  const requirements = [
    {
      item: "Active liquidity pool (minimum $500 liquidity)",
      met: hasPool,
      notes: hasPool
        ? "Pool active on Meteora"
        : "Deploy pool with minimum $500 liquidity",
    },
    {
      item: "Token metadata registered on-chain",
      met: hasLogo,
      notes: "Must have name, symbol, and image URI via Metaplex Token Metadata",
    },
    {
      item: "Not flagged as scam or duplicate",
      met: true,
      notes: "Jupiter maintains a ban list -- ensure unique token name and no impersonation",
    },
    {
      item: "Community verification for verified list",
      met: hasSocials && hasWebsite,
      notes: hasSocials && hasWebsite
        ? "Prerequisites met for verified list application"
        : "Need active socials + website for verified list",
    },
  ];

  const allMet = requirements.every((r) => r.met);

  return {
    platform: "Jupiter Verified List",
    status: allMet ? "ready" : "missing-requirements",
    cost: costNote,
    roi: "Removes warning badge. Express review costs ~$700-1000 in JUP but guarantees 24hr review.",
    requirements,
    submissionUrl: "https://station.jup.ag/docs/get-your-token-onto-jup",
    estimatedTime: "Auto-listed on 'all' list. Verified: community vote or express review (24hr)",
    priority: "critical",
    preFilled: {
      tokenMint: input.tokenMint,
      tokenTicker: `$${ticker}`,
      projectName: input.projectName,
      metadataCheck: hasLogo ? "on-chain metadata verified" : "NEEDS on-chain metadata setup",
      poolAddress: input.poolAddress || "[deploy pool first]",
    },
  };
}

function buildCoinGecko(input: ListingOpsInput): Platform {
  const hasPool = Boolean(input.poolAddress);
  const hasLogo = input.hasLogo;
  const hasSocials = input.hasSocials;
  const hasWebsite = input.hasWebsite;
  const ticker = input.tokenTicker || input.projectName.toUpperCase().slice(0, 4);

  const requirements = [
    {
      item: "3+ days of trading history",
      met: hasPool,
      notes: "Apply after at least 3 days of active trading volume",
    },
    {
      item: "Token logo (250x250 PNG)",
      met: hasLogo,
      notes: hasLogo ? "Logo available" : "Required for listing submission",
    },
    {
      item: "Project website",
      met: hasWebsite,
      notes: hasWebsite
        ? "Website live"
        : "CoinGecko requires a functional project website",
    },
    {
      item: "Social media presence",
      met: hasSocials,
      notes: "Twitter with active engagement, community channels",
    },
    {
      item: "Accurate supply information on-chain",
      met: true,
      notes: "Total supply, circulating supply must be verifiable",
    },
  ];

  return {
    platform: "CoinGecko",
    status: "missing-requirements",
    cost: "Free",
    roi: "Major credibility signal. Auto-feeds into Birdeye. Apply after 3+ days of trading.",
    requirements,
    submissionUrl: "https://www.coingecko.com/en/coins/new",
    estimatedTime: "5-15 business days after submission",
    priority: "high",
    preFilled: {
      projectName: input.projectName,
      tokenTicker: `$${ticker}`,
      contractAddress: input.tokenMint,
      chain: "Solana",
      description: `${input.projectName} ($${ticker}) -- ${input.assetType} token on Solana`,
      websiteUrl: hasWebsite ? "[your website URL]" : "[NEEDS website]",
      twitterUrl: hasSocials ? "[your Twitter URL]" : "[NEEDS Twitter]",
      telegramUrl: hasSocials ? "[your Telegram URL]" : "[NEEDS Telegram]",
    },
  };
}

function buildBirdeyeFastTrack(input: ListingOpsInput): Platform {
  const hasPool = Boolean(input.poolAddress);
  const hasLogo = input.hasLogo;
  const hasSocials = input.hasSocials;
  const ticker = input.tokenTicker || input.projectName.toUpperCase().slice(0, 4);

  const requirements = [
    {
      item: "Active Solana token with trading pool",
      met: hasPool,
      notes: hasPool
        ? "Pool active"
        : "Deploy pool first -- Birdeye indexes Solana tokens automatically",
    },
    {
      item: "Token metadata on-chain (name, symbol, logo)",
      met: hasLogo,
      notes: hasLogo
        ? "Metadata configured"
        : "Set token metadata via Metaplex before launch",
    },
    {
      item: "Social links for token profile",
      met: hasSocials,
      notes: hasSocials
        ? "Socials available"
        : "Submit via Birdeye token listing form",
    },
  ];

  const allMet = requirements.every((r) => r.met);

  return {
    platform: "Birdeye Fast Track",
    status: allMet ? "ready" : "missing-requirements",
    cost: "$200-300 (or free after CoinGecko lists you)",
    roi: "If you get CoinGecko first, Birdeye auto-pulls. Fast track only worth it if you need Birdeye before CG.",
    requirements,
    submissionUrl: "https://birdeye.so",
    estimatedTime: "Fast track: 1-3 days. Free via CG: auto after CG listing",
    priority: "medium",
    preFilled: {
      tokenMint: input.tokenMint,
      tokenTicker: `$${ticker}`,
      projectName: input.projectName,
      chain: "Solana",
    },
  };
}

function buildCoinMarketCap(input: ListingOpsInput): Platform {
  const hasPool = Boolean(input.poolAddress);
  const hasLogo = input.hasLogo;
  const hasWebsite = input.hasWebsite;
  const hasSocials = input.hasSocials;
  const ticker = input.tokenTicker || input.projectName.toUpperCase().slice(0, 4);

  const requirements = [
    {
      item: "Live trading on a supported exchange/DEX",
      met: hasPool,
      notes: "Meteora pools are tracked -- ensure active volume",
    },
    {
      item: "Project website with team/documentation",
      met: hasWebsite,
      notes: "CMC prefers projects with clear documentation",
    },
    {
      item: "Block explorer listing (Solscan)",
      met: true,
      notes: "Solana tokens are auto-listed on Solscan",
    },
    {
      item: "Token logo (200x200 PNG)",
      met: hasLogo,
      notes: hasLogo ? "Logo available" : "Required for submission",
    },
    {
      item: "Community/social proof",
      met: hasSocials,
      notes: "Active Twitter, Telegram/Discord with real engagement",
    },
  ];

  return {
    platform: "CoinMarketCap",
    status: "missing-requirements",
    cost: "Free ($5K for priority review)",
    roi: "Biggest aggregator. Apply after CoinGecko. Priority review rarely worth it.",
    requirements,
    submissionUrl: "https://support.coinmarketcap.com/hc/en-us/requests/new",
    estimatedTime: "2-4 weeks (can be longer)",
    priority: "medium",
    preFilled: {
      projectName: input.projectName,
      tokenTicker: `$${ticker}`,
      contractAddress: input.tokenMint,
      chain: "Solana",
      description: `${input.projectName} ($${ticker}) -- ${input.assetType} token on Solana`,
      websiteUrl: hasWebsite ? "[your website URL]" : "[NEEDS website]",
    },
  };
}

function buildSubmissionOrder(): ListingOpsOutput["submissionOrder"] {
  return [
    {
      step: 1,
      platform: "DexScreener Enhanced Profile",
      when: "Day 1, before first trade",
      why: "First thing traders see. Empty profile = assumed scam.",
    },
    {
      step: 2,
      platform: "Jupiter Verified List",
      when: "Day 1, after pool deployed",
      why: "Removes warning badge. Express review gets you verified in 24hr.",
    },
    {
      step: 3,
      platform: "CoinGecko",
      when: "Day 4-7, after 3+ days trading history",
      why: "Major credibility signal. Auto-feeds into Birdeye.",
    },
    {
      step: 4,
      platform: "Birdeye Fast Track",
      when: "Auto after CG listing, or fast track day 1-3",
      why: "If CoinGecko is pending, fast track gets you on Birdeye sooner.",
    },
    {
      step: 5,
      platform: "CoinMarketCap",
      when: "Month 1, after CoinGecko listing",
      why: "Biggest aggregator but slowest. Apply after CG confirms.",
    },
  ];
}

function buildBudgetPlans(): ListingOpsOutput["budgetPlan"] {
  return [
    {
      tier: "bootstrap",
      platforms: ["DexScreener Enhanced Profile"],
      totalCost: "~$300",
      impact: "Covers the essentials. Traders see a real profile instead of a blank page. Jupiter free listing handles the rest.",
    },
    {
      tier: "seed",
      platforms: [
        "DexScreener Enhanced Profile",
        "Jupiter Express Review",
        "Birdeye Fast Track",
      ],
      totalCost: "~$1,350",
      impact: "Verified on Jupiter within 24hr, visible on Birdeye day 1, credible DexScreener profile. Strong first impression.",
    },
    {
      tier: "funded",
      platforms: [
        "DexScreener Enhanced Profile",
        "DexScreener Boosting (Golden Ticker)",
        "Jupiter Express Review",
        "Birdeye Fast Track",
      ],
      totalCost: "$5,000+",
      impact: "Maximum visibility from day 1. Golden ticker drives trending placement. Only worth it if you have the budget to sustain momentum.",
    },
  ];
}

function calculateTotalCost(budget: Budget): string {
  switch (budget) {
    case "bootstrap":
      return "~$300";
    case "seed":
      return "~$1,350";
    case "funded":
      return "$5,000+";
  }
}

function filterPlatformsByBudget(
  platforms: Platform[],
  budget: Budget
): Platform[] {
  if (budget === "funded") return platforms;

  // Non-funded budgets: mark boosting as not applicable
  return platforms.map((p) => {
    if (p.platform === "DexScreener Boosting (Golden Ticker)") {
      return { ...p, status: "not-applicable" as const };
    }
    return p;
  });
}

export async function executeListingOps(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const projectName = (input.projectName as string) || context?.projectName || "Project";
  const tokenMint = (input.tokenMint as string) || "";
  const tokenTicker = (input.tokenTicker as string) || projectName.toUpperCase().slice(0, 4);
  const assetType = (input.assetType as string) || context?.assetType || "utility";
  const budget = (input.budget as Budget) || context?.budget || "bootstrap";

  const parsedInput: ListingOpsInput = {
    projectName,
    tokenMint,
    tokenTicker,
    assetType,
    hasLogo: Boolean(input.hasLogo),
    hasSocials: Boolean(input.hasSocials),
    hasWebsite: Boolean(input.hasWebsite),
    poolAddress: (input.poolAddress as string) || undefined,
    budget,
  };

  const allPlatforms = [
    buildDexScreenerProfile(parsedInput),
    buildDexScreenerBoosting(parsedInput),
    buildJupiterVerified(parsedInput),
    buildCoinGecko(parsedInput),
    buildBirdeyeFastTrack(parsedInput),
    buildCoinMarketCap(parsedInput),
  ];

  const platforms = filterPlatformsByBudget(allPlatforms, budget);

  const readyCount = platforms.filter((p) => p.status === "ready").length;
  const applicableCount = platforms.filter((p) => p.status !== "not-applicable").length;
  const overallReadiness = applicableCount > 0
    ? Math.round((readyCount / applicableCount) * 100)
    : 0;

  const submissionOrder = buildSubmissionOrder();
  const budgetPlan = buildBudgetPlans();
  const totalCost = calculateTotalCost(budget);

  const sources = [
    makeSource("DexScreener token profiles", "https://dexscreener.com"),
    makeSource("Jupiter listing docs", "https://station.jup.ag/docs"),
    makeSource("CoinGecko listing form", "https://www.coingecko.com/en/coins/new"),
    makeSource("Birdeye", "https://birdeye.so"),
    makeSource("CoinMarketCap listing", "https://support.coinmarketcap.com"),
  ];

  const data: ListingOpsOutput = {
    platforms,
    totalCost,
    submissionOrder,
    budgetPlan,
    overallReadiness,
  };

  return buildSkillResponse("listing-ops", {
    data,
    summary: `Listing ops for $${tokenTicker} (${budget} budget): ${readyCount}/${applicableCount} platforms ready. Estimated total cost: ${totalCost}. Start with DexScreener enhanced profile on day 1, then Jupiter verified list.`,
    nextSteps: [
      `Run community-setup to prepare socials before listing submissions`,
      `Run comms-calendar to schedule listing announcements across platforms`,
      readyCount < applicableCount
        ? `Address missing requirements on ${applicableCount - readyCount} platform(s) before submitting`
        : "All applicable platforms ready -- begin submissions in order",
    ],
    sources,
  });
}
