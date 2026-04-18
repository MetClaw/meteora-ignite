import type {
  BuybackReporterInput,
  BuybackReporterOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTokens(amount: number): string {
  return amount.toLocaleString("en-US");
}

function buildReport(input: BuybackReporterInput): BuybackReporterOutput["report"] {
  const {
    projectName,
    tokenTicker,
    buybackAmount,
    tokensBurned,
    treasuryBalance,
    solscanTxHash,
  } = input;

  const ticker = `$${tokenTicker}`;
  const date = new Date().toISOString().split("T")[0];
  const solscanLink = solscanTxHash
    ? `https://solscan.io/tx/${solscanTxHash}`
    : "https://solscan.io/tx/[pending]";

  const stats: { label: string; value: string }[] = [
    { label: "Buyback Amount (USD)", value: `$${formatUsd(buybackAmount)}` },
    { label: "Tokens Purchased", value: `${formatTokens(buybackAmount)} ${ticker} (est.)` },
  ];

  if (tokensBurned !== undefined) {
    stats.push({ label: "Tokens Burned", value: `${formatTokens(tokensBurned)} ${ticker}` });

    // Estimate supply reduction -- mock since we don't have total supply
    const estimatedSupplyReduction = (tokensBurned / 1_000_000_000) * 100;
    stats.push({
      label: "Supply Reduction",
      value: `~${estimatedSupplyReduction.toFixed(4)}%`,
    });
  }

  if (treasuryBalance !== undefined) {
    stats.push({
      label: "Treasury Remaining",
      value: `$${formatUsd(treasuryBalance)}`,
    });
  }

  const bodyLines = [
    `${ticker} Buyback Report -- ${date}`,
    ``,
    `Project: ${projectName}`,
    ``,
  ];

  for (const stat of stats) {
    bodyLines.push(`${stat.label}: ${stat.value}`);
  }

  bodyLines.push(``);
  bodyLines.push(`Proof: ${solscanLink}`);

  return {
    title: `${ticker} Buyback Report -- ${date}`,
    body: bodyLines.join("\n"),
    stats,
    solscanLink,
  };
}

function buildTweetDraft(input: BuybackReporterInput): string {
  const {
    tokenTicker,
    buybackAmount,
    tokensBurned,
    treasuryBalance,
    solscanTxHash,
  } = input;

  const ticker = `$${tokenTicker}`;
  const solscanLink = solscanTxHash
    ? `https://solscan.io/tx/${solscanTxHash}`
    : "[solscan link]";

  const lines = [
    `${ticker} Buyback Report`,
    ``,
    `Bought: ${formatTokens(buybackAmount)} ${ticker} (~$${formatUsd(buybackAmount)})`,
  ];

  if (tokensBurned !== undefined) {
    lines.push(`Burned: ${formatTokens(tokensBurned)} ${ticker}`);
    const reduction = (tokensBurned / 1_000_000_000) * 100;
    lines.push(`Supply reduction: ${reduction.toFixed(4)}%`);
  }

  if (treasuryBalance !== undefined) {
    lines.push(`Treasury remaining: $${formatUsd(treasuryBalance)}`);
  }

  lines.push(``);
  lines.push(`Proof: ${solscanLink}`);
  lines.push(``);
  lines.push(`Building continues. #${tokenTicker}`);

  return lines.join("\n");
}

function buildTelegramDraft(input: BuybackReporterInput): string {
  const {
    projectName,
    tokenTicker,
    buybackAmount,
    tokensBurned,
    treasuryBalance,
    solscanTxHash,
  } = input;

  const ticker = `$${tokenTicker}`;
  const solscanLink = solscanTxHash
    ? `https://solscan.io/tx/${solscanTxHash}`
    : "[tx hash pending]";

  const lines = [
    `${ticker} Buyback Report`,
    ``,
    `${projectName} just executed a buyback.`,
    ``,
    `Details:`,
    `- Bought: ${formatTokens(buybackAmount)} ${ticker} (~$${formatUsd(buybackAmount)})`,
  ];

  if (tokensBurned !== undefined) {
    lines.push(`- Burned: ${formatTokens(tokensBurned)} ${ticker}`);
  }

  if (treasuryBalance !== undefined) {
    lines.push(`- Treasury remaining: $${formatUsd(treasuryBalance)}`);
  }

  lines.push(``);
  lines.push(`Proof: ${solscanLink}`);
  lines.push(``);
  lines.push(`Why this matters:`);
  lines.push(`Projects with regular buybacks show -0.48% YTD price performance.`);
  lines.push(`Projects without: -47.15% YTD.`);
  lines.push(`That's a 47-point survival advantage.`);
  lines.push(``);
  lines.push(`Consistent execution beats big promises. We keep building.`);

  return lines.join("\n");
}

function buildDiscordDraft(input: BuybackReporterInput): string {
  const {
    projectName,
    tokenTicker,
    buybackAmount,
    tokensBurned,
    treasuryBalance,
    solscanTxHash,
  } = input;

  const ticker = `$${tokenTicker}`;
  const solscanLink = solscanTxHash
    ? `https://solscan.io/tx/${solscanTxHash}`
    : "[tx hash pending]";

  const lines = [
    `**${ticker} Buyback Report**`,
    ``,
    `**Buyback Amount**`,
    `${formatTokens(buybackAmount)} ${ticker} (~$${formatUsd(buybackAmount)})`,
    ``,
  ];

  if (tokensBurned !== undefined) {
    lines.push(`**Tokens Burned**`);
    lines.push(`${formatTokens(tokensBurned)} ${ticker}`);
    const reduction = (tokensBurned / 1_000_000_000) * 100;
    lines.push(`Supply reduction: ${reduction.toFixed(4)}%`);
    lines.push(``);
  }

  if (treasuryBalance !== undefined) {
    lines.push(`**Treasury Remaining**`);
    lines.push(`$${formatUsd(treasuryBalance)}`);
    lines.push(``);
  }

  lines.push(`**On-Chain Proof**`);
  lines.push(solscanLink);
  lines.push(``);
  lines.push(`**Why Buybacks Matter**`);
  lines.push(`Projects with regular buybacks: -0.48% YTD`);
  lines.push(`Projects without: -47.15% YTD`);
  lines.push(`That's a 47-point survival advantage.`);
  lines.push(``);
  lines.push(`${projectName} keeps building.`);

  return lines.join("\n");
}

function assessImpact(buybackAmount: number): string {
  // Mock daily volume estimate -- in production this would come from on-chain data
  const estimatedDailyVolume = 100_000;
  const ratio = buybackAmount / estimatedDailyVolume;

  let assessment: string;

  if (ratio > 0.05) {
    assessment =
      "Significant buy pressure. This sends a strong signal to holders.";
  } else if (ratio >= 0.01) {
    assessment =
      "Meaningful buyback. Consistent execution matters more than size.";
  } else {
    assessment =
      "Every bit counts. Consider increasing frequency to build cadence.";
  }

  const lines = [
    assessment,
    "",
    "Buyback survival stats:",
    "- Projects with regular buybacks: -0.48% YTD price performance",
    "- Projects without: -47.15% YTD",
    "- That's a 47-point survival advantage",
  ];

  return lines.join("\n");
}

export async function executeBuybackReporter(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as BuybackReporterInput;
  const report = buildReport(params);
  const tweetDraft = buildTweetDraft(params);
  const telegramDraft = buildTelegramDraft(params);
  const discordDraft = buildDiscordDraft(params);
  const impact = assessImpact(params.buybackAmount);

  const output: BuybackReporterOutput = {
    report,
    tweetDraft,
    telegramDraft,
    discordDraft,
    impact,
  };

  const sources = [makeSource("MetIgnite Buyback Playbook", "internal://skills/buyback-reporter")];

  const ticker = `$${params.tokenTicker}`;
  const summary =
    `Buyback Report: ${ticker} -- $${formatUsd(params.buybackAmount)} buyback executed. ` +
    (params.tokensBurned !== undefined
      ? `${formatTokens(params.tokensBurned)} tokens burned. `
      : "") +
    `Drafts generated for Twitter, Telegram, and Discord.`;

  return buildSkillResponse("buyback-reporter", {
    data: output,
    summary,
    nextSteps: [
      "Review and post the tweet draft -- customize any placeholder values",
      "Pin the Telegram message for visibility",
      "Post the Discord embed in your announcements channel",
      "Schedule the next buyback to maintain cadence -- consistency beats size",
    ],
    sources,
  });
}
