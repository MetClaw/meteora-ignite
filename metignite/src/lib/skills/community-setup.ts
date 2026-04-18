import type {
  SkillResponse,
  FounderContext,
  CommunitySetupOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse, resolveCommonParams } from "./types";

function getTelegramChannels(
  assetType: string,
  communitySize: number
): CommunitySetupOutput["platforms"][0]["channels"] {
  const base: CommunitySetupOutput["platforms"][0]["channels"] = [
    {
      name: "Announcements",
      purpose: "One-way channel for official updates, launches, and milestones",
      permissions: "Admin-only posting",
      priority: "required",
    },
    {
      name: "General Chat",
      purpose: "Main community discussion hub",
      permissions: "Open with anti-spam",
      priority: "required",
    },
    {
      name: "Price Discussion",
      purpose: "Dedicated space for price talk to keep general chat clean",
      permissions: "Open",
      priority: "recommended",
    },
  ];

  if (assetType === "utility" || assetType === "governance") {
    base.push({
      name: "Dev Updates",
      purpose: "Technical updates, roadmap progress, and development discussion",
      permissions: "Open (read), team posts",
      priority: "recommended",
    });
  }

  if (communitySize > 500) {
    base.push({
      name: "Whale Chat",
      purpose: "Verified holders above threshold for strategic discussion",
      permissions: "Token-gated",
      priority: "optional",
    });
  }

  return base;
}

function getDiscordChannels(
  assetType: string,
  communitySize: number
): CommunitySetupOutput["platforms"][0]["channels"] {
  const base: CommunitySetupOutput["platforms"][0]["channels"] = [
    {
      name: "#announcements",
      purpose: "Official announcements and updates",
      permissions: "Admin-only, @everyone pings for critical updates",
      priority: "required",
    },
    {
      name: "#general",
      purpose: "Main community conversation",
      permissions: "Open with slowmode (10s)",
      priority: "required",
    },
    {
      name: "#price-talk",
      purpose: "Price discussion, chart sharing, trading chat",
      permissions: "Open with slowmode (5s)",
      priority: "required",
    },
    {
      name: "#support",
      purpose: "Help desk for community questions",
      permissions: "Open, with ticket bot",
      priority: "required",
    },
    {
      name: "#links-and-resources",
      purpose: "Pinned links to docs, socials, pools, and tools",
      permissions: "Admin-only posting",
      priority: "required",
    },
    {
      name: "#memes",
      purpose: "Community creativity and engagement",
      permissions: "Open, image-only",
      priority: "recommended",
    },
  ];

  if (assetType === "utility" || assetType === "governance") {
    base.push(
      {
        name: "#dev-updates",
        purpose: "Technical development progress",
        permissions: "Admin posts, open discussion",
        priority: "recommended",
      },
      {
        name: "#governance",
        purpose: "Proposals, voting, and DAO discussion",
        permissions: "Token-gated or role-gated",
        priority: "recommended",
      }
    );
  }

  if (communitySize > 1000) {
    base.push({
      name: "#collab-zone",
      purpose: "Partnership and collaboration proposals from community",
      permissions: "Open with approval flow",
      priority: "optional",
    });
  }

  return base;
}

function getTelegramBots(): CommunitySetupOutput["platforms"][0]["bots"] {
  return [
    {
      name: "Combot",
      purpose: "Anti-spam, welcome messages, user analytics",
      free: true,
      setupUrl: "https://combot.org",
    },
    {
      name: "Rose Bot",
      purpose: "Moderation, filters, welcome messages, captcha",
      free: true,
      setupUrl: "https://missrose.org",
    },
    {
      name: "Shillguard",
      purpose: "Anti-raid, link filtering, new user restrictions",
      free: true,
      setupUrl: "https://t.me/ShillGuardBot",
    },
    {
      name: "Cielo Finance Bot",
      purpose: "Wallet tracking, transaction alerts for transparency",
      free: true,
      setupUrl: "https://t.me/CieloFinanceBot",
    },
  ];
}

function getDiscordBots(): CommunitySetupOutput["platforms"][0]["bots"] {
  return [
    {
      name: "MEE6",
      purpose: "Moderation, auto-roles, welcome messages, leveling",
      free: true,
      setupUrl: "https://mee6.xyz",
    },
    {
      name: "Carl-bot",
      purpose: "Advanced moderation, reaction roles, logging, auto-mod",
      free: true,
      setupUrl: "https://carl.gg",
    },
    {
      name: "Collab.Land",
      purpose: "Token-gated roles, wallet verification",
      free: true,
      setupUrl: "https://collab.land",
    },
    {
      name: "Dyno",
      purpose: "Moderation, custom commands, auto-responses",
      free: true,
      setupUrl: "https://dyno.gg",
    },
  ];
}

