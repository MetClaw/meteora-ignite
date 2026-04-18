import type {
  SkillResponse,
  FounderContext,
  OutreachOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse, resolveCommonParams } from "./types";

function getSpaces(
  assetType: string,
  budget: string
): OutreachOutput["spaces"] {
  const spaces: OutreachOutput["spaces"] = [
    {
      name: "Meteora Community Spaces",
      platform: "Twitter/X",
      audience: "Solana DeFi LPs and traders",
      relevance: "high",
      contactMethod: "Apply via Meteora Discord or tag @MeteoraAG",
      notes: "Best for Meteora-native launches. Direct ecosystem exposure.",
    },
    {
      name: "Solana DeFi Spaces",
      platform: "Twitter/X",
      audience: "Solana ecosystem builders and traders",
      relevance: "high",
      contactMethod: "DM hosts, apply as guest via Twitter",
      notes: "Weekly Spaces covering new Solana projects. High-signal audience.",
    },
    {
      name: "DeFi Alpha Spaces",
      platform: "Twitter/X",
      audience: "DeFi power users and yield farmers",
      relevance: assetType === "meme" ? "medium" : "high",
      contactMethod: "DM host accounts, pitch unique angle",
      notes: "Focus on technical differentiation, not hype.",
    },
  ];

  if (assetType === "meme") {
    spaces.push(
      {
        name: "Degen Trading Spaces",
        platform: "Twitter/X",
        audience: "Meme coin traders, degen community",
        relevance: "high",
        contactMethod: "DM hosts, offer alpha or giveaway tie-in",
        notes: "High reach, low signal. Good for awareness, not retention.",
      },
      {
        name: "Solana Meme Roundtable",
        platform: "Twitter/X",
        audience: "Meme token communities on Solana",
        relevance: "high",
        contactMethod: "Apply via community Discord",
        notes: "Cross-pollination with other meme communities.",
      }
    );
  }

  if (assetType === "utility" || assetType === "governance") {
    spaces.push(
      {
        name: "Solana Builders Spaces",
        platform: "Twitter/X",
        audience: "Developers and protocol builders",
        relevance: "high",
        contactMethod: "Apply via Solana Foundation or host DM",
        notes: "Best for technical projects with real utility.",
      },
      {
        name: "DAO Governance Spaces",
        platform: "Twitter/X",
        audience: "DAO participants and governance enthusiasts",
        relevance: assetType === "governance" ? "high" : "medium",
        contactMethod: "DM host, pitch governance model",
        notes: "Niche but high-quality audience for governance tokens.",
      }
    );
  }

  return spaces;
}

function getPodcasts(assetType: string): OutreachOutput["podcasts"] {
  const podcasts: OutreachOutput["podcasts"] = [
    {
      name: "Validated (Solana)",
      audience: "Solana ecosystem, developers, and investors",
      relevance: "high",
      pitchAngle: "Building on Solana: your project's technical innovation and ecosystem contribution",
      contactMethod: "Apply via Solana Foundation or DM @aaboronkov",
    },
    {
      name: "Lightspeed",
      audience: "Solana DeFi, infrastructure, and ecosystem updates",
      relevance: "high",
      pitchAngle: "DeFi innovation on Solana: how your project advances the ecosystem",
      contactMethod: "DM @0xMert_ or apply via show notes",
    },
    {
      name: "The Stack (Meteora)",
      audience: "Meteora and Solana LP community",
      relevance: "high",
      pitchAngle: "Launch strategy on Meteora: pool setup, liquidity bootstrapping, early results",
      contactMethod: "Apply via Meteora Discord or DM @MeteoraAG",
    },
    {
      name: "Talking Tokens",
      audience: "Token design and tokenomics enthusiasts",
      relevance: assetType === "meme" ? "medium" : "high",
      pitchAngle: "Token design decisions: distribution, vesting, and incentive alignment",
      contactMethod: "DM hosts via Twitter",
    },
    {
      name: "The Index",
      audience: "DeFi analytics and market intelligence",
      relevance: "medium",
      pitchAngle: "Market positioning and data-driven launch strategy",
      contactMethod: "Apply via show website",
    },
  ];

  if (assetType === "meme") {
    podcasts.push({
      name: "Up Only",
      audience: "Crypto trading and meme culture",
      relevance: "high",
      pitchAngle: "Community-first meme token with real liquidity strategy (not just vibes)",
      contactMethod: "DM hosts, offer entertaining segment",
    });
  }

  return podcasts;
}

