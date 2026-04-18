import type {
  SkillResponse,
  FounderContext,
  GrowthPlaybookInput,
  GrowthPlaybookOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse, resolveCommonParams } from "./types";

function getWeeklyPlan(
  assetType: string,
  budget: string,
  communitySize: number,
  primaryGoal: string
): GrowthPlaybookOutput["weeks"] {
  const isBootstrap = budget === "bootstrap";
  const hasSmallCommunity = communitySize < 500;

  // Week 1: Launch Week
  const week1: GrowthPlaybookOutput["weeks"][0] = {
    week: 1,
    theme: "Launch & Initial Traction",
    objectives: [
      "Execute launch communications across all channels",
      "Drive initial LP deposits and trading volume",
      "Establish community engagement rhythm",
    ],
    actions: [
      {
        action: "Post launch announcement thread on Twitter/X",
        channel: "Twitter/X",
        effort: "low",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Pin launch details in Telegram/Discord",
        channel: "Telegram",
        effort: "low",
        impact: "medium",
        budgetRequired: false,
      },
      {
        action: "Submit to DEX Screener and aggregator listings",
        channel: "DEX Screener",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Host a Twitter/X Space with founding team",
        channel: "Twitter/X",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      ...(isBootstrap
        ? []
        : [
            {
              action: "Run initial KOL campaign (3-5 targeted callouts)" as string,
              channel: "Twitter/X" as string,
              effort: "medium" as const,
              impact: "high" as const,
              budgetRequired: true,
            },
          ]),
    ],
    kpis: [
      { metric: "Unique holders", target: hasSmallCommunity ? "200+" : "500+" },
      { metric: "Daily volume", target: assetType === "meme" ? "$50K+" : "$10K+" },
      { metric: "Twitter impressions", target: "50K+" },
      { metric: "Telegram members", target: hasSmallCommunity ? "300+" : "1K+" },
    ],
  };

  // Week 2: Momentum
  const week2: GrowthPlaybookOutput["weeks"][0] = {
    week: 2,
    theme: "Build Momentum & Community Depth",
    objectives: [
      "Convert launch visitors into active community members",
      "Establish content cadence",
      "Begin partnership conversations",
    ],
    actions: [
      {
        action: "Daily engagement posts (polls, questions, updates)",
        channel: "Twitter/X + Telegram",
        effort: "medium",
        impact: "medium",
        budgetRequired: false,
      },
      {
        action: "Share pool performance data (fees earned, volume)",
        channel: "Twitter/X",
        effort: "low",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Start outreach to 5-10 complementary projects for partnerships",
        channel: "DM/Email",
        effort: "high",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Run community AMA with detailed roadmap discussion",
        channel: "Discord/Telegram",
        effort: "medium",
        impact: "medium",
        budgetRequired: false,
      },
      ...(primaryGoal === "holders"
        ? [
            {
              action: "Launch referral or airdrop campaign for new holders" as string,
              channel: "Twitter/X + on-chain" as string,
              effort: "high" as const,
              impact: "high" as const,
              budgetRequired: true,
            },
          ]
        : []),
    ],
    kpis: [
      { metric: "Unique holders", target: hasSmallCommunity ? "500+" : "1K+" },
      { metric: "Daily active Telegram users", target: "50+" },
      { metric: "Partnership conversations started", target: "5+" },
      { metric: "Content pieces published", target: "5+" },
    ],
  };

  // Week 3-4: Growth
  const week3: GrowthPlaybookOutput["weeks"][0] = {
    week: 3,
    theme: "Expand Reach & Deepen Engagement",
    objectives: [
      "Secure first partnership or integration",
      "Grow holder base through organic channels",
      "Establish thought leadership content",
    ],
    actions: [
      {
        action: "Publish a detailed explainer article or video about the project",
        channel: "Medium/YouTube",
        effort: "high",
        impact: "medium",
        budgetRequired: false,
      },
      {
        action: "Guest on 1-2 crypto podcasts or Twitter Spaces",
        channel: "Podcasts",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Launch community ambassador or contributor program",
        channel: "Discord",
        effort: "high",
        impact: "high",
        budgetRequired: assetType === "meme" ? false : true,
      },
      {
        action: "Apply to Solana ecosystem listings (Solana FM, Step Finance)",
        channel: "Ecosystem",
        effort: "low",
        impact: "medium",
        budgetRequired: false,
      },
    ],
    kpis: [
      { metric: "Unique holders", target: hasSmallCommunity ? "1K+" : "2K+" },
      { metric: "Partnerships secured", target: "1-2" },
      { metric: "Podcast/Space appearances", target: "2+" },
    ],
  };

  const week4: GrowthPlaybookOutput["weeks"][0] = {
    week: 4,
    theme: "Consolidate & Plan Phase 2",
    objectives: [
      "Review all KPIs against targets",
      "Identify top-performing channels and double down",
      "Plan next 4-week sprint based on data",
    ],
    actions: [
      {
        action: "Publish a transparent month-1 report (metrics, learnings, next steps)",
        channel: "Twitter/X + Blog",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Host a community feedback session",
        channel: "Discord/Telegram",
        effort: "low",
        impact: "medium",
        budgetRequired: false,
      },
      {
        action: "Optimize pool parameters based on 4 weeks of data",
        channel: "Meteora",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Set up automated analytics dashboard (Dune, Flipside)",
        channel: "On-chain",
        effort: "high",
        impact: "medium",
        budgetRequired: false,
      },
    ],
    kpis: [
      { metric: "Month-over-month holder growth", target: "30%+" },
      { metric: "Community retention (DAU/MAU)", target: "20%+" },
      { metric: "Total fees earned by LPs", target: "Published publicly" },
    ],
  };

  // Weeks 5-8: Scaling phase
  const week5: GrowthPlaybookOutput["weeks"][0] = {
    week: 5,
    theme: "Scale What Works",
    objectives: [
      "Double down on highest-ROI growth channels from weeks 1-4",
      "Launch LP incentive program or vault strategy",
      "Expand to new platforms",
    ],
    actions: [
      {
        action: "Launch LP incentive program (fee-sharing, bonus rewards)",
        channel: "Meteora",
        effort: "high",
        impact: "high",
        budgetRequired: true,
      },
      {
        action: "Cross-promote with 2-3 confirmed partners",
        channel: "Twitter/X + Telegram",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Create educational content about LP strategies for your pool",
        channel: "YouTube/Twitter",
        effort: "high",
        impact: "medium",
        budgetRequired: false,
      },
    ],
    kpis: [
      { metric: "TVL growth", target: "50%+ from week 4" },
      { metric: "Active LPs", target: "20+" },
      { metric: "Weekly volume", target: "2x week 4" },
    ],
  };

  const week8: GrowthPlaybookOutput["weeks"][0] = {
    week: 8,
    theme: "Sustain & Systemize",
    objectives: [
      "Transition from founder-led growth to community-driven growth",
      "Establish repeatable growth loops",
      "Set 90-day targets",
    ],
    actions: [
      {
        action: "Publish 2-month retrospective with full transparency",
        channel: "Twitter/X + Blog",
        effort: "medium",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Formalize community governance (if applicable)",
        channel: "On-chain",
        effort: "high",
        impact: "high",
        budgetRequired: false,
      },
      {
        action: "Set up recurring content calendar (weekly updates, monthly reports)",
        channel: "All",
        effort: "medium",
        impact: "medium",
        budgetRequired: false,
      },
    ],
    kpis: [
      { metric: "Total unique holders", target: hasSmallCommunity ? "3K+" : "5K+" },
      { metric: "Organic daily volume", target: assetType === "meme" ? "$100K+" : "$25K+" },
      { metric: "Community-generated content pieces", target: "10+/week" },
    ],
  };

  return [week1, week2, week3, week4, week5, week8];
}

function getBudgetBreakdown(budget: string): GrowthPlaybookOutput["budgetBreakdown"] {
  if (budget === "bootstrap") {
    return [
      { category: "Content creation", allocation: "Time only", notes: "Founder-led. Use free tools (Canva, Typefully)." },
      { category: "Community management", allocation: "Time only", notes: "Founder or 1 volunteer mod." },
      { category: "KOL/Influencer", allocation: "$0", notes: "Rely on organic mentions and partnerships." },
      { category: "Tools & infrastructure", allocation: "$50-100/mo", notes: "Hosting, analytics, bot subscriptions." },
    ];
  }
  if (budget === "seed") {
    return [
      { category: "Content creation", allocation: "$500-1K/mo", notes: "Part-time content lead or freelancer." },
      { category: "Community management", allocation: "$300-500/mo", notes: "1 part-time community mod." },
      { category: "KOL/Influencer", allocation: "$1K-3K total", notes: "3-5 targeted micro-KOLs. Avoid broad spray." },
      { category: "LP incentives", allocation: "$1K-5K total", notes: "Fee-sharing or bonus rewards for early LPs." },
      { category: "Tools & infrastructure", allocation: "$100-200/mo", notes: "Analytics, bots, hosting." },
    ];
  }
  // funded
  return [
    { category: "Content creation", allocation: "$2K-5K/mo", notes: "Dedicated content team or agency." },
    { category: "Community management", allocation: "$1K-2K/mo", notes: "2-3 mods across time zones." },
    { category: "KOL/Influencer", allocation: "$5K-15K total", notes: "10-15 KOLs across tiers. Track ROI per KOL." },
    { category: "LP incentives", allocation: "$10K-50K total", notes: "Structured LP program with vesting." },
    { category: "Events & Spaces", allocation: "$1K-3K/mo", notes: "Regular Twitter Spaces, IRL meetups." },
    { category: "Tools & infrastructure", allocation: "$300-500/mo", notes: "Full analytics stack, premium bots." },
  ];
}

function getRisks(assetType: string, budget: string): GrowthPlaybookOutput["risks"] {
  const risks: GrowthPlaybookOutput["risks"] = [
    {
      risk: "Post-launch volume decline after initial hype",
      mitigation: "Plan week 2-3 catalysts in advance (partnerships, features, content drops). Never rely solely on launch momentum.",
      severity: "high",
    },
    {
      risk: "Community fatigue from over-posting",
      mitigation: "Quality over quantity. 2-3 meaningful posts per day max. Let community conversations happen organically.",
      severity: "medium",
    },
    {
      risk: "LP withdrawal if fees underperform",
      mitigation: "Set realistic fee expectations. Publish weekly LP performance reports. Consider incentive programs.",
      severity: "high",
    },
  ];

  if (assetType === "meme") {
    risks.push({
      risk: "Narrative shift -- meme tokens rely on cultural relevance",
      mitigation: "Build utility alongside the meme. Create community identity beyond price action.",
      severity: "high",
    });
  }

  if (budget === "bootstrap") {
    risks.push({
      risk: "Founder burnout from doing everything alone",
      mitigation: "Recruit 2-3 volunteer mods early. Automate what you can. Focus on 2 channels, not 5.",
      severity: "medium",
    });
  }

  return risks;
}

function getBenchmarks(assetType: string): GrowthPlaybookOutput["benchmarks"] {
  if (assetType === "meme") {
    return [
      { metric: "Unique holders", week4Target: "2K", week8Target: "5K", topDecile: "50K+" },
      { metric: "Daily volume", week4Target: "$50K", week8Target: "$100K", topDecile: "$1M+" },
      { metric: "Twitter followers", week4Target: "5K", week8Target: "15K", topDecile: "100K+" },
      { metric: "TVL", week4Target: "$100K", week8Target: "$500K", topDecile: "$5M+" },
    ];
  }
  if (assetType === "stablecoin" || assetType === "lst") {
    return [
      { metric: "TVL", week4Target: "$500K", week8Target: "$2M", topDecile: "$50M+" },
      { metric: "Daily volume", week4Target: "$100K", week8Target: "$500K", topDecile: "$10M+" },
      { metric: "Integrations", week4Target: "2", week8Target: "5", topDecile: "20+" },
      { metric: "Active LPs", week4Target: "30", week8Target: "100", topDecile: "500+" },
    ];
  }
  // utility / governance
  return [
    { metric: "Unique holders", week4Target: "1K", week8Target: "3K", topDecile: "20K+" },
    { metric: "Daily volume", week4Target: "$10K", week8Target: "$50K", topDecile: "$500K+" },
    { metric: "Twitter followers", week4Target: "3K", week8Target: "10K", topDecile: "50K+" },
    { metric: "TVL", week4Target: "$200K", week8Target: "$1M", topDecile: "$10M+" },
  ];
}

export async function executeGrowthPlaybook(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as GrowthPlaybookInput;
  const { projectName, assetType, budget, communitySize } = resolveCommonParams(input, context);
  const primaryGoal = params.primaryGoal || "awareness";

  const weeks = getWeeklyPlan(assetType, budget, communitySize, primaryGoal);
  const budgetBreakdown = getBudgetBreakdown(budget);
  const risks = getRisks(assetType, budget);
  const benchmarks = getBenchmarks(assetType);

  const sources = [makeSource("Growth Playbook Engine", "local/growth-planning")];

  const data: GrowthPlaybookOutput = {
    timeframe: "8 weeks (2 sprints of 4 weeks)",
    weeks,
    budgetBreakdown,
    risks,
    benchmarks,
  };

  const totalActions = weeks.reduce((sum, w) => sum + w.actions.length, 0);
  const paidActions = weeks.reduce(
    (sum, w) => sum + w.actions.filter((a) => a.budgetRequired).length,
    0
  );

  const summary = `Generated **8-week growth playbook** for ${projectName} (${assetType}, ${budget} budget). ${totalActions} actions across ${weeks.length} milestone weeks. ${paidActions} actions require budget. Primary goal: ${primaryGoal}. ${risks.length} risks identified with mitigations.`;

  return buildSkillResponse("growth-playbook", {
    data,
    summary,
    nextSteps: ["analytics", "outreach", "community-setup"],
    sources,
  });
}
