// Skill descriptions -- used by UI for labels and display

export const SKILL_DESCRIPTIONS: Record<
  string,
  { name: string; description: string; phase: string }
> = {
  // QUALIFY
  intake: {
    name: "Project Intake",
    description: "Tell us about your project. We'll classify it and assess your readiness.",
    phase: "qualify",
  },
  "trust-score": {
    name: "Trust Score",
    description: "Automated BD screening. How does your project stack up against what works?",
    phase: "qualify",
  },
  "tokenomics-review": {
    name: "Tokenomics Review",
    description: "Score your token distribution, vesting, and security setup.",
    phase: "qualify",
  },
  "pool-setup": {
    name: "Pool Configuration",
    description: "Get the right pool type, bin step, and fee structure for your launch.",
    phase: "qualify",
  },
  // ARM
  "content-draft": {
    name: "Content Engine",
    description: "Generate launch announcements, threads, and pitch copy.",
    phase: "arm",
  },
  "listing-ops": {
    name: "Listing Ops",
    description: "DexScreener, Jupiter, CoinGecko -- costs, order, and pre-filled submissions.",
    phase: "arm",
  },
  "community-setup": {
    name: "Community Setup",
    description: "Scaffold Telegram/Discord with channels, bots, and moderation.",
    phase: "arm",
  },
  outreach: {
    name: "Outreach Plan",
    description: "Find spaces, podcasts, and KOLs. Draft outreach pitches.",
    phase: "arm",
  },
  "comms-calendar": {
    name: "Comms Calendar",
    description: "30-day communication plan with daily posts and crisis templates.",
    phase: "arm",
  },
  // LAUNCH
  "readiness-gate": {
    name: "Readiness Gate",
    description: "Are you ready to launch? Score all dimensions and find blockers.",
    phase: "launch",
  },
  "launch-sequence": {
    name: "Launch Sequence",
    description: "Minute-by-minute playbook for launch day.",
    phase: "launch",
  },
  // SUSTAIN
  "post-launch-monitor": {
    name: "Post-Launch Monitor",
    description: "Daily health checks, alerts, and post suggestions.",
    phase: "sustain",
  },
  "crisis-response": {
    name: "Crisis Response",
    description: "Price dump? FUD? Get draft responses and recovery plans.",
    phase: "sustain",
  },
  "growth-playbook": {
    name: "Growth Playbook",
    description: "8-week growth plan with KPIs, budget, and benchmarks.",
    phase: "sustain",
  },
  "buyback-reporter": {
    name: "Buyback Reporter",
    description: "Generate buyback/burn reports with on-chain receipts.",
    phase: "sustain",
  },
  analytics: {
    name: "Analytics",
    description: "Pool performance, LP activity, and volume tracking.",
    phase: "sustain",
  },
};
