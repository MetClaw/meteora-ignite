import type { Project } from "./project-store";
import { PHASE_ORDER, getPhaseSkills, getUnmetDeps } from "./skills/types";
import type { LaunchMode, SkillParams, PoolSetupOutput } from "./skills/types";
import { SKILL_DESCRIPTIONS } from "./skills/registry";

export interface Recommendation {
  skillId: string;
  name: string;
  description: string;
  phase: string;
  reason: string;
  priority: "now" | "next" | "later";
}

export function getRecommendations(project: Project): Recommendation[] {
  const completed = new Set(Object.keys(project.skillResults));
  const mode: LaunchMode = project.context.launchMode ?? "custom";
  const recommendations: Recommendation[] = [];
  const phaseSkills = getPhaseSkills(mode);

  for (const phase of PHASE_ORDER) {
    const skills = phaseSkills[phase];

    for (const skillId of skills) {
      if (completed.has(skillId)) continue;

      const desc = SKILL_DESCRIPTIONS[skillId];
      if (!desc) continue;

      const unmet = getUnmetDeps(skillId, completed, mode);
      let priority: "now" | "next" | "later";
      let reason: string;

      if (unmet.length > 0) {
        // Has unmet dependencies -- blocked
        const depNames = unmet.map(d => SKILL_DESCRIPTIONS[d]?.name ?? d).join(", ");
        priority = "later";
        reason = `Requires: ${depNames}`;
      } else if (phase === project.currentPhase) {
        priority = "now";
        reason = getReasonForSkill(skillId, project);
      } else if (
        PHASE_ORDER.indexOf(phase) === PHASE_ORDER.indexOf(project.currentPhase) + 1
      ) {
        priority = "next";
        reason = getReasonForSkill(skillId, project);
      } else {
        priority = "later";
        reason = `Available after earlier phases are complete.`;
      }

      recommendations.push({
        skillId,
        name: desc.name,
        description: desc.description,
        phase,
        reason,
        priority,
      });
    }
  }

  return recommendations;
}

// Context-aware reasons for why a skill should run next
function getReasonForSkill(skillId: string, project: Project): string {
  const completed = new Set(Object.keys(project.skillResults));
  const ctx = project.context;

  switch (skillId) {
    case "intake":
      return "Start here. Tell MetIgnite about your project so every skill is personalized.";
    case "trust-score":
      return ctx.isDoxxed
        ? "You're doxxed -- good. Let's see how you compare to projects that made it."
        : "Anonymous teams face extra scrutiny. Let's assess your trust signals.";
    case "tokenomics-review":
      return "Score your supply, vesting, and distribution before going on-chain.";
    case "pool-setup":
      return `Best pool type depends on your ${ctx.assetType} profile. Let's find the right fit.`;
    case "content-draft":
      return completed.has("pool-setup")
        ? "Pool configured. Now let's write your launch content."
        : "Draft your launch announcements and thread copy.";
    case "listing-ops":
      return "DexScreener, Jupiter, CoinGecko -- costs, order, and requirements.";
    case "community-setup":
      return ctx.existingCommunitySize > 500
        ? `${ctx.existingCommunitySize} members already -- let's structure your channels.`
        : "Build the community infrastructure before launch day.";
    case "outreach":
      return "Find the right KOLs, spaces, and podcasts for your niche.";
    case "comms-calendar":
      return "30-day communication plan so you never go silent.";
    case "readiness-gate":
      return "Final check before launch. Score all dimensions.";
    case "launch-sequence":
      return "Minute-by-minute playbook for the 30-minute window.";
    case "post-launch-monitor":
      return "Daily health checks and alerts for the first 30 days.";
    case "crisis-response":
      return "Have your crisis playbook ready before you need it.";
    case "growth-playbook":
      return "8-week growth plan with KPIs and budget allocation.";
    case "buyback-reporter":
      return "Generate buyback/burn reports with on-chain receipts.";
    case "analytics":
      return "Pool performance, LP activity, and volume tracking.";
    default:
      return "Run this skill to complete your launch preparation.";
  }
}

