import type {
  SkillResponse,
  FounderContext,
  ContentDraftInput,
  ContentDraftOutput,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse, resolveCommonParams } from "./types";

function generateAnnouncement(input: ContentDraftInput): ContentDraftOutput["drafts"][0] {
  const { projectName, assetType, tagline, keyFeatures, launchDate, poolType, tokenTicker } = input;
  const ticker = tokenTicker || projectName.toUpperCase().slice(0, 5);
  const pool = poolType || "DLMM";
  const dateStr = launchDate || "soon";
  const tag = tagline || `The next evolution in ${assetType} on Solana`;

  const lines = [
    `${projectName} is launching on @MeteoraAG ${pool}.`,
    "",
    tag,
    "",
    ...keyFeatures.slice(0, 4).map((f) => `- ${f}`),
    "",
    `$${ticker} goes live ${dateStr}.`,
    "",
    `Powered by Meteora's ${pool} -- concentrated liquidity, dynamic fees, maximum capital efficiency.`,
    "",
    `More details dropping soon.`,
  ];

  const content = lines.join("\n");

  return {
    format: "announcement",
    title: `${projectName} Launch Announcement`,
    content,
    charCount: content.length,
    platform: "Twitter/X",
    tips: [
      "Pin this tweet after posting.",
      "Quote-tweet this from your project account within 30 minutes.",
      `Tag relevant ecosystem accounts (@solaboratory, @JupiterExchange) in a reply, not the main tweet.`,
      "Post between 14:00-16:00 UTC for peak crypto Twitter engagement.",
    ],
  };
}

function generateThread(input: ContentDraftInput): ContentDraftOutput["drafts"][0] {
  const { projectName, assetType, keyFeatures, poolType, tokenTicker, tone } = input;
  const ticker = tokenTicker || projectName.toUpperCase().slice(0, 5);
  const pool = poolType || "DLMM";
  const isDegenTone = tone === "degen";

  const tweets: string[] = [];

  // Tweet 1: Hook
  if (isDegenTone) {
    tweets.push(`$${ticker} is about to change the game.\n\nHere's why this ${assetType} launch on @MeteoraAG is different. Thread.`);
  } else {
    tweets.push(`Introducing $${ticker} -- a ${assetType} token launching on @MeteoraAG ${pool}.\n\nWhat it does, why it matters, and what's next. Thread.`);
  }

  // Tweet 2: Problem/opportunity
  tweets.push(`The problem:\n\nMost ${assetType} tokens launch without proper liquidity infrastructure. Shallow pools, wide spreads, poor price discovery.\n\n$${ticker} is doing it differently.`);

  // Tweet 3-4: Features
  const featureChunks = [];
  for (let i = 0; i < keyFeatures.length; i += 2) {
    featureChunks.push(keyFeatures.slice(i, i + 2));
  }
  featureChunks.slice(0, 2).forEach((chunk, idx) => {
    tweets.push(chunk.map((f) => `- ${f}`).join("\n") + (idx === 0 ? `\n\nThis is what separates $${ticker} from the noise.` : ""));
  });

  // Tweet 5: Meteora integration
  tweets.push(`Why @MeteoraAG ${pool}?\n\n- Concentrated liquidity for deeper markets\n- Dynamic fees that adjust to volatility\n- Capital efficiency that benefits both LPs and traders\n\nThe infrastructure matters as much as the token.`);

  // Tweet 6: CTA
  if (isDegenTone) {
    tweets.push(`$${ticker} is coming.\n\nFollow @${projectName.replace(/\s/g, "")} and turn on notifications.\n\nYou've been warned.`);
  } else {
    tweets.push(`Follow @${projectName.replace(/\s/g, "")} for launch updates.\n\nMore details on tokenomics, timeline, and community plans coming this week.`);
  }

  const content = tweets.map((t, i) => `${i + 1}/${tweets.length}\n${t}`).join("\n\n---\n\n");

  return {
    format: "thread",
    title: `${projectName} Launch Thread (${tweets.length} tweets)`,
    content,
    charCount: tweets.reduce((sum, t) => sum + t.length, 0),
    platform: "Twitter/X",
    tips: [
      "Post the thread between 14:00-17:00 UTC.",
      "Space tweets 60-90 seconds apart using a thread tool (Typefully, Chirr).",
      "Reply to tweet 1 with a visual (logo, chart, or infographic) within 5 minutes.",
      "Retweet tweet 1 from ecosystem partner accounts.",
      `Each tweet should stand alone -- someone might see tweet 4 first.`,
    ],
  };
}

function generatePitch(input: ContentDraftInput): ContentDraftOutput["drafts"][0] {
  const { projectName, assetType, keyFeatures, poolType, tokenTicker, targetAudience } = input;
  const ticker = tokenTicker || projectName.toUpperCase().slice(0, 5);
  const pool = poolType || "DLMM";
  const audience = targetAudience || "DeFi users and liquidity providers";

  const content = [
    `# ${projectName} ($${ticker})`,
    "",
    `**Category:** ${assetType} token on Solana`,
    `**Liquidity:** @MeteoraAG ${pool}`,
    `**Target audience:** ${audience}`,
    "",
    "## What it does",
    "",
    ...keyFeatures.slice(0, 5).map((f) => `- ${f}`),
    "",
    "## Why Meteora",
    "",
    `${projectName} chose Meteora's ${pool} for launch liquidity because:`,
    "- Concentrated liquidity maximizes capital efficiency",
    "- Dynamic fees adapt to market conditions",
    "- Proven infrastructure ($182B+ total volume on Meteora)",
    "",
    "## Ask",
    "",
    "We're looking for:",
    "- Community partnerships and co-marketing",
    "- Listing support on aggregators",
    "- LP incentive alignment discussions",
    "",
    `Contact: [project email/telegram]`,
  ].join("\n");

  return {
    format: "pitch",
    title: `${projectName} Partnership Pitch`,
    content,
    charCount: content.length,
    platform: "Email/DM",
    tips: [
      "Personalize the opening line for each recipient.",
      "Keep the email under 200 words -- link to a full doc for details.",
      "Include your Twitter handle and Telegram for quick follow-up.",
      "Send Tuesday-Thursday, 10:00-14:00 UTC.",
    ],
  };
}