function getModerationRules(platform: string): string[] {
  const base = [
    "No financial advice or price predictions by team members",
    "Zero tolerance for scam links -- instant ban",
    "No impersonation of team members",
    "English only in main channels (create language-specific channels if needed)",
    "No unsolicited DMs from team (pin this rule prominently)",
    "Report suspicious messages to mods, do not engage",
  ];

  if (platform === "telegram") {
    base.push(
      "Enable anti-spam bot before opening group",
      "Set new member cooldown (5 min before posting)",
      "Restrict media sharing for new members (first 24h)"
    );
  } else {
    base.push(
      "Enable Discord AutoMod for common spam patterns",
      "Set verification level to Medium (must have verified email)",
      "Slowmode on high-traffic channels (5-10s)"
    );
  }

  return base;
}

function getPrelaunchChecklist(
  platforms: string[],
  hasLaunchDate: boolean
): CommunitySetupOutput["prelaunchChecklist"] {
  const checklist: CommunitySetupOutput["prelaunchChecklist"] = [
    {
      task: "Set up all channels with descriptions and permissions",
      category: "Infrastructure",
      completed: false,
      priority: "critical",
    },
    {
      task: "Install and configure moderation bots",
      category: "Infrastructure",
      completed: false,
      priority: "critical",
    },
    {
      task: "Write and pin community rules",
      category: "Content",
      completed: false,
      priority: "critical",
    },
    {
      task: "Create welcome message with key links",
      category: "Content",
      completed: false,
      priority: "critical",
    },
    {
      task: "Prepare FAQ document and pin it",
      category: "Content",
      completed: false,
      priority: "high",
    },
    {
      task: "Set up mod team (minimum 2 mods across timezones)",
      category: "Team",
      completed: false,
      priority: "critical",
    },
    {
      task: "Test all bot commands and permissions",
      category: "QA",
      completed: false,
      priority: "high",
    },
    {
      task: "Create branded profile picture and banner",
      category: "Branding",
      completed: false,
      priority: "high",
    },
    {
      task: "Seed initial conversations (5-10 organic-looking messages)",
      category: "Launch Prep",
      completed: false,
      priority: "medium",
    },
    {
      task: "Prepare announcement copy for launch day",
      category: "Content",
      completed: false,
      priority: "high",
    },
  ];

  if (hasLaunchDate) {
    checklist.push({
      task: "Schedule countdown messages and launch alerts",
      category: "Launch Prep",
      completed: false,
      priority: "medium",
    });
  }

  if (platforms.includes("discord") || platforms.includes("both")) {
    checklist.push(
      {
        task: "Configure role hierarchy (Admin > Mod > Verified > Member)",
        category: "Infrastructure",
        completed: false,
        priority: "high",
      },
      {
        task: "Set up verification/onboarding flow",
        category: "Infrastructure",
        completed: false,
        priority: "high",
      }
    );
  }

  return checklist;
}

function getTemplates(
  projectName: string,
  ticker: string
): CommunitySetupOutput["templates"] {
  return [
    {
      name: "Welcome Message",
      content: `Welcome to the ${projectName} community! Here's how to get started:\n\n1. Read the pinned rules\n2. Introduce yourself in #general\n3. Check #announcements for the latest updates\n4. Never share your private keys with anyone\n5. Team will NEVER DM you first\n\nUseful links:\n- Website: [link]\n- Docs: [link]\n- Pool: [Meteora pool link]`,
      useCase: "Auto-send to new members via bot",
    },
    {
      name: "Rules Pin",
      content: `${projectName} Community Rules:\n\n1. Be respectful -- no harassment, racism, or hate speech\n2. No financial advice or price predictions\n3. No scam links or phishing -- instant ban\n4. No impersonation of team members\n5. Keep price discussion in the designated channel\n6. Team will NEVER DM you first asking for funds\n7. Report suspicious activity to mods\n\nViolations result in warning > mute > ban.`,
      useCase: "Pin in every channel",
    },
    {
      name: "Launch Day Announcement",
      content: `$${ticker} is LIVE on Meteora!\n\nPool is open. Here's what you need to know:\n- Pool link: [link]\n- Contract: [address]\n- Initial liquidity: [amount]\n\nHow to buy:\n1. Go to [pool link]\n2. Connect your Solana wallet\n3. Swap SOL for $${ticker}\n\nLP locked. Contract verified. Let's build.`,
      useCase: "Post in announcements channel on launch day",
    },
    {
      name: "Scam Alert",
      content: `SCAM ALERT: We are NOT running any airdrops, giveaways, or token sales via DM. If someone contacts you claiming to be from the ${projectName} team, BLOCK and REPORT them immediately. Our team will NEVER DM you first.`,
      useCase: "Pin prominently, repost weekly",
    },
  ];
}

