"use client";

import { useState } from "react";
import type { Project } from "@/lib/project-store";
import type { SkillParams, PoolSetupOutput } from "@/lib/skills/types";

// ---------------------------------------------------------------------------
// Per-skill field definitions
// ---------------------------------------------------------------------------

type FieldType = "text" | "number" | "select" | "toggle" | "textarea" | "tags" | "slider";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  required?: boolean;
}

// What fields each skill needs from the founder (beyond what onboarding covers)
const SKILL_FIELDS: Record<string, FieldDef[]> = {
  intake: [
    { key: "projectDescription", label: "Project Description", type: "textarea", hint: "What does your project do? Be specific.", required: true },
    { key: "targetAudience", label: "Target Audience", type: "text", hint: "Who is this for? e.g. DeFi degens, institutional LPs, gaming community" },
    { key: "launchTimeline", label: "Launch Timeline", type: "select", options: [
      { value: "1 week", label: "1 week" }, { value: "2 weeks", label: "2 weeks" },
      { value: "1 month", label: "1 month" }, { value: "3 months", label: "3 months" },
    ]},
    { key: "hasToken", label: "Token already deployed?", type: "toggle" },
  ],
  "trust-score": [
    { key: "isDoxxed", label: "Team is doxxed", type: "toggle" },
    { key: "hasMultisig", label: "Treasury uses multisig", type: "toggle" },
    { key: "hasLPLock", label: "LP tokens will be locked", type: "toggle" },
    { key: "hasVesting", label: "Token vesting is set up", type: "toggle" },
    { key: "willRevokeAuthorities", label: "Will revoke mint/freeze authority", type: "toggle" },
    { key: "hasPriorProjects", label: "Team has prior projects", type: "toggle" },
    { key: "priorProjectOutcome", label: "Prior project outcome", type: "select", options: [
      { value: "none", label: "No prior projects" }, { value: "success", label: "Successful" },
      { value: "mixed", label: "Mixed results" }, { value: "failed", label: "Failed" },
    ]},
    { key: "socialPresenceScore", label: "Social presence strength", type: "slider", min: 0, max: 100, hint: "0 = no presence, 100 = established brand" },
    { key: "ownsNarrative", label: "Controls project narrative", type: "toggle" },
    { key: "hasCommunityPreLaunch", label: "Has pre-launch community", type: "toggle" },
    { key: "budgetTransparency", label: "Budget/treasury is transparent", type: "toggle" },
  ],
  "tokenomics-review": [
    { key: "totalSupply", label: "Total Supply", type: "number", min: 1, required: true },
    { key: "initialCirculating", label: "Initial Circulating %", type: "number", min: 1, max: 100, hint: "What % of total supply is unlocked at launch?" },
    { key: "hasLPLock", label: "LP tokens locked", type: "toggle" },
    { key: "hasMultisig", label: "Multisig treasury", type: "toggle" },
  ],
  "pool-setup": [
    { key: "tokenMint", label: "Token Mint Address", type: "text", hint: "Paste your SPL token mint address, or leave as 'demo' to test" },
    { key: "initialLiquidity", label: "Initial Liquidity (USD)", type: "number", min: 100, hint: "How much USD worth of liquidity will you add?" },
    { key: "targetVolume", label: "Target Volume", type: "select", options: [
      { value: "low", label: "Low -- niche token, organic growth" },
      { value: "medium", label: "Medium -- moderate trading expected" },
      { value: "high", label: "High -- heavy launch activity expected" },
    ]},
  ],
  "content-draft": [
    { key: "tagline", label: "Project Tagline", type: "text", hint: "One-liner that captures your project" },
    { key: "keyFeatures", label: "Key Features", type: "tags", hint: "Your project's top features (press Enter to add)" },
    { key: "tokenTicker", label: "Token Ticker", type: "text", hint: "e.g. $SOL, $MET" },
    { key: "targetAudience", label: "Target Audience", type: "text", hint: "Who should read this?" },
    { key: "tone", label: "Tone", type: "select", options: [
      { value: "professional", label: "Professional -- clean, institutional" },
      { value: "degen", label: "Degen -- CT native, meme-aware" },
      { value: "balanced", label: "Balanced -- accessible, clear" },
    ]},
    { key: "formats", label: "Formats to generate", type: "select", options: [
      { value: "announcement", label: "Launch announcement" },
      { value: "thread", label: "Twitter thread" },
      { value: "pitch", label: "Investor pitch" },
      { value: "telegram-pin", label: "Telegram pinned message" },
    ]},
    { key: "launchDate", label: "Launch Date", type: "text", hint: "When are you launching?" },
  ],
  "listing-ops": [
    { key: "tokenMint", label: "Token Mint Address", type: "text", hint: "Your SPL token mint, or 'demo'" },
    { key: "tokenTicker", label: "Token Ticker", type: "text" },
    { key: "hasLogo", label: "Logo ready?", type: "toggle" },
    { key: "hasSocials", label: "Social accounts live?", type: "toggle" },
    { key: "hasWebsite", label: "Website live?", type: "toggle" },
    { key: "poolAddress", label: "Pool Address", type: "text", hint: "If you already have a Meteora pool" },
  ],
  "community-setup": [
    { key: "tokenTicker", label: "Token Ticker", type: "text" },
    { key: "platforms", label: "Platforms", type: "select", options: [
      { value: "telegram", label: "Telegram only" },
      { value: "discord", label: "Discord only" },
      { value: "both", label: "Both Telegram + Discord" },
    ]},
    { key: "launchDate", label: "Launch Date", type: "text", hint: "When are you going live?" },
  ],
  outreach: [
    { key: "tokenTicker", label: "Token Ticker", type: "text" },
    { key: "keyFeatures", label: "Key Features", type: "tags", hint: "What makes your project stand out?" },
    { key: "targetAudience", label: "Target Audience", type: "text", hint: "Who do you want to reach?" },
    { key: "launchDate", label: "Launch Date", type: "text" },
  ],
  "comms-calendar": [
    { key: "tokenTicker", label: "Token Ticker", type: "text" },
    { key: "launchDate", label: "Launch Date", type: "text", hint: "Start date for the calendar" },
    { key: "platforms", label: "Active Platforms", type: "tags", hint: "e.g. twitter, telegram, discord" },
  ],
  "readiness-gate": [],
  "launch-sequence": [
    { key: "tokenTicker", label: "Token Ticker", type: "text", required: true },
    { key: "poolType", label: "Pool Type", type: "select", options: [
      { value: "DLMM", label: "DLMM" }, { value: "DAMM_v2", label: "DAMM v2" }, { value: "DBC", label: "DBC" },
    ]},
    { key: "launchTime", label: "Launch Time (UTC)", type: "text", hint: "e.g. 14:00 UTC" },
    { key: "platforms", label: "Distribution Platforms", type: "tags", hint: "e.g. twitter, telegram, discord" },
    { key: "contentReady", label: "Content is ready", type: "toggle" },
    { key: "listingsReady", label: "Listings submitted", type: "toggle" },
  ],
  "post-launch-monitor": [
    { key: "tokenTicker", label: "Token Ticker", type: "text", required: true },
    { key: "daysSinceLaunch", label: "Days Since Launch", type: "number", min: 0, hint: "How many days ago did you launch?" },
    { key: "poolAddress", label: "Pool Address", type: "text", hint: "Your Meteora pool address" },
  ],
  "crisis-response": [
    { key: "tokenTicker", label: "Token Ticker", type: "text", required: true },
    { key: "crisisType", label: "Crisis Type", type: "select", required: true, options: [
      { value: "general", label: "General -- prepare playbook in advance" },
      { value: "price-dump", label: "Price dump -- token tanking" },
      { value: "fud", label: "FUD -- misinformation spreading" },
      { value: "exploit", label: "Exploit -- security incident" },
      { value: "whale-exit", label: "Whale exit -- large LP/holder leaving" },
      { value: "social-attack", label: "Social attack -- coordinated harassment" },
    ]},
    { key: "severity", label: "Severity", type: "select", options: [
      { value: "low", label: "Low -- minor, manageable" },
      { value: "medium", label: "Medium -- needs attention" },
      { value: "high", label: "High -- urgent response needed" },
      { value: "critical", label: "Critical -- existential threat" },
    ]},
    { key: "context", label: "What's happening?", type: "textarea", hint: "Describe the situation so MetIgnite can tailor the response" },
  ],
  "growth-playbook": [
    { key: "launchTimeline", label: "Timeline", type: "text", hint: "How far out is your launch?" },
    { key: "tokenTicker", label: "Token Ticker", type: "text" },
    { key: "primaryGoal", label: "Primary Goal", type: "select", options: [
      { value: "volume", label: "Trading Volume" }, { value: "holders", label: "Holder Growth" },
      { value: "tvl", label: "TVL Growth" }, { value: "awareness", label: "Brand Awareness" },
    ]},
    { key: "poolType", label: "Pool Type (if decided)", type: "select", options: [
      { value: "", label: "Not decided yet" },
      { value: "DLMM", label: "DLMM" }, { value: "DAMM_v2", label: "DAMM v2" }, { value: "DBC", label: "DBC" },
    ]},
    { key: "hasContentDraft", label: "Content already drafted", type: "toggle" },
    { key: "hasCommunitySetup", label: "Community channels set up", type: "toggle" },
  ],
  "buyback-reporter": [
    { key: "tokenTicker", label: "Token Ticker", type: "text", required: true },
    { key: "buybackAmount", label: "Buyback Amount (USD)", type: "number", min: 0, required: true },
    { key: "tokensBurned", label: "Tokens Burned", type: "number", min: 0 },
    { key: "treasuryBalance", label: "Treasury Balance (USD)", type: "number", min: 0 },
    { key: "solscanTxHash", label: "Solscan TX Hash", type: "text", hint: "Transaction hash for on-chain proof" },
  ],
  analytics: [
    { key: "tokenMint", label: "Token Mint Address", type: "text" },
    { key: "poolAddress", label: "Pool Address", type: "text" },
    { key: "timeframe", label: "Timeframe", type: "select", options: [
      { value: "24h", label: "Last 24 hours" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" },
    ]},
  ],
};

// ---------------------------------------------------------------------------
// Build default values from project context
// ---------------------------------------------------------------------------

function getDefaults(skillId: string, project: Project): SkillParams {
  const ctx = project.context;
  const ticker = ctx.projectName.substring(0, 4).toUpperCase();

  const base: SkillParams = {
    projectName: ctx.projectName,
    assetType: ctx.assetType,
    budget: ctx.budget,
    existingCommunitySize: ctx.existingCommunitySize,
    tokenTicker: ticker,
    isDoxxed: ctx.isDoxxed,
    hasSocials: ctx.hasSocials,
    hasWebsite: ctx.hasWebsite,
  };

  switch (skillId) {
    case "intake":
      return { ...base, projectDescription: ctx.projectDescription, targetAudience: ctx.targetMarket, launchTimeline: ctx.launchTimeline, hasToken: false, teamSize: ctx.teamSize };
    case "trust-score":
      return { ...base, hasMultisig: ctx.hasMultisig ?? false, hasLPLock: ctx.hasLPLock ?? false, hasVesting: false, willRevokeAuthorities: false, hasPriorProjects: false, priorProjectOutcome: "none", socialPresenceScore: 50, ownsNarrative: false, hasCommunityPreLaunch: ctx.existingCommunitySize > 0, budgetTransparency: false };
    case "tokenomics-review":
      return { totalSupply: ctx.totalSupply ?? 1000000000, initialCirculating: ctx.initialCirculating ?? 15, hasLPLock: ctx.hasLPLock ?? false, hasMultisig: ctx.hasMultisig ?? false };
    case "pool-setup":
      return { tokenMint: "", initialLiquidity: ctx.budget === "funded" ? 100000 : ctx.budget === "seed" ? 25000 : 5000, targetVolume: ctx.budget === "funded" ? "high" : "medium" };
    case "content-draft":
      return { ...base, tagline: "", keyFeatures: [], tone: "balanced", formats: "announcement", launchDate: "", targetAudience: ctx.targetMarket };
    case "listing-ops":
      return { ...base, tokenMint: "", hasLogo: false, poolAddress: "" };
    case "community-setup":
      return { ...base, platforms: "both", launchDate: "" };
    case "outreach":
      return { ...base, keyFeatures: [], targetAudience: ctx.targetMarket, launchDate: "" };
    case "comms-calendar":
      return { ...base, platforms: ["twitter", "telegram", "discord"], launchDate: "" };
    case "launch-sequence":
      return { ...base, poolType: (project.skillResults["pool-setup"]?.data as PoolSetupOutput | undefined)?.recommendedPool ?? "DBC", launchTime: "14:00 UTC", platforms: ["twitter", "telegram", "discord"], contentReady: "content-draft" in project.skillResults, listingsReady: "listing-ops" in project.skillResults };
    case "post-launch-monitor":
      return { ...base, daysSinceLaunch: 1, poolAddress: "" };
    case "crisis-response":
      return { ...base, crisisType: "general", severity: "medium", context: "" };
    case "growth-playbook":
      return { ...base, launchTimeline: ctx.launchTimeline, primaryGoal: ctx.primaryGoal, poolType: "", hasContentDraft: "content-draft" in project.skillResults, hasCommunitySetup: "community-setup" in project.skillResults };
    case "buyback-reporter":
      return { ...base, buybackAmount: 0, tokensBurned: 0, treasuryBalance: 0, solscanTxHash: "" };
    case "analytics":
      return { ...base, tokenMint: "", poolAddress: "", timeframe: "7d" };
    default:
      return base;
  }
}

// ---------------------------------------------------------------------------
// Tags Input Component
// ---------------------------------------------------------------------------

function TagsInput({ value, onChange, hint }: { value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-met-primary-400/15 text-met-primary-400 text-xs">
            {tag}
            <button onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-met-text-primary cursor-pointer">x</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder={hint || "Type and press Enter"}
          className="flex-1 h-10 px-3 rounded-lg bg-met-container border border-met-stroke text-sm text-met-text-primary placeholder:text-met-text-tertiary focus:outline-none focus:border-met-stroke-active transition-colors"
        />
        <button onClick={addTag} className="px-3 h-10 rounded-lg bg-met-container border border-met-stroke text-xs text-met-text-secondary hover:border-met-stroke-active transition-colors cursor-pointer">
          Add
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Form Component
// ---------------------------------------------------------------------------

interface SkillInputFormProps {
  skillId: string;
  skillName: string;
  project: Project;
  onSubmit: (params: SkillParams) => void;
  onCancel: () => void;
}

export function SkillInputForm({ skillId, skillName, project, onSubmit, onCancel }: SkillInputFormProps) {
  const fields = SKILL_FIELDS[skillId] ?? [];
  const [values, setValues] = useState<SkillParams>(() => getDefaults(skillId, project));

  const update = (key: string, value: string | number | boolean | string[]) => setValues((prev) => ({ ...prev, [key]: value }));

  // If no fields defined (e.g. readiness-gate), auto-submit
  if (fields.length === 0) {
    return (
      <div className="p-5 space-y-4">
        <p className="text-sm text-met-text-secondary">
          This skill uses your project profile and completed skills automatically. No additional input needed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-met-stroke text-sm text-met-text-secondary hover:border-met-stroke-active transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={() => onSubmit(values)} className="flex-1 py-2.5 rounded-lg bg-met-accent-400 text-met-text-primary text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
            Run {skillName}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-met-text-primary">{skillName}</h3>
        <p className="text-xs text-met-text-tertiary mt-1">Fill in the details below for personalized results. Fields are pre-filled from your project profile.</p>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {fields.map((field) => {
          const val = values[field.key];
          return (
            <div key={field.key}>
              <label className="block text-xs text-met-text-tertiary mb-1.5 uppercase tracking-wider">
                {field.label}
                {field.required && <span className="text-met-accent-400 ml-1">*</span>}
              </label>

              {field.type === "text" && (
                <input
                  type="text"
                  value={(val ?? "") as string}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.hint}
                  className="w-full h-10 px-3 rounded-lg bg-met-container border border-met-stroke text-sm text-met-text-primary placeholder:text-met-text-tertiary focus:outline-none focus:border-met-stroke-active transition-colors"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  value={(val ?? "") as string}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.hint}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-met-container border border-met-stroke text-sm text-met-text-primary placeholder:text-met-text-tertiary focus:outline-none focus:border-met-stroke-active transition-colors resize-none"
                />
              )}

              {field.type === "number" && (
                <input
                  type="number"
                  value={(val ?? 0) as number}
                  min={field.min}
                  max={field.max}
                  onChange={(e) => update(field.key, parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg bg-met-container border border-met-stroke text-sm text-met-text-primary focus:outline-none focus:border-met-stroke-active transition-colors"
                />
              )}

              {field.type === "select" && field.options && (
                <select
                  value={(val ?? "") as string}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-met-container border border-met-stroke text-sm text-met-text-primary focus:outline-none focus:border-met-stroke-active transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {field.type === "toggle" && (
                <button
                  onClick={() => update(field.key, !val)}
                  className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    val
                      ? "bg-met-success/10 border-met-success/30 text-met-success"
                      : "bg-met-container border-met-stroke text-met-text-tertiary hover:border-met-stroke-active"
                  }`}
                >
                  {val ? "Yes" : "No"}
                </button>
              )}

              {field.type === "slider" && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={field.min ?? 0}
                    max={field.max ?? 100}
                    value={(val ?? 50) as number}
                    onChange={(e) => update(field.key, parseInt(e.target.value))}
                    className="flex-1 accent-met-accent-400"
                  />
                  <span className="text-sm text-met-text-primary font-medium tabular-nums w-8 text-right">{val as number}</span>
                </div>
              )}

              {field.type === "tags" && (
                <TagsInput
                  value={Array.isArray(val) ? (val as string[]) : []}
                  onChange={(v) => update(field.key, v)}
                  hint={field.hint}
                />
              )}

              {field.hint && field.type !== "tags" && field.type !== "text" && field.type !== "textarea" && (
                <p className="text-[10px] text-met-text-tertiary mt-1">{field.hint}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2 border-t border-met-stroke">
        <button onClick={onCancel} className="px-4 py-2.5 rounded-lg border border-met-stroke text-sm text-met-text-secondary hover:border-met-stroke-active transition-colors cursor-pointer">
          Cancel
        </button>
        <button onClick={() => onSubmit(values)} className="flex-1 py-2.5 rounded-lg bg-met-accent-400 text-met-text-primary text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
          Run {skillName}
        </button>
      </div>
    </div>
  );
}