function generateTelegramPin(input: ContentDraftInput): ContentDraftOutput["drafts"][0] {
  const { projectName, keyFeatures, launchDate, tokenTicker } = input;
  const ticker = tokenTicker || projectName.toUpperCase().slice(0, 5);
  const dateStr = launchDate || "TBA";

  const content = [
    `Welcome to ${projectName}!`,
    "",
    `$${ticker} Launch: ${dateStr}`,
    "",
    "Key highlights:",
    ...keyFeatures.slice(0, 4).map((f) => `-- ${f}`),
    "",
    "Links:",
    "-- Website: [link]",
    "-- Twitter: [link]",
    "-- Docs: [link]",
    "",
    "Rules:",
    "1. No financial advice or price predictions",
    "2. Be respectful",
    "3. No spam or self-promotion",
    "",
    "Questions? Ask a mod.",
  ].join("\n");

  return {
    format: "telegram-pin",
    title: `${projectName} Telegram Pinned Message`,
    content,
    charCount: content.length,
    platform: "Telegram",
    tips: [
      "Pin this immediately after creating the group.",
      "Update the launch date as soon as it's confirmed.",
      "Replace [link] placeholders before pinning.",
      "Keep this under 1000 characters for mobile readability.",
    ],
  };
}

function generateHashtags(input: ContentDraftInput): string[] {
  const base = ["Solana", "Meteora", "DeFi"];
  const { assetType, tokenTicker, projectName } = input;
  const ticker = tokenTicker || projectName.toUpperCase().slice(0, 5);

  const tags = [...base, ticker, projectName.replace(/\s/g, "")];

  if (assetType === "meme") tags.push("Memecoin", "SolanaMemes");
  if (assetType === "utility") tags.push("Web3", "SolanaEcosystem");
  if (assetType === "governance") tags.push("DAO", "Governance");
  if (assetType === "stablecoin") tags.push("Stablecoin");
  if (assetType === "lst") tags.push("LiquidStaking", "LST");

  return [...new Set(tags)].map((t) => `#${t}`);
}

function buildPostingStrategy(formats: string[]): ContentDraftOutput["postingStrategy"] {
  const sequence: string[] = [];

  // Optimal posting sequence
  if (formats.includes("telegram-pin")) sequence.push("Pin Telegram message (foundation)");
  if (formats.includes("announcement")) sequence.push("Post announcement tweet (awareness)");
  if (formats.includes("thread")) sequence.push("Post thread 2-4 hours after announcement (depth)");
  if (formats.includes("pitch")) sequence.push("Send pitches 24h after public posts (leverage social proof)");

  return {
    timing: "Post between 14:00-17:00 UTC (peak crypto Twitter). Avoid weekends for launch announcements.",
    sequence: sequence.length > 0 ? sequence : ["Post announcement first, then follow up with detailed content."],
    cadence: "Day 0: Announcement. Day 0+4h: Thread. Day 1: Pitches. Day 2-3: Follow-up content and community engagement.",
  };
}

export async function executeContentDraft(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as ContentDraftInput;
  const { projectName, assetType } = resolveCommonParams(input, context);
  const formats = params.formats || ["announcement", "thread"];

  const enrichedInput: ContentDraftInput = {
    ...params,
    projectName,
    assetType,
    keyFeatures: params.keyFeatures || [],
    formats,
  };

  const drafts: ContentDraftOutput["drafts"] = [];

  if (formats.includes("announcement")) {
    drafts.push(generateAnnouncement(enrichedInput));
  }
  if (formats.includes("thread")) {
    drafts.push(generateThread(enrichedInput));
  }
  if (formats.includes("pitch")) {
    drafts.push(generatePitch(enrichedInput));
  }
  if (formats.includes("telegram-pin")) {
    drafts.push(generateTelegramPin(enrichedInput));
  }

  const hashtags = generateHashtags(enrichedInput);
  const postingStrategy = buildPostingStrategy(formats);

  const sources = [makeSource("Content Draft Engine", "local/content-generation")];

  const data: ContentDraftOutput = {
    drafts,
    hashtags,
    postingStrategy,
  };

  const summary = `Generated **${drafts.length} content draft${drafts.length > 1 ? "s" : ""}** for ${projectName}: ${drafts.map((d) => d.format).join(", ")}. Total ${drafts.reduce((s, d) => s + d.charCount, 0)} characters across ${drafts.map((d) => d.platform).filter((v, i, a) => a.indexOf(v) === i).join(", ")}.`;

  return buildSkillResponse("content-draft", {
    data,
    summary,
    nextSteps: ["community-setup", "outreach", "listing-ops"],
    sources,
  });
}
