import type {
  CommsCalendarInput,
  CommsCalendarOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse, resolveCommonParams } from "./types";

type PostType = CommsCalendarOutput["days"][0]["posts"][0]["type"];

interface WeeklyTheme {
  week: number;
  theme: string;
  focus: string;
}

const WEEKLY_THEMES: WeeklyTheme[] = [
  {
    week: 1,
    theme: "Launch & First Impressions",
    focus: "Establish presence, build trust, show activity",
  },
  {
    week: 2,
    theme: "Momentum Building",
    focus: "Engagement, partnerships, community growth",
  },
  {
    week: 3,
    theme: "Deepening Trust",
    focus: "Transparency reports, buyback receipts, dev updates",
  },
  {
    week: 4,
    theme: "Establishing Rhythm",
    focus: "Sustainable cadence, governance teaser, month-1 report",
  },
];

interface CadenceRule {
  platform: string;
  frequency: string;
  bestTimes: string;
}

const CADENCE_RULES: CadenceRule[] = [
  {
    platform: "twitter",
    frequency: "1-2 posts/day",
    bestTimes: "14:00-17:00 UTC",
  },
  {
    platform: "telegram",
    frequency: "1 update/day + responsive engagement",
    bestTimes: "No specific best time -- be responsive",
  },
  {
    platform: "discord",
    frequency: "1 structured update/week + daily community chat",
    bestTimes: "No specific best time -- be present",
  },
];

interface CrisisTemplate {
  scenario: string;
  response: string;
  timing: string;
}

function buildCrisisTemplates(
  projectName: string,
  ticker: string
): CrisisTemplate[] {
  return [
    {
      scenario: "Price dump >20%",
      response:
        `We're aware of the price movement on $${ticker}. ` +
        `Here's what's happening: [context]. ` +
        `Our commitment hasn't changed. [action plan]. ` +
        `Details: [link]`,
      timing: "Within 30 minutes (critical)",
    },
    {
      scenario: "FUD / social attack",
      response:
        `Addressing the claims about ${projectName}:\n\n` +
        `Claim: [specific claim]\n` +
        `Fact: [verifiable fact with proof]\n\n` +
        `We're not going to argue -- here are the receipts: [links]. ` +
        `Our code is open, our LP is locked, and our team is building. ` +
        `Questions? Drop them below.`,
      timing: "Within 2 hours (medium)",
    },
    {
      scenario: "Whale exit",
      response:
        `A large position has been closed on $${ticker}. ` +
        `Pool depth remains at [X]. ` +
        `Our LP lock is [status]. ` +
        `Building continues. ` +
        `Here's what we shipped this week: [update].`,
      timing: "Within 2 hours (medium)",
    },
    {
      scenario: "Technical issue (bug, downtime, exploit)",
      response:
        `We've identified an issue with [component]. ` +
        `We're on it. Current status: [status]. ` +
        `ETA for resolution: [time]. ` +
        `We will post updates every 2 hours until resolved.\n\n` +
        `Latest update ([time]): [details]`,
      timing: "Within 30 minutes (critical) -- updates every 2 hours until resolved",
    },
  ];
}

interface DayPost {
  platform: string;
  time: string;
  content: string;
  type: PostType;
  tips: string[];
}

interface DayTemplate {
  type: PostType;
  platform: string;
  time: string;
  contentFn: (name: string, ticker: string) => string;
  tips: string[];
}