function getTimeline(
  hasLaunchDate: boolean
): CommunitySetupOutput["timeline"] {
  return [
    {
      phase: "Infrastructure Setup",
      tasks: [
        "Create server/group",
        "Set up channels",
        "Install bots",
        "Configure permissions",
      ],
      daysBeforeLaunch: hasLaunchDate ? 14 : 0,
    },
    {
      phase: "Content Prep",
      tasks: [
        "Write rules and FAQ",
        "Create welcome messages",
        "Prepare launch announcements",
        "Design branded assets",
      ],
      daysBeforeLaunch: hasLaunchDate ? 10 : 0,
    },
    {
      phase: "Mod Training",
      tasks: [
        "Brief mod team on rules and escalation",
        "Test all bot commands",
        "Dry-run moderation scenarios",
        "Set up mod-only channel for coordination",
      ],
      daysBeforeLaunch: hasLaunchDate ? 7 : 0,
    },
    {
      phase: "Soft Open",
      tasks: [
        "Invite core community members",
        "Seed organic conversations",
        "Collect feedback on setup",
        "Fix issues before public launch",
      ],
      daysBeforeLaunch: hasLaunchDate ? 3 : 0,
    },
    {
      phase: "Launch Day",
      tasks: [
        "Post launch announcement",
        "Monitor for spam/scams actively",
        "Engage with new members",
        "Pin key links and contract address",
      ],
      daysBeforeLaunch: 0,
    },
  ];
}

export async function executeCommunitySetup(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const { projectName, assetType, communitySize, ticker } = resolveCommonParams(input, context);
  const platforms = (input.platforms as string[]) || ["both"];
  const hasLaunchDate = Boolean(input.launchDate);

  const wantsTelegram = platforms.includes("telegram") || platforms.includes("both");
  const wantsDiscord = platforms.includes("discord") || platforms.includes("both");

  const platformData: CommunitySetupOutput["platforms"] = [];

  if (wantsTelegram) {
    platformData.push({
      platform: "Telegram",
      channels: getTelegramChannels(assetType, communitySize),
      bots: getTelegramBots(),
      moderationRules: getModerationRules("telegram"),
    });
  }

  if (wantsDiscord) {
    platformData.push({
      platform: "Discord",
      channels: getDiscordChannels(assetType, communitySize),
      bots: getDiscordBots(),
      moderationRules: getModerationRules("discord"),
    });
  }

  const prelaunchChecklist = getPrelaunchChecklist(platforms, hasLaunchDate);
  const templates = getTemplates(projectName, ticker);
  const timeline = getTimeline(hasLaunchDate);

  const totalChannels = platformData.reduce((sum, p) => sum + p.channels.length, 0);
  const totalBots = platformData.reduce((sum, p) => sum + p.bots.length, 0);
  const criticalTasks = prelaunchChecklist.filter((t) => t.priority === "critical").length;

  const sources = [makeSource("Community best practices", "internal://community-patterns")];

  return buildSkillResponse("community-setup", {
    data: {
      platforms: platformData,
      prelaunchChecklist,
      templates,
      timeline,
    } satisfies CommunitySetupOutput,
    summary: `Community setup plan for ${projectName}: ${platformData.map((p) => p.platform).join(" + ")} with ${totalChannels} channels, ${totalBots} recommended bots, and ${criticalTasks} critical pre-launch tasks.`,
    nextSteps: [
      "Create the server/group and set up channels",
      "Install and configure recommended bots",
      "Customize the message templates with your project links",
      "Recruit and brief your mod team",
      "Run the content-draft skill to generate launch announcement copy",
    ],
    sources,
  });
}