function getKolTiers(
  budget: string,
  assetType: string
): OutreachOutput["kols"] {
  const tiers: OutreachOutput["kols"] = [
    {
      tier: "nano",
      description: "Solana community members with 1K-10K followers. Authentic, high engagement rates.",
      estimatedCost: budget === "bootstrap" ? "Free (product exchange)" : "$50-200 per post",
      expectedReach: "500-5K impressions per post",
      bestFor: "Building initial social proof and community seeding",
    },
    {
      tier: "micro",
      description: "DeFi-focused accounts with 10K-50K followers. Topic expertise, trusted opinions.",
      estimatedCost: budget === "bootstrap" ? "$100-500" : "$200-1000 per post",
      expectedReach: "5K-25K impressions per post",
      bestFor: "Driving informed interest from DeFi-native audience",
    },
    {
      tier: "macro",
      description: "Prominent crypto accounts with 50K-250K followers. Broad reach, brand recognition.",
      estimatedCost: budget === "funded" ? "$1000-5000 per post" : "Likely out of budget",
      expectedReach: "25K-100K impressions per post",
      bestFor: "Major launch announcements and awareness campaigns",
    },
    {
      tier: "mega",
      description: "Top crypto influencers with 250K+ followers. Maximum reach, sets narrative.",
      estimatedCost: budget === "funded" ? "$5000-25000+ per post" : "Out of budget -- focus on micro/macro",
      expectedReach: "100K-1M+ impressions per post",
      bestFor: "Only justified for funded projects with major launch events",
    },
  ];

  // Filter based on budget
  if (budget === "bootstrap") {
    return tiers.filter((t) => t.tier === "nano" || t.tier === "micro");
  }
  if (budget === "seed") {
    return tiers.filter((t) => t.tier !== "mega");
  }

  return tiers;
}

function getPitchTemplates(
  projectName: string,
  ticker: string,
  keyFeatures: string[],
  assetType: string
): OutreachOutput["pitchTemplates"] {
  const featureList = keyFeatures.length > 0
    ? keyFeatures.slice(0, 3).join(", ")
    : "innovative tokenomics, Meteora-powered liquidity";

  return [
    {
      target: "Twitter Spaces Host",
      subject: `Guest spot: $${ticker} launch on Meteora`,
      body: `Hey! We're launching $${ticker} (${projectName}) on Meteora and would love to join your next Space to share our approach to ${assetType === "meme" ? "building a meme token with real liquidity infrastructure" : "building " + featureList}.\n\nQuick pitch: ${projectName} is ${keyFeatures[0] || "a new Solana project"} launching via Meteora DLMM pools. We can talk about ${assetType === "meme" ? "meme token launch strategy, liquidity bootstrapping, and community building" : "our technical approach, pool strategy, and what we learned building on Solana"}.\n\nHappy to send more details. When's your next Space?`,
      tips: [
        "Keep it under 150 words",
        "Lead with what value you bring to THEIR audience",
        "Offer a specific talking point, not just 'we want exposure'",
        "Follow them and engage with their content before pitching",
      ],
    },
    {
      target: "Podcast Producer",
      subject: `Episode pitch: ${projectName} -- ${assetType === "meme" ? "meme tokens with real infrastructure" : featureList}`,
      body: `Hi! I'm reaching out about a potential episode featuring ${projectName} ($${ticker}).\n\nWe're launching on Solana via Meteora, and our approach to ${featureList} might resonate with your audience.\n\nPotential topics:\n- How we designed our ${assetType} token launch strategy\n- Using Meteora DLMM for concentrated liquidity\n- Lessons learned from our launch preparation\n\nWe can provide data points, charts, and specific examples. Happy to work with your format and timeline.`,
      tips: [
        "Research the podcast's past episodes first",
        "Pitch a story angle, not a shill",
        "Offer 2-3 specific topics they can choose from",
        "Be flexible on timing and format",
      ],
    },
    {
      target: "KOL / Influencer",
      subject: `Collab: $${ticker} launch`,
      body: `Hey! Big fan of your content on ${assetType === "meme" ? "meme tokens" : "DeFi/Solana"}.\n\n$${ticker} (${projectName}) is launching on Meteora. We think your audience would find our approach interesting: ${featureList}.\n\nWould you be open to covering our launch? We can provide:\n- Early access and detailed briefing\n- Exclusive data/charts for your content\n- ${assetType === "meme" ? "Custom memes for your community" : "Technical deep-dive materials"}\n\nLet me know if you're interested and what format works best for you.`,
      tips: [
        "Engage with their content for at least a week before pitching",
        "Never lead with 'how much for a post'",
        "Offer value (data, exclusives) not just money",
        "Be transparent about your project and budget",
      ],
    },
    {
      target: "Community Cross-Promotion",
      subject: `Partnership: ${projectName} x [Their Project]`,
      body: `Hey team! We're building ${projectName} ($${ticker}) on Solana/Meteora and see great synergy with your community.\n\nProposal: cross-promotion around our launch.\n- We shout out your project to our community\n- You share our launch announcement\n- Optional: joint AMA or co-hosted Space\n\nOur community: ${keyFeatures.length > 0 ? keyFeatures[0] : "growing Solana community"}. Launching via Meteora pools.\n\nInterested in exploring this?`,
      tips: [
        "Target projects with similar audience size (not 100x bigger)",
        "Offer genuine value exchange, not just asks",
        "Cross-promotion works best between complementary (not competing) projects",
        "Start with smaller collabs before proposing big joint events",
      ],
    },
  ];
}

