"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProject, createProject, resetProject, saveSkillResult, getPhaseStats, getReadinessScore } from "@/lib/project-store";
import { getRecommendations, buildSkillParams } from "@/lib/agent";
import { SKILL_DESCRIPTIONS } from "@/lib/skills/registry";
import { PHASE_ORDER, getPhaseSkills, getUnmetDeps } from "@/lib/skills/types";
import type { Project } from "@/lib/project-store";
import type { Recommendation } from "@/lib/agent";
import type { FounderContext, SkillResponse, SkillParams, LaunchMode } from "@/lib/skills/types";
import { SkillResultCard } from "@/components/chat/SkillResultCard";
import { SkillInputForm } from "@/components/SkillInputForm";

const ASSET_TYPES = [
  { value: "utility", label: "Utility Token", desc: "Has a product or service behind it" },
  { value: "governance", label: "Governance Token", desc: "DAO voting and protocol control" },
  { value: "meme", label: "Meme Token", desc: "Community-driven, culture-first" },
  { value: "lst", label: "LST / Liquid Staking", desc: "Staking derivative token" },
  { value: "rwa", label: "Real-World Asset", desc: "Tokenized physical or financial asset" },
] as const;

const BUDGET_LEVELS = [
  { value: "bootstrap", label: "Bootstrap", desc: "< $5K -- minimal spend" },
  { value: "seed", label: "Seed", desc: "$5K-$50K -- strategic spend" },
  { value: "funded", label: "Funded", desc: "$50K+ -- full launch budget" },
] as const;

const GOALS = [
  { value: "volume", label: "Trading Volume" },
  { value: "holders", label: "Holder Growth" },
  { value: "tvl", label: "TVL Growth" },
  { value: "awareness", label: "Brand Awareness" },
] as const;

