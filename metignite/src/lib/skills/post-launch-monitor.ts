import type {
  PostLaunchMonitorInput,
  PostLaunchMonitorOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

function calculateHealthScore(daysSinceLaunch: number): number {
  if (daysSinceLaunch <= 0) return 0;

  // Day 1-3: High activity, health 75-90
  if (daysSinceLaunch <= 3) {
    return 90 - (daysSinceLaunch - 1) * 5;
  }

  // Day 4-7: Settling period, health 60-75
  if (daysSinceLaunch <= 7) {
    return 75 - (daysSinceLaunch - 4) * 4;
  }

  // Day 8-14: Testing phase, health 50-65
  if (daysSinceLaunch <= 14) {
    return 65 - (daysSinceLaunch - 8) * 2;
  }

  // Day 15-30: Establishing rhythm, health 45-55
  if (daysSinceLaunch <= 30) {
    return 55 - (daysSinceLaunch - 15) * 0.5;
  }

  // Day 30+: Stabilized, slight decay
  return Math.max(30, 47 - (daysSinceLaunch - 30) * 0.3);
}

function generateAlerts(
  daysSinceLaunch: number
): PostLaunchMonitorOutput["alerts"] {
  const alerts: PostLaunchMonitorOutput["alerts"] = [];

  // Day 1-3: Focus on volume and holder count
  if (daysSinceLaunch >= 1 && daysSinceLaunch <= 3) {
    alerts.push({
      type: "info",
      message: "Track holder count growth closely -- first 72 hours set the trajectory.",
      action: "Check Solscan holder tab every 4 hours and log the count.",
    });
    alerts.push({
      type: "warning",
      message: "Volume concentration risk -- watch for single wallets dominating volume.",
      action: "Review top 10 traders on Solscan. If one wallet is >30% of volume, flag it.",
    });
    if (daysSinceLaunch === 1) {
      alerts.push({
        type: "info",
        message: "Day 1 is about visibility. Every post matters.",
        action: "Post at least 3 updates today: stats, thank-you, and what's next.",
      });
    }
  }

  // Day 4-7: Watch for LP exits, volume decline
  if (daysSinceLaunch >= 4 && daysSinceLaunch <= 7) {
    alerts.push({
      type: "warning",
      message: "Post-hype dip zone -- volume typically drops 40-60% after day 3.",
      action: "This is normal. Do not panic-post. Focus on one quality update per day.",
    });
    alerts.push({
      type: "warning",
      message: "LP exit risk increases as initial excitement fades.",
      action: "Monitor liquidity depth. If it drops >20% from launch, prepare a transparency post.",
    });
  }

  // Day 8-14: Community engagement metrics
  if (daysSinceLaunch >= 8 && daysSinceLaunch <= 14) {
    alerts.push({
      type: "info",
      message: "Community engagement is more important than price at this stage.",
      action: "Track daily active chatters in TG/Discord. Aim for >10% of members active daily.",
    });
    alerts.push({
      type: "warning",
      message: "Content fatigue zone -- repeating the same narratives stops working.",
      action: "Introduce a new angle: dev update, partnership hint, community spotlight, or AMA.",
    });
  }

  // Day 15-30: Sustainability indicators
  if (daysSinceLaunch >= 15 && daysSinceLaunch <= 30) {
    alerts.push({
      type: "info",
      message: "Sustainability phase -- focus shifts from growth to retention.",
      action: "Measure week-over-week holder retention rate. Stable or growing is healthy.",
    });
    alerts.push({
      type: "warning",
      message: "Projects that survive past day 30 have a significantly higher success rate.",
      action: "Double down on consistent communication and deliverables. Do not go quiet.",
    });
  }

  // Day 30+
  if (daysSinceLaunch > 30) {
    alerts.push({
      type: "info",
      message: "You've survived the critical first month. Shift to strategic growth.",
      action: "Review Month 1 metrics and set Month 2 targets based on actual data.",
    });
  }

  return alerts;
}

function generateDailySuggestions(
  daysSinceLaunch: number,
  input: PostLaunchMonitorInput
): PostLaunchMonitorOutput["dailySuggestions"] {
  const { projectName, tokenTicker } = input;
  const suggestions: PostLaunchMonitorOutput["dailySuggestions"] = [];

  if (daysSinceLaunch === 1) {
    suggestions.push({
      type: "stats-update",
      content:
        `$${tokenTicker} -- Day 1 stats:\n\n` +
        `Holders: [count]\n` +
        `Volume: $[amount]\n` +
        `Liquidity: $[amount]\n\n` +
        `Receipts on-chain. Always.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "thank-you",
      content:
        `To everyone who believed in ${projectName} from day 1 -- thank you.\n\n` +
        `This is the start. Not the peak.`,
      platform: "twitter",
    });
  } else if (daysSinceLaunch === 2) {
    suggestions.push({
      type: "engagement",
      content:
        `Day 2 of $${tokenTicker}.\n\n` +
        `What feature or update would you most want to see this week?\n\n` +
        `Drop your thoughts below.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "stats-update",
      content:
        `$${tokenTicker} -- 48 hour update:\n\n` +
        `Holders: [count] (up [X]% from launch)\n` +
        `Volume: $[amount]\n\n` +
        `Building in public.`,
      platform: "twitter",
    });
  } else if (daysSinceLaunch === 3) {
    suggestions.push({
      type: "buyback-report",
      content:
        `First buyback report for $${tokenTicker}:\n\n` +
        `Amount: [X] SOL\n` +
        `Tokens: [X] $${tokenTicker}\n` +
        `Tx: [solscan link]\n\n` +
        `On-chain receipts. Every time.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "community",
      content:
        `Day 3 TG/Discord check-in:\n\n` +
        `Our community has grown to [X] members.\n` +
        `Top question from the community today: [question]\n` +
        `Answer: [answer]`,
      platform: "telegram",
    });
  } else if (daysSinceLaunch === 5) {
    suggestions.push({
      type: "dev-update",
      content:
        `$${tokenTicker} -- Dev Update #1\n\n` +
        `What shipped this week:\n` +
        `-- [item 1]\n` +
        `-- [item 2]\n\n` +
        `What's next:\n` +
        `-- [item 1]\n` +
        `-- [item 2]\n\n` +
        `Building every day.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "engagement",
      content:
        `5 days in and $${tokenTicker} holders are still growing.\n\n` +
        `Most projects lose 40% of holders by day 5.\n` +
        `We're at [X]% retention.\n\n` +
        `This is what conviction looks like.`,
      platform: "twitter",
    });
  } else if (daysSinceLaunch === 7) {
    suggestions.push({
      type: "weekly-summary",
      content:
        `$${tokenTicker} -- Week 1 Summary\n\n` +
        `Holders: [count]\n` +
        `Total volume: $[amount]\n` +
        `Liquidity depth: $[amount]\n` +
        `Community members: [count]\n` +
        `Buybacks executed: [count]\n\n` +
        `Week 1 done. Here's the plan for Week 2: [preview]`,
      platform: "twitter",
    });
    suggestions.push({
      type: "community",
      content:
        `Week 1 community report:\n\n` +
        `Most asked question: [question]\n` +
        `Most requested feature: [feature]\n` +
        `Community MVP: @[username]\n\n` +
        `Thank you all. Week 2 starts now.`,
      platform: "telegram",
    });
  } else if (daysSinceLaunch === 10) {
    suggestions.push({
      type: "ama-announcement",
      content:
        `AMA time.\n\n` +
        `I'll be live in our TG/Discord at [time] to answer anything about $${tokenTicker}.\n\n` +
        `No filter. No script. Drop your questions below or bring them live.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "milestone",
      content:
        `10 days of $${tokenTicker}.\n\n` +
        `What we said we'd do:\n` +
        `-- [promise 1] -- done\n` +
        `-- [promise 2] -- in progress\n` +
        `-- [promise 3] -- done\n\n` +
        `Actions, not promises.`,
      platform: "twitter",
    });
  } else if (daysSinceLaunch === 14) {
    suggestions.push({
      type: "weekly-summary",
      content:
        `$${tokenTicker} -- Week 2 Summary\n\n` +
        `Week-over-week comparison:\n` +
        `Holders: [W1] -> [W2] ([X]%)\n` +
        `Volume: $[W1] -> $[W2]\n` +
        `Liquidity: $[W1] -> $[W2]\n\n` +
        `The noise fades. The builders remain.`,
      platform: "twitter",
    });
  } else if (daysSinceLaunch === 21) {
    suggestions.push({
      type: "weekly-summary",
      content:
        `$${tokenTicker} -- Week 3. Still here. Still building.\n\n` +
        `Key metric: [choose one compelling stat]\n\n` +
        `Most projects are dead by week 3.\n` +
        `We're accelerating.`,
      platform: "twitter",
    });
  } else if (daysSinceLaunch === 28 || daysSinceLaunch === 29 || daysSinceLaunch === 30) {
    suggestions.push({
      type: "monthly-report",
      content:
        `$${tokenTicker} -- Month 1 Report\n\n` +
        `Holders: [count]\n` +
        `Total volume: $[amount]\n` +
        `Liquidity: $[amount]\n` +
        `Buybacks: [count] totaling [X] SOL\n` +
        `Community: [count] members\n` +
        `Deliverables shipped: [count]\n\n` +
        `Month 1 is done. Month 2 plan drops tomorrow.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "community",
      content:
        `Month 1 retrospective:\n\n` +
        `What went well: [items]\n` +
        `What we'll improve: [items]\n` +
        `Month 2 focus: [items]\n\n` +
        `Your feedback matters. What should we prioritize?`,
      platform: "telegram",
    });
  } else {
    // Generic suggestions for days not explicitly mapped
    suggestions.push({
      type: "engagement",
      content:
        `$${tokenTicker} -- Day ${daysSinceLaunch} update:\n\n` +
        `[One meaningful stat or milestone]\n\n` +
        `Consistency beats hype. Every single time.`,
      platform: "twitter",
    });
    suggestions.push({
      type: "community",
      content:
        `Quick community update for $${tokenTicker}:\n\n` +
        `[What's happening today]\n` +
        `[What's coming next]\n\n` +
        `Questions? Ask here.`,
      platform: "telegram",
    });
  }

  return suggestions;
}

function generateNudges(
  daysSinceLaunch: number
): PostLaunchMonitorOutput["nudges"] {
  const nudges: PostLaunchMonitorOutput["nudges"] = [];

  if (daysSinceLaunch > 1 && daysSinceLaunch % 2 === 0) {
    nudges.push({
      message:
        "You haven't posted in 48 hours. Silence kills projects faster than bad news. " +
        "Post a quick update -- even one line is better than nothing.",
      priority: "high",
      dayTriggered: daysSinceLaunch,
    });
  }

  // "Time for your weekly buyback report" -- day 7, 14, 21, 28
  if (daysSinceLaunch === 7 || daysSinceLaunch === 14 || daysSinceLaunch === 21 || daysSinceLaunch === 28) {
    nudges.push({
      message:
        "Time for your weekly buyback report. If you executed buybacks this week, " +
        "post the on-chain receipts. If not, explain the treasury strategy.",
      priority: "medium",
      dayTriggered: daysSinceLaunch,
    });
  }

  // "Consider a community AMA" -- day 10
  if (daysSinceLaunch === 10) {
    nudges.push({
      message:
        "Consider hosting a community AMA. Day 10 is a good inflection point -- " +
        "early supporters want to hear directly from you. " +
        "Schedule it for the next 24-48 hours.",
      priority: "medium",
      dayTriggered: daysSinceLaunch,
    });
  }

  // "Month 1 report due" -- day 28-30
  if (daysSinceLaunch >= 28 && daysSinceLaunch <= 30) {
    nudges.push({
      message:
        "Month 1 report is due. Compile your metrics, buyback receipts, and deliverables. " +
        "This report sets the tone for whether your community stays or leaves.",
      priority: "high",
      dayTriggered: daysSinceLaunch,
    });
  }

  return nudges;
}

function generateWeeklyReport(
  daysSinceLaunch: number,
  assetType: string
): PostLaunchMonitorOutput["weeklyReport"] {
  // Mock but realistic data shaped by asset type and day
  const weekNumber = Math.ceil(daysSinceLaunch / 7);

  // Volume patterns by asset type
  const volumeMultiplier: Record<string, number> = {
    meme: 2.5,
    utility: 1.0,
    governance: 0.8,
    stablecoin: 3.0,
    lst: 1.5,
    rwa: 0.6,
  };

  const mult = volumeMultiplier[assetType] ?? 1.0;

  // Volume decays over time but at different rates
  const baseVolume = 50000 * mult;
  const volumeDecay = Math.pow(0.75, weekNumber - 1);
  const volume = Math.round(baseVolume * volumeDecay);

  // Holder growth slows but continues
  const baseHolders = assetType === "meme" ? 500 : 200;
  const holders = Math.round(baseHolders * (1 + weekNumber * 0.3));

  // LP activity
  const lpDescriptions = [
    "Active -- multiple positions being added and adjusted",
    "Moderate -- some adjustments, no major exits",
    "Settling -- fewer changes, positions stabilizing",
    "Stable -- established LPs holding, minimal churn",
  ];
  const lpIndex = Math.min(weekNumber - 1, lpDescriptions.length - 1);

  // Sentiment
  const sentimentMap = [
    "Excited -- launch energy still high",
    "Cautiously optimistic -- early supporters engaged",
    "Mixed -- some fatigue, core community solid",
    "Stabilizing -- community filtering to genuine supporters",
  ];
  const sentimentIndex = Math.min(weekNumber - 1, sentimentMap.length - 1);

  // Grade
  let grade: string;
  if (weekNumber === 1 && volume > 80000) grade = "A";
  else if (weekNumber === 1) grade = "B+";
  else if (weekNumber <= 2 && holders > 300) grade = "B";
  else if (weekNumber <= 3) grade = "B-";
  else if (holders > 400) grade = "B";
  else grade = "C+";

  return {
    volume: `$${volume.toLocaleString()} (Week ${weekNumber})`,
    holders: `${holders} total (${assetType === "meme" ? "high" : "moderate"} growth rate)`,
    lpActivity: lpDescriptions[lpIndex],
    sentiment: sentimentMap[sentimentIndex],
    grade,
  };
}

export async function executePostLaunchMonitor(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as PostLaunchMonitorInput;
  const { daysSinceLaunch, projectName, tokenTicker, assetType } = params;

  const healthScore = calculateHealthScore(daysSinceLaunch);
  const alerts = generateAlerts(daysSinceLaunch);
  const dailySuggestions = generateDailySuggestions(daysSinceLaunch, params);
  const nudges = generateNudges(daysSinceLaunch);
  const weeklyReport = generateWeeklyReport(daysSinceLaunch, assetType);

  const output: PostLaunchMonitorOutput = {
    healthScore,
    alerts,
    dailySuggestions,
    weeklyReport,
    nudges,
  };

  const sources = [makeSource("MetIgnite Post-Launch Monitor", "internal://skills/post-launch-monitor")];

  const phaseLabel =
    daysSinceLaunch <= 3
      ? "Launch Energy"
      : daysSinceLaunch <= 7
      ? "Settling"
      : daysSinceLaunch <= 14
      ? "Testing"
      : daysSinceLaunch <= 30
      ? "Establishing Rhythm"
      : "Sustained";

  const summary =
    `${projectName} ($${tokenTicker}) -- Day ${daysSinceLaunch} monitor. ` +
    `Health score: ${healthScore}/100. Phase: ${phaseLabel}. ` +
    `${alerts.length} alert${alerts.length !== 1 ? "s" : ""}, ` +
    `${dailySuggestions.length} post suggestion${dailySuggestions.length !== 1 ? "s" : ""}, ` +
    `${nudges.length} nudge${nudges.length !== 1 ? "s" : ""}. ` +
    `Weekly grade: ${weeklyReport.grade}.`;

  const nextSteps: string[] = [];

  if (nudges.length > 0) {
    const highPriority = nudges.filter((n) => n.priority === "high");
    if (highPriority.length > 0) {
      nextSteps.push(
        "HIGH PRIORITY: " + highPriority.map((n) => n.message).join(" | ")
      );
    }
  }

  if (dailySuggestions.length > 0) {
    nextSteps.push(
      `Post today: ${dailySuggestions[0].type} on ${dailySuggestions[0].platform}.`
    );
  }

  if (daysSinceLaunch <= 7) {
    nextSteps.push("Keep posting daily. The first week sets your reputation.");
  } else if (daysSinceLaunch <= 14) {
    nextSteps.push("Focus on community engagement over price action.");
  } else if (daysSinceLaunch <= 30) {
    nextSteps.push("Maintain consistency. Prepare your Month 1 report.");
  } else {
    nextSteps.push("Shift focus to strategic growth and partnerships.");
  }

  return buildSkillResponse("post-launch-monitor", {
    data: output,
    summary,
    nextSteps,
    sources,
  });
}