function getOutreachTimeline(budget: string): OutreachOutput["outreachTimeline"] {
  return [
    {
      week: 1,
      focus: "Research and list-building",
      actions: [
        "Identify 10 relevant Spaces hosts and engage with their content",
        "List 5 podcasts that cover your asset type",
        "Follow and engage with 20 potential KOL accounts",
        "Join 5 adjacent community Discords/Telegrams",
      ],
    },
    {
      week: 2,
      focus: "Warm outreach",
      actions: [
        "Send first batch of Spaces pitches (top 3 hosts)",
        "Submit podcast applications (2-3 shows)",
        "Start conversations with nano KOLs (value-first, no pitch yet)",
        "Cross-promotion outreach to 2 complementary projects",
      ],
    },
    {
      week: 3,
      focus: "Active campaigns",
      actions: [
        "Confirm Spaces appearances (aim for 1-2 before launch)",
        "Send KOL collaboration proposals",
        budget === "funded"
          ? "Negotiate paid promotion terms with macro KOLs"
          : "Deepen relationships with micro KOLs via genuine engagement",
        "Announce partnerships and cross-promotions",
      ],
    },
    {
      week: 4,
      focus: "Launch amplification",
      actions: [
        "Coordinate launch day coverage with confirmed partners",
        "Brief all KOLs with launch details, contract address, pool links",
        "Live-tweet during Spaces appearances",
        "Thank and tag all partners post-launch",
      ],
    },
  ];
}

export async function executeOutreach(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const { projectName, assetType, budget, communitySize, ticker } = resolveCommonParams(input, context);
  const keyFeatures = (input.keyFeatures as string[]) || [];

  const spaces = getSpaces(assetType, budget);
  const podcasts = getPodcasts(assetType);
  const kols = getKolTiers(budget, assetType);
  const pitchTemplates = getPitchTemplates(projectName, ticker, keyFeatures, assetType);
  const outreachTimeline = getOutreachTimeline(budget);

  const highRelevanceSpaces = spaces.filter((s) => s.relevance === "high").length;
  const highRelevancePodcasts = podcasts.filter((p) => p.relevance === "high").length;

  const sources = [makeSource("Solana ecosystem research", "internal://outreach-database")];

  return buildSkillResponse("outreach", {
    data: {
      spaces,
      podcasts,
      kols,
      pitchTemplates,
      outreachTimeline,
    } satisfies OutreachOutput,
    summary: `Outreach plan for $${ticker}: ${spaces.length} Spaces (${highRelevanceSpaces} high relevance), ${podcasts.length} podcasts (${highRelevancePodcasts} high relevance), ${kols.length} KOL tiers for ${budget} budget, and 4 pitch templates ready to customize.`,
    nextSteps: [
      "Customize pitch templates with your specific project details and links",
      "Start engaging with target Spaces hosts and KOLs this week",
      "Apply to Meteora Community Spaces first (highest relevance)",
      budget === "bootstrap"
        ? "Focus on nano/micro KOLs and cross-promotions (best ROI for bootstrap budget)"
        : "Allocate KOL budget across micro and macro tiers",
      "Run content-draft skill to prepare announcement copy for partners to share",
    ],
    sources,
  });
}
