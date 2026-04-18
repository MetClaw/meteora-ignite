import type {
  LaunchSequenceInput,
  LaunchSequenceOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

function buildPreLaunch(
  input: LaunchSequenceInput
): LaunchSequenceOutput["preLaunch"] {
  const { projectName, tokenTicker } = input;

  return [
    {
      time: "T-60min",
      action: "Final checklist review",
      channel: "internal",
      template:
        "Go through the full launch checklist one last time. " +
        "Confirm LP is locked, authorities are revoked, multisig is active, " +
        "DexScreener profile is live, and all team members are online.",
    },
    {
      time: "T-30min",
      action: "Teaser post on Twitter",
      channel: "twitter",
      template:
        `$${tokenTicker} launches in 30 minutes.\n\n` +
        `Everything is locked. Everything is ready.\n\n` +
        `CA drops here first. Stay tuned.`,
    },
    {
      time: "T-15min",
      action: "Alert community channels",
      channel: "telegram/discord",
      template:
        `@everyone -- ${projectName} launches in 15 minutes.\n\n` +
        `CA will be posted the moment the pool goes live.\n` +
        `Do NOT buy anything posted before the official announcement.\n` +
        `Official CA will come from this channel only.`,
    },
    {
      time: "T-5min",
      action: "Prepare CA for copy-paste",
      channel: "internal",
      template:
        "Have the contract address copied and ready in a pinned note. " +
        "Open Twitter compose, Telegram admin panel, and Discord announcement channel. " +
        "Pre-type the messages with a placeholder for the CA.",
    },
    {
      time: "T-1min",
      action: "Deep breath",
      channel: "internal",
      template:
        "You have done the work. The checklist is green. " +
        "Take one breath. Then execute.",
    },
  ];
}

function buildLaunchMoment(
  input: LaunchSequenceInput
): LaunchSequenceOutput["launchMoment"] {
  const { projectName, tokenTicker } = input;

  return [
    {
      time: "T+0",
      action: "Pool goes live -- post CA immediately on Twitter",
      channel: "twitter",
      template:
        `$${tokenTicker} is LIVE.\n\n` +
        `CA: [paste contract address]\n\n` +
        `Pool: ${input.poolType} on Meteora\n` +
        `LP locked. Authorities revoked. Multisig active.\n\n` +
        `Let's go.`,
    },
    {
      time: "T+1min",
      action: "Pin CA in Telegram and Discord",
      channel: "telegram/discord",
      template:
        `${projectName} ($${tokenTicker}) is LIVE\n\n` +
        `CA: [paste contract address]\n\n` +
        `This is the ONLY official contract address.\n` +
        `Do not trust any other address posted anywhere.\n\n` +
        `Buy on Jupiter: https://jup.ag/swap/SOL-[CA]`,
    },
    {
      time: "T+2min",
      action: "Update Twitter bio with CA",
      channel: "twitter",
      template:
        "Add the CA to your Twitter bio and pin the launch tweet. " +
        "Format: $TICKER | CA: [first 6]...[last 4]",
    },
    {
      time: "T+3min",
      action: "Reply to own announcement with Solscan link",
      channel: "twitter",
      template:
        `Solscan: https://solscan.io/token/[CA]\n` +
        `DexScreener: https://dexscreener.com/solana/[pool address]\n\n` +
        `All on-chain. All verifiable.`,
    },
    {
      time: "T+5min",
      action: "Post thread (if prepared)",
      channel: "twitter",
      template:
        `Why $${tokenTicker}?\n\n` +
        `A thread on what we're building and why it matters.\n\n` +
        `1/ [Your core narrative]\n` +
        `2/ [The problem you solve]\n` +
        `3/ [How your tokenomics work]\n` +
        `4/ [What's next -- roadmap highlights]\n` +
        `5/ [Where to buy and join the community]`,
    },
  ];
}

function buildPostLaunch(
  input: LaunchSequenceInput
): LaunchSequenceOutput["postLaunch"] {
  const { projectName, tokenTicker } = input;

  return [
    {
      time: "T+15min",
      action: "First engagement check",
      channel: "internal",
      template:
        "Check volume, holder count, and community chat activity. " +
        "If volume is thin, activate emergency distribution push -- " +
        "DM your top 10 supporters to RT the launch tweet.",
    },
    {
      time: "T+30min",
      action: "Retweet from project account",
      channel: "twitter",
      template:
        "RT the launch tweet from the project account (if separate from founder). " +
        "Quote tweet with a short comment: \"Live and verified on-chain.\"",
    },
    {
      time: "T+1hr",
      action: "First update post",
      channel: "twitter",
      template:
        `$${tokenTicker} -- first hour update:\n\n` +
        `Holders: [count]\n` +
        `Volume: $[amount]\n` +
        `Liquidity: $[amount]\n\n` +
        `We are just getting started. Thank you to everyone who came in early.`,
    },
    {
      time: "T+4hr",
      action: "Buyback #1 with on-chain receipt (if planned)",
      channel: "twitter",
      template:
        `First buyback executed.\n\n` +
        `Amount: [X] SOL\n` +
        `Tx: https://solscan.io/tx/[hash]\n\n` +
        `Receipts, not promises. This is how $${tokenTicker} operates.`,
    },
    {
      time: "T+8hr",
      action: "Second update -- respond to ALL questions",
      channel: "twitter/telegram/discord",
      template:
        `8-hour update for $${tokenTicker}:\n\n` +
        `[Key stats]\n\n` +
        `I've been in the TG/Discord answering every question. ` +
        `If you have concerns, ask. Transparency is the default here.`,
    },
    {
      time: "T+24hr",
      action: "Day 1 report",
      channel: "twitter",
      template:
        `$${tokenTicker} -- Day 1 Report\n\n` +
        `Volume: $[amount]\n` +
        `Holders: [count]\n` +
        `Liquidity depth: $[amount]\n` +
        `Largest single buy: $[amount]\n` +
        `Community growth: [X] new members\n\n` +
        `Day 1 done. Here's what's coming in Week 1: [preview]`,
    },
  ];
}

function buildChecklist(): LaunchSequenceOutput["checklist"] {
  return [
    { item: "LP locked (minimum 6 months)", critical: true, done: false },
    { item: "Mint and freeze authorities revoked", critical: true, done: false },
    { item: "Multisig configured and tested", critical: true, done: false },
    { item: "DexScreener profile live with logo and links", critical: true, done: false },
    { item: "Community channels notified with launch time", critical: true, done: false },
    { item: "Content queued (announcement, thread, TG pin)", critical: true, done: false },
    { item: "Anti-sniper measures configured", critical: false, done: false },
    { item: "Sufficient initial liquidity deposited", critical: true, done: false },
    { item: "Contract address ready for instant copy-paste", critical: true, done: false },
    { item: "Team available for minimum 12 hours post-launch", critical: true, done: false },
    { item: "Crisis response templates ready", critical: false, done: false },
    { item: "Analytics monitoring set up (DexScreener, Birdeye, Solscan)", critical: false, done: false },
  ];
}

function buildEmergencyPlaybook(): LaunchSequenceOutput["emergencyPlaybook"] {
  return [
    {
      scenario: "Price dumps >30% in first hour",
      response:
        "Do NOT panic-post. Post a calm update acknowledging volatility: " +
        "\"Early price action is noise. We're focused on building. Here's what's shipping this week: [concrete item].\" " +
        "If you have a buyback planned, this is the time. Post the on-chain receipt. " +
        "Stay in community chat and answer questions directly. Do not go silent.",
      timing: "Respond within 15 minutes of the dump",
    },
    {
      scenario: "Bot attack -- snipers or sandwich bots dominating volume",
      response:
        "Alert your community immediately: \"We're seeing bot activity. " +
        "If you're buying, use Jupiter with MEV protection enabled and set reasonable slippage.\" " +
        "If using DLMM, check if your bin configuration is being exploited. " +
        "Consider adjusting fees temporarily if pool allows it. " +
        "Document the attack for your post-launch report.",
      timing: "Respond within 10 minutes of detection",
    },
    {
      scenario: "Zero volume after 30 minutes",
      response:
        "Activate distribution push immediately. DM your top 20 supporters and ask for RTs. " +
        "Post in relevant Telegram alpha groups (if appropriate). " +
        "Consider a small self-buy to seed the chart with green candles -- " +
        "but ONLY if you will disclose it. " +
        "Check that your CA is correct in all posted materials. " +
        "Verify the pool is actually live and tradeable on Jupiter.",
      timing: "Start escalation at T+30min, full push by T+45min",
    },
    {
      scenario: "Negative tweets trending about your project",
      response:
        "Do NOT engage with trolls. Post one clear, factual response addressing the specific concern. " +
        "Link to on-chain proof (locked LP, revoked authorities, multisig tx). " +
        "Ask your community to amplify the factual response, not to attack the critics. " +
        "If the criticism is valid, acknowledge it and state your plan to fix it. " +
        "\"They're right about X. Here's what we're doing about it: [action].\"",
      timing: "One response within 30 minutes, then disengage from trolls",
    },
  ];
}

export async function executeLaunchSequence(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as LaunchSequenceInput;
  const preLaunch = buildPreLaunch(params);
  const launchMoment = buildLaunchMoment(params);
  const postLaunch = buildPostLaunch(params);
  const checklist = buildChecklist();
  const emergencyPlaybook = buildEmergencyPlaybook();

  const output: LaunchSequenceOutput = {
    preLaunch,
    launchMoment,
    postLaunch,
    checklist,
    emergencyPlaybook,
  };

  const criticalItems = checklist.filter((c) => c.critical).length;
  const totalSteps = preLaunch.length + launchMoment.length + postLaunch.length;

  const sources = [makeSource("MetIgnite Launch Sequence", "internal://skills/launch-sequence")];

  const summary =
    `Launch sequence generated for ${params.projectName} ($${params.tokenTicker}). ` +
    `${totalSteps} timed actions across pre-launch, launch, and post-launch phases. ` +
    `${criticalItems} critical checklist items. ` +
    `${emergencyPlaybook.length} emergency scenarios covered.`;

  return buildSkillResponse("launch-sequence", {
    data: output,
    summary,
    nextSteps: [
      "Review and complete all 12 checklist items before T-60.",
      "Customize the template text with your project specifics.",
      "Set timers or calendar reminders for each timed action.",
      "Brief your team on the emergency playbook scenarios.",
      "When ready, begin the countdown at T-60 minutes.",
    ],
    sources,
  });
}
