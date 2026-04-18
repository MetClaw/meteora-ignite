"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ScoreCard,
  PoolRecommendationCard,
  DataTableCard,
  ChecklistCard,
  FallbackCard,
} from "./cards";
import { SKILL_DESCRIPTIONS } from "@/lib/skills/registry";
import type { SkillResponse } from "@/lib/skills/types";
import type { PoolSetupOutput, TokenomicsOutput, TrustScoreOutput, IntakeOutput, LaunchSequenceOutput, CrisisResponseOutput, ListingOpsOutput, ContentDraftOutput, GrowthPlaybookOutput } from "@/lib/skills/types";

// Card type detection -- fixed set of typed cards + fallback
type CardType = "score" | "pool-recommendation" | "data-table" | "checklist" | "content-drafts" | "growth-playbook" | "trust-score" | "intake" | "launch-sequence" | "crisis-response" | "listing-ops";

interface SkillResultCardProps {
  result: SkillResponse;
}

function detectCardType(result: SkillResponse): CardType | null {
  const { skillId, data } = result;

  // Explicit card type from skill response
  if (data.cardType) return data.cardType as CardType;

  // Infer from skill ID
  if (skillId === "tokenomics-review") return "score";
  if (skillId === "trust-score") return "trust-score";
  if (skillId === "pool-setup") return "pool-recommendation";
  if (skillId === "content-draft") return "content-drafts";
  if (skillId === "growth-playbook") return "growth-playbook";
  if (skillId === "intake") return "intake";
  if (skillId === "launch-sequence") return "launch-sequence";
  if (skillId === "crisis-response") return "crisis-response";
  if (skillId === "listing-ops") return "listing-ops";
  if (skillId === "readiness-gate") return "score";

  // Infer from data shape
  if ("overallScore" in data && "dimensions" in data) return "score";
  if ("recommendedPool" in data) return "pool-recommendation";
  if ("columns" in data && "rows" in data) return "data-table";
  if ("items" in data && Array.isArray(data.items)) return "checklist";

  return null;
}