function getDayTemplates(projectName: string, ticker: string): DayTemplate[] {
  // Days 1-30 templates
  return [
    // Week 1: Launch & First Impressions
    {
      type: "announcement",
      platform: "twitter",
      time: "14:00 UTC",
      contentFn: () =>
        `$${ticker} is LIVE on @MeteoraAG.\n\n` +
        `The pool is open. Liquidity is locked. Building starts now.\n\n` +
        `Everything you need to know -- thread below.`,
      tips: [
        "Pin this tweet immediately after posting.",
        "Quote-tweet from ecosystem partner accounts within 30 minutes.",
      ],
    },
    {
      type: "update",
      platform: "telegram",
      time: "15:00 UTC",
      contentFn: () =>
        `First 24 hours of $${ticker}:\n\n` +
        `-- [X] unique holders\n` +
        `-- $[X] volume\n` +
        `-- [X] transactions\n\n` +
        `Day 1 is in the books. Thank you to everyone who showed up early.`,
      tips: [
        "Fill in real numbers -- never fake stats.",
        "Pin this in your Telegram group for early social proof.",
      ],
    },
    {
      type: "education",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `Why we built ${projectName}.\n\n` +
        `The short version: [1-2 sentence origin story].\n\n` +
        `The long version: [thread or blog link].\n\n` +
        `This is bigger than a token. Here's the vision.`,
      tips: [
        "Be authentic -- share the real story, not marketing copy.",
        "This tweet builds founder credibility. Make it personal.",
      ],
    },
    {
      type: "engagement",
      platform: "twitter",
      time: "16:00 UTC",
      contentFn: () =>
        `Quick question for the $${ticker} community:\n\n` +
        `What feature should we prioritize next?\n\n` +
        `A) [Option A]\n` +
        `B) [Option B]\n` +
        `C) [Option C]\n` +
        `D) Something else (reply below)`,
      tips: [
        "Use Twitter polls for maximum engagement.",
        "Reply to every response -- early community members remember who showed up.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "14:30 UTC",
      contentFn: () =>
        `$${ticker} Buyback Report #1\n\n` +
        `-- Bought back: [amount] $${ticker}\n` +
        `-- Burned: [amount]\n` +
        `-- Tx: [solscan link]\n\n` +
        `Receipts, not promises. First of many.`,
      tips: [
        "Always include the Solscan transaction link -- transparency is non-negotiable.",
        "Schedule buyback reports on a consistent day/time so holders expect them.",
      ],
    },
    {
      type: "engagement",
      platform: "telegram",
      time: "16:00 UTC",
      contentFn: () =>
        `Ecosystem partner shoutout:\n\n` +
        `Big thanks to @[partner] for [what they did]. ` +
        `${projectName} doesn't exist in a vacuum -- ` +
        `the Solana ecosystem is what makes this possible.\n\n` +
        `Who should we partner with next? Drop suggestions.`,
      tips: [
        "Tag the partner so they see it and potentially reshare.",
        "Only shout out real partnerships -- never fabricate.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `$${ticker} Week 1 Summary:\n\n` +
        `-- Holders: [X]\n` +
        `-- Volume: $[X]\n` +
        `-- Liquidity depth: $[X]\n` +
        `-- Community members: [X]\n\n` +
        `Week 1 done. Week 2 is about momentum. Here's the plan:`,
      tips: [
        "Use real numbers only. The community will verify.",
        "Tease next week's plans to keep people engaged.",
      ],
    },
    // Week 2: Momentum Building (Days 8-14)
    {
      type: "update",
      platform: "discord",
      time: "16:00 UTC",
      contentFn: () =>
        `Dev Update -- ${projectName}\n\n` +
        `What we shipped this week:\n` +
        `-- [Feature/fix 1]\n` +
        `-- [Feature/fix 2]\n\n` +
        `What's next:\n` +
        `-- [Upcoming work]\n\n` +
        `Building in public. Every week.`,
      tips: [
        "Post dev updates in a dedicated #dev-updates channel.",
        "Keep it concrete -- what shipped, what's next. No fluff.",
      ],
    },
    {
      type: "engagement",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `AMA time.\n\n` +
        `Ask us anything about $${ticker} -- tokenomics, roadmap, ` +
        `the team, whatever.\n\n` +
        `Best question gets [reward/recognition].\n\n` +
        `Go.`,
      tips: [
        "Answer every single question, even the tough ones.",
        "If you don't know the answer, say so and commit to a follow-up date.",
      ],
    },
    {
      type: "engagement",
      platform: "telegram",
      time: "17:00 UTC",
      contentFn: () =>
        `Meme Monday in the $${ticker} chat.\n\n` +
        `Drop your best ${projectName} memes below. ` +
        `Top 3 get pinned for the week.\n\n` +
        `Let's see what you've got.`,
      tips: [
        "Meme contests drive organic engagement -- let the community be creative.",
        "Repost the best memes on Twitter to show community energy.",
      ],
    },
    {
      type: "education",
      platform: "twitter",
      time: "14:00 UTC",
      contentFn: () =>
        `How $${ticker} liquidity works:\n\n` +
        `We use @MeteoraAG's DLMM for concentrated liquidity.\n\n` +
        `What that means for you:\n` +
        `-- Tighter spreads\n` +
        `-- Better prices\n` +
        `-- Deeper markets\n\n` +
        `Here's the full breakdown:`,
      tips: [
        "Educational content builds trust -- show you understand the tech.",
        "Link to Meteora docs for credibility.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "14:30 UTC",
      contentFn: () =>
        `$${ticker} holder milestone: [X] unique wallets now hold the token.\n\n` +
        `Organic growth, no airdrops, no bots.\n\n` +
        `Every holder here chose to be here. That matters.`,
      tips: [
        "Celebrate milestones but keep it factual.",
        "If growth is slower than expected, focus on quality over quantity.",
      ],
    },
    {
      type: "engagement",
      platform: "twitter",
      time: "16:00 UTC",
      contentFn: () =>
        `GM to the $${ticker} community.\n\n` +
        `What's one thing we could do better?\n\n` +
        `Honest feedback only. We're listening.`,
      tips: [
        "Asking for feedback publicly shows confidence and humility.",
        "Actually implement the feedback -- then post about it.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `$${ticker} Week 2 Summary:\n\n` +
        `-- Holders: [X] (up from [Y])\n` +
        `-- Volume: $[X] this week\n` +
        `-- New partnerships: [X]\n` +
        `-- Community growth: [X]%\n\n` +
        `Momentum is building. Week 3 focus: deepening trust.`,
      tips: [
        "Show week-over-week comparisons -- trends matter more than absolutes.",
        "Mention Week 3 theme to set expectations.",
      ],
    },
    // Week 3: Deepening Trust (Days 15-21)
    {
      type: "announcement",
      platform: "twitter",
      time: "14:00 UTC",
      contentFn: () =>
        `Partnership announcement:\n\n` +
        `${projectName} x @[Partner]\n\n` +
        `What this means for $${ticker} holders: [1-2 sentences].\n\n` +
        `Details:`,
      tips: [
        "Coordinate announcement timing with the partner.",
        "Both accounts should post within 15 minutes of each other.",
      ],
    },
    {
      type: "update",
      platform: "telegram",
      time: "15:00 UTC",
      contentFn: () =>
        `Transparency Report -- ${projectName}\n\n` +
        `Treasury balance: [X] SOL\n` +
        `Tokens bought back: [X] $${ticker}\n` +
        `Tokens burned: [X]\n` +
        `Team tokens vested: [X]%\n` +
        `LP lock status: [locked until X]\n\n` +
        `All on-chain. All verifiable. Links below.`,
      tips: [
        "This is your most trust-building post type. Make it thorough.",
        "Include Solscan links for every claim.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "14:30 UTC",
      contentFn: () =>
        `Buyback Report #3 for $${ticker}:\n\n` +
        `-- Amount: [X] $${ticker}\n` +
        `-- Total burned to date: [X]\n` +
        `-- Tx: [link]\n\n` +
        `Consistent. Verifiable. Ongoing.`,
      tips: [
        "Consistency is the point -- same format, same schedule.",
        "Let the numbers speak. No hype needed.",
      ],
    },
    {
      type: "education",
      platform: "discord",
      time: "16:00 UTC",
      contentFn: () =>
        `Dev Update -- Week 3\n\n` +
        `Shipped:\n` +
        `-- [Update 1]\n` +
        `-- [Update 2]\n\n` +
        `In progress:\n` +
        `-- [Work item]\n\n` +
        `Open question for the community: ` +
        `Should we prioritize [A] or [B] next?`,
      tips: [
        "Asking the community for input on dev priorities builds ownership.",
        "Follow through on whichever option wins.",
      ],
    },
    {
      type: "engagement",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `Governance sneak peek for $${ticker}:\n\n` +
        `We're exploring how to give the community more say ` +
        `in ${projectName}'s direction.\n\n` +
        `What kind of decisions should token holders vote on?\n\n` +
        `Drop your thoughts.`,
      tips: [
        "Teasing governance creates anticipation without over-promising.",
        "Collect the feedback -- you'll use it to design the actual system.",
      ],
    },
    {
      type: "engagement",
      platform: "telegram",
      time: "17:00 UTC",
      contentFn: () =>
        `Community spotlight:\n\n` +
        `Shoutout to @[member] for [contribution].\n\n` +
        `The $${ticker} community is what makes this project real. ` +
        `If you're contributing -- creating content, helping newcomers, ` +
        `building tools -- we see you.`,
      tips: [
        "Recognizing community members publicly encourages more participation.",
        "Make sure the person is OK with being spotlighted first.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `$${ticker} Week 3 Summary:\n\n` +
        `-- Trust: LP locked, buybacks on schedule, transparency reports live\n` +
        `-- Growth: [X] holders, $[X] volume\n` +
        `-- Community: governance discussion started\n\n` +
        `Week 4: establishing the rhythm for long-term sustainability.`,
      tips: [
        "By week 3, you should have a clear narrative arc forming.",
        "Use the summary to reinforce that this project is serious and consistent.",
      ],
    },
    // Week 4: Establishing Rhythm (Days 22-30)
    {
      type: "update",
      platform: "twitter",
      time: "14:00 UTC",
      contentFn: () =>
        `$${ticker} Month 1 is almost in the books.\n\n` +
        `Here's what we're preparing for the Month 1 Report:\n` +
        `-- Full financial transparency\n` +
        `-- Community growth metrics\n` +
        `-- Roadmap progress\n` +
        `-- What worked and what didn't\n\n` +
        `Dropping this week.`,
      tips: [
        "Teasing the report builds anticipation for a thorough retrospective.",
        "Start collecting data now -- don't scramble at the end.",
      ],
    },
    {
      type: "education",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `What we've learned building ${projectName} in 3 weeks:\n\n` +
        `1. [Lesson 1]\n` +
        `2. [Lesson 2]\n` +
        `3. [Lesson 3]\n\n` +
        `Building in public means sharing the hard parts too.`,
      tips: [
        "Vulnerability builds trust. Share real lessons, not platitudes.",
        "This content often gets the most engagement -- people respect honesty.",
      ],
    },
    {
      type: "engagement",
      platform: "discord",
      time: "16:00 UTC",
      contentFn: () =>
        `Community call this week.\n\n` +
        `Agenda:\n` +
        `-- Month 1 review\n` +
        `-- Governance proposal discussion\n` +
        `-- Q&A with the team\n\n` +
        `When: [Day] at [Time] UTC\n` +
        `Where: [Discord voice / Twitter Space]\n\n` +
        `Submit questions in advance in #questions.`,
      tips: [
        "Community calls build personal connection -- show your face/voice.",
        "Record and post the recap for those who can't attend live.",
      ],
    },
    {
      type: "update",
      platform: "telegram",
      time: "15:00 UTC",
      contentFn: () =>
        `Buyback Report #4 for $${ticker}:\n\n` +
        `This week: [X] $${ticker} bought back\n` +
        `Total to date: [X]\n` +
        `Total burned: [X]\n` +
        `Tx: [link]\n\n` +
        `Four weeks of consistent buybacks. The rhythm is set.`,
      tips: [
        "By report #4, the consistency itself becomes the story.",
        "Consider creating a running dashboard for all buyback data.",
      ],
    },
    {
      type: "engagement",
      platform: "twitter",
      time: "14:30 UTC",
      contentFn: () =>
        `$${ticker} holders -- what should Month 2 look like?\n\n` +
        `We've got ideas, but we want yours first.\n\n` +
        `Reply with your top priority for ${projectName} next month.`,
      tips: [
        "Crowdsourcing the roadmap creates buy-in.",
        "Compile responses into a public summary post.",
      ],
    },
    {
      type: "announcement",
      platform: "twitter",
      time: "14:00 UTC",
      contentFn: () =>
        `Governance proposal #1 for $${ticker}:\n\n` +
        `[Proposal title]\n\n` +
        `Discussion: [link]\n` +
        `Vote opens: [date]\n\n` +
        `Your tokens, your voice. This is what decentralization looks like.`,
      tips: [
        "First governance proposal should be something meaningful but low-risk.",
        "Give at least 48 hours for discussion before voting opens.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "15:00 UTC",
      contentFn: () =>
        `Dev Update -- Week 4\n\n` +
        `Shipped:\n` +
        `-- [Feature 1]\n` +
        `-- [Feature 2]\n\n` +
        `Month 1 dev summary coming in the full report.`,
      tips: [
        "Keep the cadence even in Week 4 -- rhythm is the goal.",
        "Reference the upcoming Month 1 report for continuity.",
      ],
    },
    {
      type: "engagement",
      platform: "telegram",
      time: "16:00 UTC",
      contentFn: () =>
        `Thank you, $${ticker} community.\n\n` +
        `30 days in. [X] holders. [X] community members.\n\n` +
        `This is just the beginning, but it's a real beginning ` +
        `because you're here.\n\n` +
        `Month 1 report drops tomorrow.`,
      tips: [
        "Gratitude posts are underrated. Mean it.",
        "Build anticipation for the Month 1 report.",
      ],
    },
    {
      type: "update",
      platform: "twitter",
      time: "14:00 UTC",
      contentFn: () =>
        `$${ticker} Month 1 Report:\n\n` +
        `-- Holders: [X]\n` +
        `-- Volume: $[X]\n` +
        `-- Buybacks: [X] $${ticker} total\n` +
        `-- Burned: [X]\n` +
        `-- Partnerships: [X]\n` +
        `-- Community: [X] members\n\n` +
        `Full report: [link]\n\n` +
        `Month 2 starts now. Here's the plan:`,
      tips: [
        "This is your most important post of the month. Make it thorough.",
        "Link to a full report document -- the tweet is just the summary.",
      ],
    },
  ];
}

function generateDayPosts(
  dayIndex: number,
  template: DayTemplate,
  projectName: string,
  ticker: string,
  weekTheme: string
): CommsCalendarOutput["days"][0] {
  const day = dayIndex + 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + dayIndex);
  const dateStr = startDate.toISOString().split("T")[0];

  const post: DayPost = {
    platform: template.platform,
    time: template.time,
    content: template.contentFn(projectName, ticker),
    type: template.type,
    tips: template.tips,
  };

  return {
    day,
    date: dateStr,
    theme: weekTheme,
    posts: [post],
  };
}

export async function executeCommsCalendar(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as CommsCalendarInput;
  const { projectName, ticker } = resolveCommonParams(input, context);
  const platforms = params.platforms || ["twitter", "telegram", "discord"];

  const templates = getDayTemplates(projectName, ticker);

  // Generate 30 days of posts
  const days: CommsCalendarOutput["days"] = [];
  for (let i = 0; i < 30; i++) {
    const weekIndex = Math.min(Math.floor(i / 7), 3);
    const weekTheme = WEEKLY_THEMES[weekIndex].theme;
    const templateIndex = Math.min(i, templates.length - 1);
    const template = templates[templateIndex];

    days.push(generateDayPosts(i, template, projectName, ticker, weekTheme));
  }

  // Build crisis templates
  const crisisTemplates = buildCrisisTemplates(projectName, ticker);

  // Count platforms used
  const platformsUsed = new Set(days.flatMap((d) => d.posts.map((p) => p.platform)));

  const sources = [makeSource("Comms Calendar Engine", "local/comms-calendar-generation")];

  const data: CommsCalendarOutput = {
    days,
    weeklyThemes: WEEKLY_THEMES,
    crisisTemplates,
    cadenceRules: CADENCE_RULES,
  };

  const summary =
    `Generated **30-day comms calendar** for ${projectName} ($${ticker}) ` +
    `with ${days.length} daily posts across ${platformsUsed.size} platforms ` +
    `(${Array.from(platformsUsed).join(", ")}), ` +
    `4 weekly themes, and ${crisisTemplates.length} crisis response templates. ` +
    `Rule: NEVER go more than 48 hours without posting -- silence equals assumed abandonment.`;

  return buildSkillResponse("comms-calendar", {
    data,
    summary,
    nextSteps: [
      "Run readiness-gate to check overall launch readiness",
      "Complete content-draft if you haven't -- it feeds into Day 1 posts",
      "Set up community channels (community-setup) before Day 1",
      "Prepare buyback wallet and process before Day 5",
    ],
    sources,
  });
}