function ModeSelectView({ onSelect }: { onSelect: (mode: LaunchMode) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-met-base-deep">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, color-mix(in srgb, var(--color-met-primary-400) 15%, transparent), transparent)",
        }}
      />
      <div className="relative z-10 w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight met-gradient-text">MetIgnite</h1>
          <p className="text-sm text-met-text-secondary mt-3">Your launch companion. Comms, strategy, trench survival.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelect("launchpad")}
            className="w-full text-left p-6 rounded-xl border border-met-stroke bg-met-container hover:border-met-accent-400/40 hover:bg-met-accent-400/5 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-met-accent-400 block mb-2">Recommended</span>
                <span className="text-lg font-semibold text-met-text-primary block">Launchpad Mode</span>
                <span className="text-sm text-met-text-secondary mt-1 block">
                  Launching on a Meteora-powered launchpad.
                  The platform handles your pool and tokenomics -- MetIgnite handles your comms, trench strategy, and growth.
                </span>
              </div>
              <span className="text-met-text-tertiary group-hover:text-met-accent-400 transition-colors text-xl mt-1">&#8594;</span>
            </div>
          </button>

          <button
            onClick={() => onSelect("custom")}
            className="w-full text-left p-6 rounded-xl border border-met-stroke bg-met-container hover:border-met-primary-400/40 hover:bg-met-primary-400/5 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-met-primary-400 block mb-2">Advanced</span>
                <span className="text-lg font-semibold text-met-text-primary block">Custom Launch</span>
                <span className="text-sm text-met-text-secondary mt-1 block">
                  Setting up your own pool on Meteora, designing tokenomics, managing listings manually.
                  Full skill suite including pool config, tokenomics review, and listing ops.
                </span>
              </div>
              <span className="text-met-text-tertiary group-hover:text-met-primary-400 transition-colors text-xl mt-1">&#8594;</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingView({ mode, onComplete, onBack }: { mode: LaunchMode; onComplete: (project: Project) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    projectName: "",
    projectDescription: "",
    assetType: "" as string,
    teamSize: 1,
    isDoxxed: false,
    targetMarket: "",
    launchTimeline: "",
    budget: "" as string,
    existingCommunitySize: 0,
    hasSocials: false,
    hasWebsite: false,
    primaryGoal: "" as string,
    // Tokenomics (custom mode only)
    totalSupply: 1000000000,
    initialCirculating: 15,
    hasLPLock: false,
    hasMultisig: false,
    distribution: [
      { category: "Community", percentage: 40, vestingMonths: 0 },
      { category: "Team", percentage: 20, vestingMonths: 24 },
      { category: "Treasury", percentage: 15, vestingMonths: 12 },
      { category: "Investors", percentage: 15, vestingMonths: 18 },
      { category: "LP", percentage: 10, vestingMonths: 0 },
    ],
  });

  type OnboardingFormValue = string | number | boolean | { category: string; percentage: number; vestingMonths: number }[];
  const update = (field: string, value: OnboardingFormValue) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Build steps dynamically based on mode
  const isLaunchpad = mode === "launchpad";

  const canAdvance = () => {
    const stepKey = stepKeys[step];
    switch (stepKey) {
      case "basics": return form.projectName.trim().length > 0 && form.projectDescription.trim().length > 0;
      case "asset": return form.assetType !== "";
      case "resources": return form.budget !== "";
      case "goal": return form.primaryGoal !== "";
      case "tokenomics": {
        const totalPct = form.distribution.reduce((sum, d) => sum + d.percentage, 0);
        return form.totalSupply > 0 && totalPct === 100;
      }
      default: return true;
    }
  };

  const handleComplete = () => {
    const context: FounderContext = {
      projectName: form.projectName.trim(),
      projectDescription: form.projectDescription.trim(),
      assetType: (form.assetType || "meme") as FounderContext["assetType"],
      targetMarket: form.targetMarket || "DeFi users",
      launchTimeline: form.launchTimeline || "2 weeks",
      existingCommunitySize: form.existingCommunitySize,
      budget: form.budget as FounderContext["budget"],
      teamSize: form.teamSize,
      isDoxxed: form.isDoxxed,
      hasSocials: form.hasSocials,
      hasWebsite: form.hasWebsite,
      primaryGoal: form.primaryGoal as FounderContext["primaryGoal"],
      currentPhase: "qualify",
      trustScore: 0,
      completedSkills: {},
      launchMode: mode,
      launchpad: isLaunchpad ? "meteora-launchpad" : undefined,
      // Tokenomics (custom mode only)
      ...(isLaunchpad ? {} : {
        totalSupply: form.totalSupply,
        initialCirculating: form.initialCirculating,
        hasLPLock: form.hasLPLock,
        hasMultisig: form.hasMultisig,
        distribution: form.distribution,
      }),
    };
    const project = createProject(context);
    onComplete(project);
  };

  // Basics step
  const basicsStep = (
    <div key="basics" className="space-y-6">
      <div>
        <label className="block text-xs text-met-text-tertiary mb-2 uppercase tracking-wider">Project Name</label>
        <input
          type="text"
          value={form.projectName}
          onChange={(e) => update("projectName", e.target.value)}
          placeholder="e.g. Internet Capital Markets"
          className="w-full h-12 px-4 rounded-lg bg-met-container border border-met-stroke text-met-text-primary placeholder:text-met-text-tertiary focus:outline-none focus:border-met-stroke-active transition-colors"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs text-met-text-tertiary mb-2 uppercase tracking-wider">What does it do?</label>
        <textarea
          value={form.projectDescription}
          onChange={(e) => update("projectDescription", e.target.value)}
          placeholder="Describe your project in 1-2 sentences..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-met-container border border-met-stroke text-met-text-primary placeholder:text-met-text-tertiary focus:outline-none focus:border-met-stroke-active transition-colors resize-none"
        />
      </div>
    </div>
  );

  // Asset type step
  const assetStep = (
    <div key="asset" className="space-y-3">
      {ASSET_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => update("assetType", type.value)}
          className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
            form.assetType === type.value
              ? "bg-met-accent-400/10 border-met-accent-400/40"
              : "bg-met-container border-met-stroke hover:border-met-stroke-active"
          }`}
        >
          <span className="text-sm font-medium text-met-text-primary block">{type.label}</span>
          <span className="text-xs text-met-text-tertiary">{type.desc}</span>
        </button>
      ))}
    </div>
  );

  // Resources step
  const resourcesStep = (
    <div key="resources" className="space-y-6">
      <div className="space-y-3">
        <label className="block text-xs text-met-text-tertiary uppercase tracking-wider">Launch Budget</label>
        {BUDGET_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => update("budget", level.value)}
            className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
              form.budget === level.value
                ? "bg-met-accent-400/10 border-met-accent-400/40"
                : "bg-met-container border-met-stroke hover:border-met-stroke-active"
            }`}
          >
            <span className="text-sm font-medium text-met-text-primary block">{level.label}</span>
            <span className="text-xs text-met-text-tertiary">{level.desc}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-met-text-tertiary mb-2 uppercase tracking-wider">Team Size</label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.teamSize}
            onChange={(e) => update("teamSize", parseInt(e.target.value) || 1)}
            className="w-full h-12 px-4 rounded-lg bg-met-container border border-met-stroke text-met-text-primary focus:outline-none focus:border-met-stroke-active transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-met-text-tertiary mb-2 uppercase tracking-wider">Community Size</label>
          <input
            type="number"
            min={0}
            value={form.existingCommunitySize}
            onChange={(e) => update("existingCommunitySize", parseInt(e.target.value) || 0)}
            className="w-full h-12 px-4 rounded-lg bg-met-container border border-met-stroke text-met-text-primary focus:outline-none focus:border-met-stroke-active transition-colors"
          />
        </div>
      </div>
      <div className="flex gap-4">
        {[
          { field: "isDoxxed", label: "Team is doxxed" },
          { field: "hasSocials", label: "Social accounts live" },
          { field: "hasWebsite", label: "Website live" },
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => update(field, !form[field as keyof typeof form])}
            className={`flex-1 p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              form[field as keyof typeof form]
                ? "bg-met-success/10 border-met-success/30 text-met-success"
                : "bg-met-container border-met-stroke text-met-text-tertiary hover:border-met-stroke-active"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  // Goal step
  const goalStep = (
    <div key="goal" className="space-y-3">
      {GOALS.map((goal) => (
        <button
          key={goal.value}
          onClick={() => update("primaryGoal", goal.value)}
          className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
            form.primaryGoal === goal.value
              ? "bg-met-accent-400/10 border-met-accent-400/40"
              : "bg-met-container border-met-stroke hover:border-met-stroke-active"
          }`}
        >
          <span className="text-sm font-medium text-met-text-primary">{goal.label}</span>
        </button>
      ))}
    </div>
  );

  // Tokenomics step (custom mode only)
  const tokenomicsStep = (
    <div key="tokenomics" className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-met-text-tertiary mb-2 uppercase tracking-wider">Total Supply</label>
          <input
            type="number"
            min={1}
            value={form.totalSupply}
            onChange={(e) => update("totalSupply", parseInt(e.target.value) || 0)}
            className="w-full h-12 px-4 rounded-lg bg-met-container border border-met-stroke text-met-text-primary focus:outline-none focus:border-met-stroke-active transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-met-text-tertiary mb-2 uppercase tracking-wider">Initial Circulating %</label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.initialCirculating}
            onChange={(e) => update("initialCirculating", parseInt(e.target.value) || 0)}
            className="w-full h-12 px-4 rounded-lg bg-met-container border border-met-stroke text-met-text-primary focus:outline-none focus:border-met-stroke-active transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-met-text-tertiary mb-3 uppercase tracking-wider">Distribution</label>
        <div className="space-y-2">
          {form.distribution.map((bucket, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-met-container border border-met-stroke">
              <input
                type="text"
                value={bucket.category}
                onChange={(e) => {
                  const updated = [...form.distribution];
                  updated[idx] = { ...updated[idx], category: e.target.value };
                  update("distribution", updated);
                }}
                className="flex-1 h-8 px-3 rounded bg-met-base-dark border border-met-stroke text-xs text-met-text-primary focus:outline-none focus:border-met-stroke-active"
                placeholder="Category"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bucket.percentage}
                  onChange={(e) => {
                    const updated = [...form.distribution];
                    updated[idx] = { ...updated[idx], percentage: parseInt(e.target.value) || 0 };
                    update("distribution", updated);
                  }}
                  className="w-16 h-8 px-2 rounded bg-met-base-dark border border-met-stroke text-xs text-met-text-primary text-center focus:outline-none focus:border-met-stroke-active"
                />
                <span className="text-xs text-met-text-tertiary">%</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={bucket.vestingMonths}
                  onChange={(e) => {
                    const updated = [...form.distribution];
                    updated[idx] = { ...updated[idx], vestingMonths: parseInt(e.target.value) || 0 };
                    update("distribution", updated);
                  }}
                  className="w-16 h-8 px-2 rounded bg-met-base-dark border border-met-stroke text-xs text-met-text-primary text-center focus:outline-none focus:border-met-stroke-active"
                />
                <span className="text-xs text-met-text-tertiary whitespace-nowrap">mo vest</span>
              </div>
              {form.distribution.length > 2 && (
                <button
                  onClick={() => {
                    const updated = form.distribution.filter((_, i) => i !== idx);
                    update("distribution", updated);
                  }}
                  className="text-met-text-tertiary hover:text-met-danger text-xs cursor-pointer"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={() => {
              update("distribution", [...form.distribution, { category: "", percentage: 0, vestingMonths: 0 }]);
            }}
            className="text-xs text-met-primary-400 hover:text-met-text-primary transition-colors cursor-pointer"
          >
            + Add category
          </button>
          <span className={`text-xs font-medium ${
            form.distribution.reduce((s, d) => s + d.percentage, 0) === 100
              ? "text-met-success"
              : "text-met-danger"
          }`}>
            {form.distribution.reduce((s, d) => s + d.percentage, 0)}% / 100%
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        {[
          { field: "hasLPLock", label: "LP tokens locked" },
          { field: "hasMultisig", label: "Multisig treasury" },
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => update(field, !form[field as keyof typeof form])}
            className={`flex-1 p-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              form[field as keyof typeof form]
                ? "bg-met-success/10 border-met-success/30 text-met-success"
                : "bg-met-container border-met-stroke text-met-text-tertiary hover:border-met-stroke-active"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  // Build step sequence based on mode
  // Launchpad: basics > resources > goal (3 steps)
  // Custom: basics > asset > resources > goal > tokenomics (5 steps)
  const stepKeys: string[] = isLaunchpad
    ? ["basics", "resources", "goal"]
    : ["basics", "asset", "resources", "goal", "tokenomics"];

  const stepContent: Record<string, React.ReactNode> = {
    basics: basicsStep,
    asset: assetStep,
    resources: resourcesStep,
    goal: goalStep,
    tokenomics: tokenomicsStep,
  };

  const stepHeaders: Record<string, { label: string; header: string; subtitle: string }> = {
    basics: { label: "Your Project", header: "Tell MetIgnite about your project", subtitle: "Every skill personalizes its output based on what you tell us here." },
    asset: { label: "Asset Type", header: "What type of asset?", subtitle: "This determines pool recommendations, content tone, and growth strategy." },
    resources: { label: "Resources", header: "Your resources", subtitle: "Budget and team size shape what's realistic for your launch." },
    goal: { label: "Primary Goal", header: "What's the #1 goal?", subtitle: "This focuses your entire launch plan around one metric." },
    tokenomics: { label: "Tokenomics", header: "Your tokenomics", subtitle: "Supply, distribution, and vesting. MetIgnite scores these automatically." },
  };

  const currentKey = stepKeys[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-met-base-deep">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, color-mix(in srgb, var(--color-met-primary-400) 20%, transparent), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Mode badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded ${
            isLaunchpad ? "bg-met-accent-400/10 text-met-accent-400" : "bg-met-primary-400/10 text-met-primary-400"
          }`}>
            {isLaunchpad ? "Launchpad Mode" : "Custom Launch"}
          </span>
          <button
            onClick={onBack}
            className="text-[10px] text-met-text-tertiary hover:text-met-text-secondary transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {stepKeys.map((key, i) => (
            <div key={key} className="flex-1">
              <div className="h-1 rounded-full overflow-hidden bg-met-container">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i <= step ? "bg-met-accent-400" : "bg-transparent"
                  }`}
                  style={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
                />
              </div>
              <span className={`text-[10px] mt-1 block ${i === step ? "text-met-accent-400" : "text-met-text-tertiary"}`}>
                {stepHeaders[key].label}
              </span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-met-text-primary tracking-tight">
            {stepHeaders[currentKey].header}
          </h1>
          <p className="text-sm text-met-text-secondary mt-2">
            {stepHeaders[currentKey].subtitle}
          </p>
        </div>

        {/* Step content */}
        {stepContent[currentKey]}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-lg border border-met-stroke text-sm text-met-text-secondary hover:border-met-stroke-active transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < stepKeys.length - 1) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={!canAdvance()}
            className="flex-1 py-3 rounded-lg bg-met-accent-400 text-met-text-primary text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
          >
            {step < stepKeys.length - 1 ? "Continue" : "Launch MetIgnite"}
          </button>
        </div>
      </div>
    </div>
  );
}

const PHASE_LABELS_CUSTOM: Record<string, { label: string; tagline: string }> = {
  qualify: { label: "QUALIFY", tagline: "Prove your project is worth launching" },
  arm: { label: "ARM", tagline: "Set up the infrastructure that keeps you alive" },
  launch: { label: "LAUNCH", tagline: "Go live with confidence" },
  sustain: { label: "SUSTAIN", tagline: "Stay alive past day 30" },
};

const PHASE_LABELS_LAUNCHPAD: Record<string, { label: string; tagline: string }> = {
  qualify: { label: "PLAN", tagline: "Define your project and build credibility" },
  arm: { label: "BUILD", tagline: "Comms, community, and outreach" },
  launch: { label: "LAUNCH", tagline: "Go live with a trench strategy" },
  sustain: { label: "SURVIVE", tagline: "Stay alive past day 30" },
};

function DashboardView({ project: initial }: { project: Project }) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [runningSkill, setRunningSkill] = useState<string | null>(null);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [pendingSkill, setPendingSkill] = useState<string | null>(null);

  // Re-read from localStorage on focus (in case chat page updated it)
  useEffect(() => {
    const handleFocus = () => {
      const fresh = getProject();
      if (fresh) setProject(fresh);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const launchMode = project.context.launchMode ?? "custom";
  const isLaunchpadMode = launchMode === "launchpad";
  const phaseLabels = isLaunchpadMode ? PHASE_LABELS_LAUNCHPAD : PHASE_LABELS_CUSTOM;
  const modePhaseSkills = getPhaseSkills(launchMode);

  const phaseStats = getPhaseStats(project);
  const readiness = getReadinessScore(project);
  const recommendations = getRecommendations(project);
  const completedSkills = new Set(Object.keys(project.skillResults));
  // Next action must have all deps met
  const nextAction = recommendations.find(r => {
    const unmet = getUnmetDeps(r.skillId, completedSkills, launchMode);
    return unmet.length === 0;
  }) ?? null;

  // Open the input form for a skill
  const startSkill = (skillId: string) => {
    setPendingSkill(skillId);
  };

  // Execute with the founder's actual params
  const runSkill = async (skillId: string, params: SkillParams) => {
    setPendingSkill(null);
    setRunningSkill(skillId);
    try {
      // Merge founder params with base context the skill needs
      const mergedParams: SkillParams = { projectName: project.context.projectName, assetType: project.context.assetType, budget: project.context.budget, existingCommunitySize: project.context.existingCommunitySize, communitySize: project.context.existingCommunitySize, ...params };

      // For readiness-gate, always include completedSkills and founderContext
      if (skillId === "readiness-gate") {
        mergedParams.completedSkills = project.skillResults;
        mergedParams.founderContext = project.context;
        mergedParams.trustScore = project.context.trustScore;
      }

      // For tokenomics-review, convert initialCirculating % to absolute
      if (skillId === "tokenomics-review" && mergedParams.totalSupply && mergedParams.initialCirculating) {
        const pct = mergedParams.initialCirculating as number;
        if (pct <= 100) {
          mergedParams.initialCirculating = Math.round((mergedParams.totalSupply as number) * (pct / 100));
        }
      }

      // Include distribution from onboarding if tokenomics-review
      if (skillId === "tokenomics-review" && project.context.distribution) {
        mergedParams.distribution = mergedParams.distribution ?? project.context.distribution;
      }

      const res = await fetch(`/api/skills/${skillId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: mergedParams }),
      });
      if (res.ok) {
        const result: SkillResponse = await res.json();
        const updated = saveSkillResult(skillId, result);
        if (updated) setProject(updated);
        setExpandedResult(skillId);
      }
    } catch (error) {
      console.error(`Skill ${skillId} failed:`, error);
    }
    setRunningSkill(null);
  };

  const handleReset = () => {
    if (confirm("This will erase your project and all skill results. Continue?")) {
      resetProject();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-met-base-deep">
      {/* Header */}
      <header className="border-b border-met-stroke px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold met-gradient-text">MetIgnite</span>
          <span className="text-met-border-primary">/</span>
          <span className="text-sm text-met-text-primary font-medium">{project.context.projectName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="px-3 py-1.5 text-xs text-met-text-secondary bg-met-container border border-met-stroke rounded-lg hover:border-met-stroke-active transition-colors cursor-pointer"
          >
            Open Chat
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-met-text-tertiary hover:text-met-danger transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Readiness bar */}
      <div className="border-b border-met-stroke px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-met-text-primary">Launch Readiness</h1>
              <p className="text-xs text-met-text-tertiary mt-0.5">
                {isLaunchpadMode ? "Launchpad Mode" : project.context.assetType} -- {project.context.budget} budget -- {project.context.existingCommunitySize} community
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold met-gradient-text tabular-nums">{readiness}%</div>
              <div className="text-xs text-met-text-tertiary mt-0.5">
                {completedSkills.size}/{PHASE_ORDER.flatMap((p) => modePhaseSkills[p]).length} skills
              </div>
            </div>
          </div>

          {/* Phase progress */}
          <div className="flex gap-1.5">
            {phaseStats.map((ps) => {
              const isCurrent = ps.phase === project.currentPhase;
              return (
                <div key={ps.phase} className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold tracking-widest uppercase ${
                      ps.complete ? "text-met-success" : isCurrent ? "text-met-accent-400" : "text-met-text-tertiary"
                    }`}>
                      {phaseLabels[ps.phase]?.label}
                    </span>
                    <span className={`text-[10px] tabular-nums ${ps.complete ? "text-met-success" : "text-met-text-tertiary"}`}>
                      {ps.done}/{ps.total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-met-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ps.complete ? "bg-met-success" : isCurrent ? "bg-met-accent-400" : "bg-met-primary-400/30"
                      }`}
                      style={{ width: `${ps.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Next action CTA */}
          {nextAction && (
            <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-met-accent-400/10 to-met-primary-400/10 border border-met-accent-400/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-[10px] text-met-accent-400 font-bold tracking-widest uppercase block mb-1">
                    Recommended Next
                  </span>
                  <h2 className="text-lg font-semibold text-met-text-primary">{nextAction.name}</h2>
                  <p className="text-sm text-met-text-secondary mt-1">{nextAction.reason}</p>
                </div>
                <button
                  onClick={() => startSkill(nextAction.skillId)}
                  disabled={runningSkill !== null}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-met-accent-400 text-met-text-primary text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  {runningSkill === nextAction.skillId ? "Running..." : "Run Now"}
                </button>
              </div>
            </div>
          )}

          {/* Skills by phase */}
          <div className="space-y-8">
            {PHASE_ORDER.map((phase) => {
              const skills = modePhaseSkills[phase];
              const info = phaseLabels[phase];
              const isCurrent = phase === project.currentPhase;
              const phaseComplete = skills.every((s) => completedSkills.has(s));

              return (
                <section key={phase}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className={`text-xs font-bold tracking-widest uppercase ${
                      phaseComplete ? "text-met-success" : isCurrent ? "text-met-accent-400" : "text-met-text-secondary"
                    }`}>
                      {phaseComplete ? "\u2713 " : ""}{info?.label}
                    </h3>
                    <span className="text-xs text-met-text-tertiary">{info?.tagline}</span>
                    <div className="flex-1 h-px bg-met-stroke" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {skills.map((skillId) => {
                      const desc = SKILL_DESCRIPTIONS[skillId];
                      if (!desc) return null;
                      const isDone = completedSkills.has(skillId);
                      const isRunning = runningSkill === skillId;
                      const result = project.skillResults[skillId];
                      const isExpanded = expandedResult === skillId;
                      const unmetDeps = getUnmetDeps(skillId, completedSkills, launchMode);
                      const isBlocked = unmetDeps.length > 0;
                      const depNames = unmetDeps.map(d => SKILL_DESCRIPTIONS[d]?.name ?? d);

                      return (
                        <div
                          key={skillId}
                          className={`rounded-lg border transition-all ${
                            isDone
                              ? "bg-met-success/5 border-met-success/20"
                              : isBlocked
                              ? "bg-met-container/50 border-met-stroke opacity-60"
                              : "bg-met-container border-met-stroke hover:border-met-stroke-active"
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {isDone ? (
                                  <span className="w-5 h-5 rounded-full bg-met-success/20 flex items-center justify-center shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M2 5.5l2 2L8 3" stroke="var(--color-met-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                ) : isBlocked ? (
                                  <span className="w-5 h-5 rounded-full bg-met-container border border-met-stroke flex items-center justify-center shrink-0">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M3 3.5h4M5 2v1M3.5 5h3a1 1 0 011 1v1.5a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5V6a1 1 0 011-1z" stroke="var(--color-met-text-tertiary)" strokeWidth="0.8" strokeLinecap="round" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full border border-met-accent-400/40 flex items-center justify-center shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-met-accent-400" />
                                  </span>
                                )}
                                <span className={`text-sm font-medium ${isBlocked ? "text-met-text-tertiary" : "text-met-text-primary"}`}>{desc.name}</span>
                              </div>
                            </div>
                            <p className="text-xs text-met-text-secondary leading-relaxed ml-7">
                              {desc.description}
                            </p>

                            {/* Blocked: show what's required */}
                            {isBlocked && (
                              <div className="mt-2 ml-7 flex items-center gap-1.5">
                                <span className="text-[10px] text-met-warning font-medium">Requires:</span>
                                <span className="text-[10px] text-met-text-tertiary">{depNames.join(" + ")}</span>
                              </div>
                            )}

                            {/* Action */}
                            <div className="mt-3 ml-7">
                              {isDone ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setExpandedResult(isExpanded ? null : skillId)}
                                    className="text-xs text-met-primary-400 hover:text-met-text-primary transition-colors cursor-pointer"
                                  >
                                    {isExpanded ? "Hide result" : "View result"}
                                  </button>
                                  <button
                                    onClick={() => startSkill(skillId)}
                                    disabled={isRunning}
                                    className="text-xs text-met-text-tertiary hover:text-met-text-secondary transition-colors cursor-pointer"
                                  >
                                    Re-run
                                  </button>
                                </div>
                              ) : isBlocked ? (
                                <span className="text-[10px] text-met-text-tertiary">Complete the steps above first</span>
                              ) : (
                                <button
                                  onClick={() => startSkill(skillId)}
                                  disabled={isRunning}
                                  className="text-xs font-medium text-met-accent-400 hover:text-met-text-primary transition-colors cursor-pointer"
                                >
                                  {isRunning ? "Running..." : "Run skill"}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded result */}
                          {isExpanded && result && (
                            <div className="border-t border-met-stroke p-3">
                              <SkillResultCard result={result} />
                              {result.nextSteps.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-met-stroke">
                                  <span className="text-[10px] text-met-accent-400 font-medium">Next steps:</span>
                                  <ul className="mt-1 space-y-0.5">
                                    {result.nextSteps.map((step, i) => (
                                      <li key={i} className="text-[10px] text-met-text-tertiary">-- {step}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      {/* Skill Input Modal */}
      {pendingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPendingSkill(null)} />
          <div className="relative w-full max-w-lg rounded-xl bg-met-base-dark border border-met-stroke shadow-2xl overflow-hidden">
            <SkillInputForm
              skillId={pendingSkill}
              skillName={SKILL_DESCRIPTIONS[pendingSkill]?.name ?? pendingSkill}
              project={project}
              onSubmit={(params) => runSkill(pendingSkill, params)}
              onCancel={() => setPendingSkill(null)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-met-stroke px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-met-text-tertiary text-xs tracking-wide uppercase">
          <span>Powered by Meteora</span>
          <a
            href="https://meteora.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-met-text-secondary transition-colors"
          >
            meteora.ag
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [selectedMode, setSelectedMode] = useState<LaunchMode | null>(null);

  useEffect(() => {
    setProject(getProject());
  }, []);

  // Loading state
  if (project === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-met-base-deep">
        <div className="w-6 h-6 border-2 border-met-accent-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Returning user with existing project
  if (project !== null) {
    return <DashboardView project={project} />;
  }

  // New user: mode selection then onboarding
  if (selectedMode === null) {
    return <ModeSelectView onSelect={setSelectedMode} />;
  }

  return (
    <OnboardingView
      mode={selectedMode}
      onComplete={(p) => setProject(p)}
      onBack={() => setSelectedMode(null)}
    />
  );
}