function renderCard(result: SkillResponse) {
  const cardType = detectCardType(result);
  const data = result.data;

  switch (cardType) {
    case "score": {
      const typed = data as TokenomicsOutput;
      return (
        <ScoreCard
          score={typed.overallScore}
          dimensions={typed.dimensions}
          redFlags={typed.redFlags}
          verdict={
            typed.overallScore >= 80
              ? "Strong"
              : typed.overallScore >= 60
                ? "Moderate"
                : typed.overallScore >= 40
                  ? "Needs Work"
                  : "Critical"
          }
        />
      );
    }
    case "pool-recommendation":
      return (
        <PoolRecommendationCard data={data as PoolSetupOutput} />
      );
    case "data-table":
      return (
        <DataTableCard
          title={data.title as string | undefined}
          columns={
            data.columns as { key: string; label: string; align?: "left" | "center" | "right" }[]
          }
          rows={data.rows as Record<string, string | number>[]}
          highlightColumn={data.highlightColumn as string | undefined}
        />
      );
    case "checklist":
      return (
        <ChecklistCard
          title={data.title as string | undefined}
          items={
            data.items as {
              label: string;
              status: "done" | "in-progress" | "pending" | "blocked";
              detail?: string;
            }[]
          }
        />
      );
    case "content-drafts": {
      const typed = data as ContentDraftOutput;
      return (
        <div className="space-y-3">
          {typed.drafts.map((draft, i) => (
            <div key={i} className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-met-text-primary">{draft.title}</span>
                <span className="text-[10px] text-met-text-tertiary">{draft.platform} -- {draft.charCount} chars</span>
              </div>
              <pre className="text-xs text-met-text-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{draft.content}</pre>
              {draft.tips.length > 0 && (
                <div className="mt-2 pt-2 border-t border-met-stroke">
                  <span className="text-[10px] text-met-accent-400">Tips:</span>
                  <ul className="mt-1 space-y-0.5">
                    {draft.tips.map((tip, j) => (
                      <li key={j} className="text-[10px] text-met-text-tertiary">-- {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {typed.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {typed.hashtags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-[10px] text-met-primary-400 bg-met-primary-400/10 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      );
    }
    case "growth-playbook": {
      const typed = data as GrowthPlaybookOutput;
      return (
        <div className="space-y-3">
          <div className="text-xs text-met-text-tertiary">{typed.timeframe}</div>
          {typed.weeks.map((week) => (
            <div key={week.week} className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-met-accent-400">Week {week.week}</span>
                <span className="text-xs text-met-text-primary">{week.theme}</span>
              </div>
              <ul className="space-y-1">
                {week.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px]">
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${action.impact === "high" ? "bg-met-accent-400" : action.impact === "medium" ? "bg-met-warning" : "bg-met-text-tertiary"}`} />
                    <span className="text-met-text-secondary">{action.action}</span>
                    {action.budgetRequired && <span className="text-[9px] text-met-warning flex-shrink-0">$</span>}
                  </li>
                ))}
              </ul>
              {week.kpis.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-met-stroke flex flex-wrap gap-3">
                  {week.kpis.map((kpi, i) => (
                    <span key={i} className="text-[10px] text-met-text-tertiary">{kpi.metric}: <span className="text-met-text-secondary">{kpi.target}</span></span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {typed.risks.length > 0 && (
            <div className="p-3 rounded-lg bg-met-danger/5 border border-met-danger/20">
              <span className="text-[10px] font-medium text-met-danger">Risks</span>
              <ul className="mt-1 space-y-1">
                {typed.risks.map((risk, i) => (
                  <li key={i} className="text-[10px] text-met-text-tertiary">
                    <span className="text-met-text-secondary">{risk.risk}</span> -- {risk.mitigation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    case "trust-score": {
      const typed = data as TrustScoreOutput;
      return (
        <div className="space-y-4">
          <ScoreCard
            score={typed.overallScore}
            dimensions={typed.dimensions}
            redFlags={typed.redFlags}
            verdict={typed.verdict.replace(/-/g, " ").toUpperCase()}
            size="sm"
          />
          {typed.greenFlags.length > 0 && (
            <div className="border-t border-met-stroke pt-3">
              <span className="text-xs text-met-success font-medium block mb-2">Green Flags</span>
              <ul className="space-y-1">
                {typed.greenFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-met-text-secondary flex gap-2">
                    <span className="text-met-success shrink-0">+</span>{flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {typed.requiredActions.length > 0 && (
            <div className="border-t border-met-stroke pt-3">
              <span className="text-xs text-met-accent-400 font-medium block mb-2">Required Actions</span>
              <ul className="space-y-1">
                {typed.requiredActions.map((action, i) => (
                  <li key={i} className="text-xs text-met-text-secondary flex gap-2">
                    <span className="text-met-accent-400 shrink-0">&gt;</span>{action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
            <span className="text-[10px] text-met-text-tertiary">BD Comparison</span>
            <p className="text-xs text-met-text-secondary mt-1">{typed.bdComparison}</p>
          </div>
        </div>
      );
    }
    case "intake": {
      const typed = data as IntakeOutput;
      const ctx = typed.founderContext;
      const readiness = typed.readinessPreview;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Asset Type", `${typed.assetClassification.type} (${typed.assetClassification.confidence}%)`],
              ["Budget", `${ctx.budget} (${typed.budgetReality.totalBudget})`],
              ["Phase", readiness.phase.toUpperCase()],
              ["Time to Launch", readiness.estimatedTimeToLaunch],
              ["Community", `${ctx.existingCommunitySize} members`],
              ["Team", `${ctx.teamSize} ${ctx.isDoxxed ? "(doxxed)" : "(anon)"}`],
            ].map(([label, value]) => (
              <div key={label} className="p-2 rounded bg-met-base-dark border border-met-stroke">
                <span className="text-[10px] text-met-text-tertiary block">{label}</span>
                <span className="text-xs text-met-text-primary font-medium">{value}</span>
              </div>
            ))}
          </div>
          {typed.budgetReality.breakdown.length > 0 && (
            <div className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
              <span className="text-[10px] text-met-text-tertiary block mb-1.5">Budget Breakdown</span>
              {typed.budgetReality.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-met-text-secondary py-0.5">
                  <span>{item.category}</span>
                  <span className="text-met-text-primary">{item.amount}</span>
                </div>
              ))}
            </div>
          )}
          {readiness.blockers.length > 0 && (
            <div className="p-3 rounded-lg bg-met-danger/5 border border-met-danger/20">
              <span className="text-[10px] font-medium text-met-danger block mb-1">Blockers</span>
              <ul className="space-y-1">
                {readiness.blockers.map((b, i) => (
                  <li key={i} className="text-[11px] text-met-text-secondary flex gap-2">
                    <span className="text-met-danger shrink-0">!</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    case "launch-sequence": {
      const typed = data as LaunchSequenceOutput;
      const phases = [
        { label: "PRE-LAUNCH", items: typed.preLaunch, color: "text-met-primary-400" },
        { label: "LAUNCH", items: typed.launchMoment, color: "text-met-accent-400" },
        { label: "POST-LAUNCH", items: typed.postLaunch, color: "text-met-success" },
      ];
      return (
        <div className="space-y-3">
          {phases.map((phase) => (
            <div key={phase.label} className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
              <span className={`text-[10px] font-bold tracking-widest ${phase.color} block mb-2`}>{phase.label}</span>
              <div className="space-y-2">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[10px] text-met-text-tertiary w-14 shrink-0 font-mono">{item.time}</span>
                    <div className="flex-1">
                      <span className="text-xs text-met-text-primary block">{item.action}</span>
                      {item.template && (
                        <pre className="text-[10px] text-met-text-tertiary mt-1 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">{item.template}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
            <span className="text-[10px] font-bold tracking-widest text-met-warning block mb-2">CHECKLIST</span>
            <div className="space-y-1">
              {typed.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.critical ? "bg-met-danger" : "bg-met-text-tertiary"}`} />
                  <span className="text-met-text-secondary">{item.item}</span>
                  {item.critical && <span className="text-[9px] text-met-danger ml-auto">CRITICAL</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "crisis-response": {
      const typed = data as CrisisResponseOutput;
      return (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-met-danger/5 border border-met-danger/20">
            <span className="text-[10px] font-bold tracking-widest text-met-danger block mb-2">RESPONSE TIMELINE</span>
            <div className="space-y-1.5">
              {typed.responseTimeline.map((step, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-met-text-tertiary w-16 shrink-0 font-mono">{step.time}</span>
                  <span className="text-met-text-secondary flex-1">{step.action}</span>
                  <span className="text-[10px] text-met-text-tertiary">{step.channel}</span>
                </div>
              ))}
            </div>
          </div>
          {typed.draftResponses.map((draft, i) => (
            <div key={i} className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-met-text-primary capitalize">{draft.platform}</span>
                <span className="text-[10px] text-met-text-tertiary">{draft.tone}</span>
              </div>
              <pre className="text-[11px] text-met-text-secondary whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{draft.message}</pre>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-met-success/5 border border-met-success/20">
              <span className="text-[10px] font-medium text-met-success block mb-1">DO</span>
              <ul className="space-y-0.5">
                {typed.doList.map((item, i) => (
                  <li key={i} className="text-[10px] text-met-text-secondary">+ {item}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-met-danger/5 border border-met-danger/20">
              <span className="text-[10px] font-medium text-met-danger block mb-1">DON'T</span>
              <ul className="space-y-0.5">
                {typed.dontList.map((item, i) => (
                  <li key={i} className="text-[10px] text-met-text-secondary">- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
    case "listing-ops": {
      const typed = data as ListingOpsOutput;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-met-text-tertiary">Readiness: {typed.overallReadiness}%</span>
            <span className="text-xs text-met-text-tertiary">Total Cost: {typed.totalCost}</span>
          </div>
          {typed.platforms.filter(p => p.status !== "not-applicable").map((platform, i) => (
            <div key={i} className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-met-text-primary">{platform.platform}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-met-accent-400">{platform.cost}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    platform.status === "ready" ? "bg-met-success/10 text-met-success" :
                    "bg-met-warning/10 text-met-warning"
                  }`}>{platform.status === "ready" ? "Ready" : "Missing Reqs"}</span>
                </div>
              </div>
              <p className="text-[10px] text-met-text-tertiary mb-1.5">{platform.roi}</p>
              <div className="space-y-0.5">
                {platform.requirements.map((req, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-[10px]">
                    <span className={req.met ? "text-met-success" : "text-met-danger"}>{req.met ? "+" : "x"}</span>
                    <span className="text-met-text-secondary">{req.item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-met-base-dark border border-met-stroke">
            <span className="text-[10px] font-bold tracking-widest text-met-primary-400 block mb-1.5">SUBMISSION ORDER</span>
            {typed.submissionOrder.map((step, i) => (
              <div key={i} className="flex gap-2 text-[11px] py-0.5">
                <span className="text-met-accent-400 w-4 shrink-0">{step.step}.</span>
                <span className="text-met-text-primary">{step.platform}</span>
                <span className="text-met-text-tertiary ml-auto">{step.when}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return <FallbackCard data={data} title={result.skillId} />;
  }
}

export function SkillResultCard({ result }: SkillResultCardProps) {
  const skillName = SKILL_DESCRIPTIONS[result.skillId]?.name ?? result.skillId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card variant="elevated">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={result.status === "success" ? "success" : "warning"}
              size="sm"
            >
              {skillName}
            </Badge>
            <span className="text-xs text-met-text-tertiary">
              {new Date(result.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {renderCard(result)}
          {result.sources.length > 0 && (
            <div className="mt-3 pt-2 border-t border-met-stroke">
              <span className="text-[10px] text-met-text-tertiary">
                Sources: {result.sources.map((s) => s.name).join(", ")}
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
