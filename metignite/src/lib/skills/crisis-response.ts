import type {
  CrisisResponseInput,
  CrisisResponseOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { makeSource, buildSkillResponse } from "./types";

// Response timelines by crisis type
const TIMELINES: Record<
  CrisisResponseInput["crisisType"],
  { time: string; action: string; channel: string }[]
> = {
  "price-dump": [
    {
      time: "0-30min",
      action: "Acknowledge in TG/Discord. \"We see it. Here's context.\"",
      channel: "telegram/discord",
    },
    {
      time: "30-60min",
      action: "Twitter post with facts, not emotion",
      channel: "twitter",
    },
    {
      time: "1-4hr",
      action: "Detailed thread if >30% drop",
      channel: "twitter",
    },
    {
      time: "24hr",
      action: "Follow-up with recovery plan",
      channel: "all",
    },
  ],
  fud: [
    {
      time: "0-1hr",
      action: "Do NOT respond immediately. Assess validity.",
      channel: "internal",
    },
    {
      time: "1-2hr",
      action: "If false, post factual rebuttal with evidence",
      channel: "twitter",
    },
    {
      time: "2-4hr",
      action: "If partially true, acknowledge what's accurate, correct what's not",
      channel: "twitter/telegram",
    },
    {
      time: "24hr",
      action: "Move on. Don't keep engaging with trolls.",
      channel: "all",
    },
  ],
  exploit: [
    {
      time: "0-15min",
      action: "Pause affected systems if possible",
      channel: "internal",
    },
    {
      time: "15-30min",
      action: "Initial disclosure: \"We're investigating an issue with [X]\"",
      channel: "twitter/telegram/discord",
    },
    {
      time: "1-2hr",
      action: "Detailed post-mortem draft",
      channel: "internal",
    },
    {
      time: "24hr",
      action: "Full post-mortem with remediation plan",
      channel: "all",
    },
  ],
  "whale-exit": [
    {
      time: "0-30min",
      action: "Internal assessment of pool impact",
      channel: "internal",
    },
    {
      time: "30-60min",
      action: "TG message: \"A large position closed. Pool depth at [X]. We continue building.\"",
      channel: "telegram",
    },
    {
      time: "24hr",
      action: "Address in next regular update",
      channel: "all",
    },
  ],
  "social-attack": [
    {
      time: "0-2hr",
      action: "Screenshot and document everything",
      channel: "internal",
    },
    {
      time: "2-4hr",
      action: "If from known account, respond factually once. If anonymous, ignore.",
      channel: "twitter",
    },
    {
      time: "24hr",
      action: "If persistent, community statement",
      channel: "all",
    },
  ],
  general: [
    {
      time: "0-1hr",
      action: "Assess the situation internally. Gather facts before responding.",
      channel: "internal",
    },
    {
      time: "1-2hr",
      action: "Brief, factual acknowledgment on primary channels",
      channel: "twitter/telegram",
    },
    {
      time: "2-4hr",
      action: "Detailed update with context and next steps",
      channel: "all",
    },
    {
      time: "24hr",
      action: "Follow-up with resolution status",
      channel: "all",
    },
  ],
};

function buildDraftResponses(
  input: CrisisResponseInput
): CrisisResponseOutput["draftResponses"] {
  const { projectName, tokenTicker, crisisType, context } = input;
  const ticker = tokenTicker ? `$${tokenTicker}` : projectName;

  const drafts: Record<
    CrisisResponseInput["crisisType"],
    { twitter: string; telegram: string; discord: string }
  > = {
    "price-dump": {
      twitter: [
        `${ticker} update:`,
        ``,
        `We're aware of the price movement. Here's what we know:`,
        `- ${context || "Market-wide correction affecting most tokens"}`,
        `- Treasury is intact`,
        `- No changes to roadmap or development`,
        ``,
        `We build through volatility. Always have.`,
      ].join("\n"),
      telegram: [
        `Hey everyone --`,
        ``,
        `We see the chart. Let's talk about it directly.`,
        ``,
        `What happened: ${context || "Broader market sell-off hit our pair along with most of Solana."}`,
        ``,
        `What we're doing:`,
        `- Monitoring pool depth and liquidity`,
        `- No treasury panic -- our runway is unaffected`,
        `- Development continues on schedule`,
        ``,
        `What you should know:`,
        `- We have not sold any team tokens`,
        `- LP is still locked`,
        `- We're here and building`,
        ``,
        `We'll post another update in 24 hours with a full breakdown. Stay sharp.`,
      ].join("\n"),
      discord: [
        `**${ticker} -- Price Movement Update**`,
        ``,
        `We're on it. Here's the situation:`,
        ``,
        `**What happened:** ${context || "Market correction across Solana ecosystem"}`,
        `**Pool status:** Monitoring -- liquidity intact`,
        `**Treasury:** Unaffected`,
        `**Development:** No changes`,
        ``,
        `**Action items:**`,
        `- 24hr follow-up with full breakdown incoming`,
        `- Community call if drop exceeds 30%`,
        ``,
        `Stay focused. We build through this.`,
      ].join("\n"),
    },
    fud: {
      twitter: [
        `Addressing recent claims about ${ticker}:`,
        ``,
        `Claim: "${context || "[specific claim]"}"`,
        ``,
        `Facts:`,
        `- [Evidence point 1]`,
        `- [Evidence point 2]`,
        `- [On-chain proof if applicable]`,
        ``,
        `We'll always choose transparency over silence. Verify, don't trust.`,
      ].join("\n"),
      telegram: [
        `Team here --`,
        ``,
        `We've seen the claims circulating. Let's address them head-on.`,
        ``,
        `The claim: "${context || "[specific claim]"}"`,
        ``,
        `The reality:`,
        `- [Detailed factual rebuttal]`,
        `- [Supporting evidence or on-chain data]`,
        `- [Link to proof if available]`,
        ``,
        `We took time to respond because we wanted to bring facts, not emotion. We won't be engaging further with trolls on this -- the evidence speaks for itself.`,
        ``,
        `If you have genuine questions, ask here. We're not going anywhere.`,
      ].join("\n"),
      discord: [
        `**Addressing FUD -- Official Response**`,
        ``,
        `**Claim:** "${context || "[specific claim]"}"`,
        ``,
        `**Our response:**`,
        `- [Factual rebuttal with evidence]`,
        `- [On-chain proof links]`,
        ``,
        `**What we ask from the community:**`,
        `- Share the facts, not the drama`,
        `- Report harassment, don't engage with it`,
        `- Ask us directly if something concerns you`,
        ``,
        `We're transparent by default. Always have been, always will be.`,
      ].join("\n"),
    },
    exploit: {
      twitter: [
        `${ticker} Security Notice:`,
        ``,
        `We're investigating a potential issue affecting [affected system].`,
        ``,
        `What we've done so far:`,
        `- Paused affected contracts/systems`,
        `- Engaged security partners`,
        `- Secured remaining funds`,
        ``,
        `Full post-mortem incoming. User safety is priority #1.`,
      ].join("\n"),
      telegram: [
        `URGENT -- Security Update`,
        ``,
        `We've identified an issue with [affected system]. Here's what you need to know:`,
        ``,
        `Status: ${context || "Under investigation"}`,
        ``,
        `Immediate actions taken:`,
        `- Affected systems paused`,
        `- Security team engaged`,
        `- Remaining funds secured`,
        ``,
        `What you should do:`,
        `- Do NOT interact with [affected contracts] until further notice`,
        `- Do NOT click links claiming to offer refunds`,
        `- Wait for our official update`,
        ``,
        `We will post a detailed post-mortem with a remediation plan within 24 hours. We take full responsibility for resolving this.`,
      ].join("\n"),
      discord: [
        `**SECURITY ALERT -- ${ticker}**`,
        ``,
        `**Status:** Investigating potential exploit on [affected system]`,
        ``,
        `**Actions taken:**`,
        `- Affected systems paused`,
        `- Security partners engaged`,
        `- Remaining assets secured`,
        ``,
        `**User action required:**`,
        `- Do NOT interact with affected contracts`,
        `- Ignore any "refund" links -- they are scams`,
        `- Monitor this channel for official updates only`,
        ``,
        `**Timeline:**`,
        `- Initial findings: ~2 hours`,
        `- Full post-mortem: within 24 hours`,
        `- Remediation plan: included in post-mortem`,
        ``,
        `We will fix this and come back stronger.`,
      ].join("\n"),
    },
    "whale-exit": {
      twitter: [
        `${ticker} pool update:`,
        ``,
        `A large position was closed. Pool depth remains healthy.`,
        ``,
        `No team sells. No LP unlock. Just a large holder taking profit.`,
        ``,
        `We continue building.`,
      ].join("\n"),
      telegram: [
        `Quick update --`,
        ``,
        `A large position was closed in the ${ticker} pool. You may have noticed the price impact.`,
        ``,
        `Context:`,
        `- This was an external holder, not the team`,
        `- Pool depth is at [X] -- still healthy`,
        `- No LP was unlocked`,
        `- Treasury is untouched`,
        ``,
        `Whale exits happen. It's a sign your token has real liquidity. We'll address this in our next regular update.`,
      ].join("\n"),
      discord: [
        `**${ticker} -- Large Position Closed**`,
        ``,
        `**What happened:** A whale exited their position`,
        `**Pool impact:** Depth at [X] -- monitoring`,
        `**Team tokens:** No sells`,
        `**LP lock:** Intact`,
        ``,
        `This is normal market activity. Will be addressed in the next scheduled update.`,
      ].join("\n"),
    },
    "social-attack": {
      twitter: [
        `We're aware of coordinated attacks against ${ticker}.`,
        ``,
        `We've documented everything. Our response:`,
        `- [Single factual rebuttal if warranted]`,
        ``,
        `We're focused on building. The work speaks for itself.`,
      ].join("\n"),
      telegram: [
        `Team here --`,
        ``,
        `We're aware of the attacks circulating on social media against ${ticker}.`,
        ``,
        `What we've done:`,
        `- Documented and archived everything`,
        `- Assessed whether claims have any merit (they ${context ? "require a factual response" : "do not"})`,
        ``,
        `Our approach:`,
        `- We will respond once with facts if the source is credible`,
        `- We will not engage with anonymous troll accounts`,
        `- We will not delete anything -- transparency matters`,
        ``,
        `Your best response as a community: don't feed the trolls. Share our work, not their drama.`,
      ].join("\n"),
      discord: [
        `**${ticker} -- Social Attack Response**`,
        ``,
        `We're tracking coordinated social attacks against the project.`,
        ``,
        `**Our approach:**`,
        `- Document everything`,
        `- Respond factually once if source is credible`,
        `- Ignore anonymous troll accounts`,
        `- Never delete messages -- transparency first`,
        ``,
        `**Community ask:**`,
        `- Don't engage with attackers`,
        `- Report harassment`,
        `- Share facts, not drama`,
        `- Trust the building, not the noise`,
      ].join("\n"),
    },
    general: {
      twitter: [
        `${ticker} update:`,
        ``,
        `We're aware of the current situation. Here's where things stand:`,
        `- ${context || "[Current status]"}`,
        `- Team is actively addressing this`,
        ``,
        `More details to follow.`,
      ].join("\n"),
      telegram: [
        `Team update --`,
        ``,
        `We want to address the current situation directly.`,
        ``,
        `What's happening: ${context || "[Situation summary]"}`,
        ``,
        `What we're doing:`,
        `- Assessing impact`,
        `- Preparing a detailed response`,
        `- Will share full update within 24 hours`,
        ``,
        `We're here and we're on it.`,
      ].join("\n"),
      discord: [
        `**${ticker} -- Situation Update**`,
        ``,
        `**Status:** ${context || "[Current status]"}`,
        ``,
        `**Actions:**`,
        `- Situation under review`,
        `- Detailed update coming within 24 hours`,
        ``,
        `Stay tuned to this channel for official updates.`,
      ].join("\n"),
    },
  };

  const crisis = drafts[crisisType];

  return [
    { platform: "twitter", message: crisis.twitter, tone: "Professional, brief, factual" },
    { platform: "telegram", message: crisis.telegram, tone: "Personal, reassuring, detailed" },
    { platform: "discord", message: crisis.discord, tone: "Community-focused, action-oriented" },
  ];
}

function buildDoLists(): { doList: string[]; dontList: string[] } {
  return {
    doList: [
      "Stay calm -- your community reads your energy",
      "Use facts and on-chain data to support every claim",
      "Acknowledge reality -- don't pretend nothing happened",
      "Show a clear action plan with timelines",
      "Provide proof (tx hashes, screenshots, multisig records)",
      "Communicate proactively on all active channels",
      "Document everything for post-crisis review",
    ],
    dontList: [
      "Panic sell treasury tokens",
      "Argue with trolls or anonymous accounts",
      "Delete messages or posts -- it destroys trust permanently",
      "Make promises you can't keep (\"price will recover by Friday\")",
      "Blame others -- community, market makers, or competitors",
      "Go silent -- silence is interpreted as guilt",
      "Over-communicate to the point of desperation",
    ],
  };
}

function buildRecoveryPlan(
  input: CrisisResponseInput
): CrisisResponseOutput["recoveryPlan"] {
  const baseRecovery: CrisisResponseOutput["recoveryPlan"] = [
    {
      phase: "Stabilize (0-24hr)",
      actions: [
        "Communication blitz -- update all channels with facts",
        "Community reassurance -- direct engagement in TG/Discord",
        "Technical fixes if applicable (pause contracts, patch exploits)",
        "Internal debrief -- what happened, what's the blast radius",
        "Identify and empower community advocates to help calm sentiment",
      ],
      timeline: "0-24 hours",
    },
    {
      phase: "Rebuild (1-7 days)",
      actions: [
        "Address root cause -- not just symptoms",
        "Implement preventive measures to avoid recurrence",
        "Publish transparency report with full timeline",
        "Resume normal content cadence with extra updates",
        "Engage top holders and community leaders directly",
      ],
      timeline: "1-7 days",
    },
    {
      phase: "Strengthen (1-4 weeks)",
      actions: [
        "Turn crisis into a trust-building moment -- show resilience",
        "Implement governance improvements if applicable",
        "Share lessons learned publicly",
        "Increase transparency measures (more frequent reports, open dashboards)",
        "Recognize community members who helped during the crisis",
      ],
      timeline: "1-4 weeks",
    },
  ];

  // Add crisis-specific recovery actions
  if (input.crisisType === "exploit") {
    baseRecovery[0].actions.push("Engage auditors for emergency review");
    baseRecovery[1].actions.push("Publish full post-mortem with technical details");
    baseRecovery[2].actions.push("Schedule and publish results of follow-up audit");
  }

  if (input.crisisType === "price-dump") {
    baseRecovery[1].actions.push("Consider accelerating buyback schedule if applicable");
    baseRecovery[2].actions.push("Share metrics showing recovery trajectory");
  }

  return baseRecovery;
}

export async function executeCrisisResponse(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as CrisisResponseInput;
  const { crisisType, severity } = params;

  // Build response timeline
  const responseTimeline = TIMELINES[crisisType] || TIMELINES.general;

  // Build draft responses
  const draftResponses = buildDraftResponses(params);

  // Build do/don't lists
  const { doList, dontList } = buildDoLists();

  // Build recovery plan
  const recoveryPlan = buildRecoveryPlan(params);

  const output: CrisisResponseOutput = {
    responseTimeline,
    draftResponses,
    doList,
    dontList,
    recoveryPlan,
  };

  const sources = [makeSource("MetIgnite Crisis Playbook", "internal://skills/crisis-response")];

  const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
  const crisisLabel = crisisType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const summary =
    `Crisis Response: ${crisisLabel} (${severityLabel} severity). ` +
    `Generated ${responseTimeline.length}-step timeline, ` +
    `3 platform-specific draft responses, ` +
    `and a 3-phase recovery plan.`;

  const nextSteps: string[] = [
    `Execute the ${responseTimeline[0].time} action immediately: ${responseTimeline[0].action}`,
    "Review and customize draft responses before posting -- add specific details",
    "Follow the recovery plan phases to rebuild trust systematically",
  ];

  if (severity === "critical") {
    nextSteps.unshift("CRITICAL: This requires immediate team coordination. Get all hands on deck.");
  }

  return buildSkillResponse("crisis-response", {
    data: output,
    summary,
    nextSteps,
    sources,
  });
}