export function buildSkillParams(
  skillId: string,
  project: Project
): SkillParams {
  const ctx = project.context;

  const base = {
    projectName: ctx.projectName,
    assetType: ctx.assetType,
    budget: ctx.budget,
    existingCommunitySize: ctx.existingCommunitySize,
  };

  switch (skillId) {
    case "intake":
      return {
        projectName: ctx.projectName,
        projectDescription: ctx.projectDescription,
        teamSize: ctx.teamSize,
        isDoxxed: ctx.isDoxxed,
        targetAudience: ctx.targetMarket,
        launchTimeline: ctx.launchTimeline,
        budget: ctx.budget,
        existingCommunitySize: ctx.existingCommunitySize,
        hasToken: false,
        hasSocials: ctx.hasSocials,
        hasWebsite: ctx.hasWebsite,
        primaryGoal: ctx.primaryGoal,
      };
    case "trust-score":
      return {
        isDoxxed: ctx.isDoxxed,
        hasMultisig: true,
        hasLPLock: true,
        hasVesting: true,
        willRevokeAuthorities: true,
        hasPriorProjects: false,
        priorProjectOutcome: "none",
        socialPresenceScore: 60,
        ownsNarrative: true,
        hasCommunityPreLaunch: ctx.existingCommunitySize > 0,
        communitySize: ctx.existingCommunitySize,
        budgetTransparency: true,
      };
    case "tokenomics-review":
      return {
        totalSupply: ctx.totalSupply ?? 1000000000,
        distribution: ctx.distribution ?? [
          { category: "Community", percentage: 40, vestingMonths: 0 },
          { category: "Team", percentage: 20, vestingMonths: 24 },
          { category: "Treasury", percentage: 15, vestingMonths: 12 },
          { category: "Investors", percentage: 15, vestingMonths: 18 },
          { category: "LP", percentage: 10, vestingMonths: 0 },
        ],
        initialCirculating: ctx.totalSupply && ctx.initialCirculating
          ? Math.round(ctx.totalSupply * (ctx.initialCirculating / 100))
          : 150000000,
        hasLPLock: ctx.hasLPLock ?? true,
        hasMultisig: ctx.hasMultisig ?? true,
      };
    case "pool-setup":
      return {
        tokenMint: "demo",
        assetType: ctx.assetType,
        initialLiquidity: ctx.budget === "funded" ? 100000 : ctx.budget === "seed" ? 25000 : 5000,
        targetVolume: ctx.budget === "funded" ? "high" : "medium",
      };
    case "content-draft":
      return {
        ...base,
        keyFeatures: ["Concentrated liquidity on Meteora", "Community-driven governance", "Sustainable fee model"],
        tone: "balanced",
        formats: ["announcement", "thread"],
      };
    case "listing-ops":
      return {
        ...base,
        tokenMint: "demo",
        hasLogo: true,
        hasSocials: ctx.hasSocials,
        hasWebsite: ctx.hasWebsite,
        poolAddress: "demo-pool",
      };
    case "community-setup":
      return {
        ...base,
        platforms: ["both"],
      };
    case "outreach":
      return {
        ...base,
        keyFeatures: ["Concentrated liquidity on Meteora", "Community-driven governance"],
      };
    case "comms-calendar":
      return {
        ...base,
        platforms: ["twitter", "telegram", "discord"],
      };
    case "readiness-gate":
      return {
        completedSkills: project.skillResults,
        founderContext: ctx,
        trustScore: ctx.trustScore,
      };
    case "launch-sequence":
      return {
        projectName: ctx.projectName,
        tokenTicker: ctx.projectName.substring(0, 4).toUpperCase(),
        poolType: (project.skillResults["pool-setup"]?.data as PoolSetupOutput | undefined)?.recommendedPool ?? "DBC",
        launchTime: "14:00 UTC",
        platforms: ["twitter", "telegram", "discord"],
        contentReady: "content-draft" in project.skillResults,
        listingsReady: "listing-ops" in project.skillResults,
      };
    case "post-launch-monitor":
      return {
        projectName: ctx.projectName,
        tokenTicker: ctx.projectName.substring(0, 4).toUpperCase(),
        assetType: ctx.assetType,
        daysSinceLaunch: 3,
      };
    case "crisis-response":
      return {
        projectName: ctx.projectName,
        tokenTicker: ctx.projectName.substring(0, 4).toUpperCase(),
        crisisType: "general",
        severity: "medium",
        context: "Preparing crisis playbook before launch.",
      };
    case "growth-playbook":
      return {
        ...base,
        launchTimeline: ctx.launchTimeline,
        primaryGoal: ctx.primaryGoal,
      };
    case "buyback-reporter":
      return {
        projectName: ctx.projectName,
        tokenTicker: ctx.projectName.substring(0, 4).toUpperCase(),
        buybackAmount: 5000,
        tokensBurned: 250000,
        treasuryBalance: 45000,
        solscanTxHash: "demo-tx-hash",
      };
    case "analytics":
      return {
        ...base,
        timeframe: "7d",
      };
    default:
      return base;
  }
}
