import type {
  ReadinessGateInput,
  ReadinessGateOutput,
  SkillResponse,
  FounderContext,
  SkillParams,
} from "./types";
import { READINESS_DIMENSIONS, makeSource, buildSkillResponse } from "./types";

function scoreDimension(
  dimensionSkills: readonly string[],
  completedSkills: Record<string, { status: string }>
): { score: number; status: "complete" | "partial" | "missing" } {
  const total = dimensionSkills.length;
  if (total === 0) return { score: 0, status: "missing" };

  let completed = 0;
  let hasPartial = false;

  for (const skillId of dimensionSkills) {
    const result = completedSkills[skillId];
    if (!result) continue;

    if (result.status === "success") {
      completed++;
    } else if (result.status === "partial") {
      completed++;
      hasPartial = true;
    }
  }

  if (completed === 0) {
    return { score: 0, status: "missing" };
  }

  if (completed === total && !hasPartial) {
    return { score: 100, status: "complete" };
  }

  // Some completed but not all, or has partial status
  let score = (completed / total) * 70;
  if (hasPartial) {
    score = score * 0.7;
  }

  return {
    score: Math.round(score * 100) / 100,
    status: "partial",
  };
}

function getVerdict(
  overall: number
): ReadinessGateOutput["verdict"] {
  if (overall >= 90) return "strong";
  if (overall >= 75) return "ready";
  if (overall >= 60) return "almost";
  if (overall >= 40) return "not-ready";
  return "blocked";
}

function getLaunchRisk(
  overall: number
): ReadinessGateOutput["launchRisk"] {
  if (overall >= 85) return "low";
  if (overall >= 70) return "medium";
  if (overall >= 50) return "high";
  return "critical";
}

export async function executeReadinessGate(
  input: SkillParams,
  context?: FounderContext
): Promise<SkillResponse> {
  const params = input as ReadinessGateInput;
  const { completedSkills, founderContext, trustScore } = params;
  const effectiveTrustScore = trustScore ?? founderContext.trustScore ?? 0;

  // Score each dimension
  const dimensions: ReadinessGateOutput["dimensions"] = [];

  for (const dim of READINESS_DIMENSIONS) {
    const { score, status } = scoreDimension(dim.skills, completedSkills as Record<string, { status: string }>);
    dimensions.push({
      name: dim.name,
      score,
      weight: dim.weight,
      source: dim.skills.join(", "),
      status,
    });
  }

  // Calculate weighted overall readiness
  let overallReadiness = dimensions.reduce(
    (sum, dim) => sum + dim.score * dim.weight,
    0
  );

  // Trust score bonus/penalty
  if (effectiveTrustScore > 80) {
    overallReadiness += 5;
  } else if (effectiveTrustScore < 50) {
    overallReadiness -= 10;
  }

  overallReadiness = Math.max(0, Math.min(100, Math.round(overallReadiness * 100) / 100));

  // Identify blockers -- anything with score < 50 and weight > 0.15 is critical
  const blockers: ReadinessGateOutput["blockers"] = [];

  for (const dim of dimensions) {
    if (dim.score < 50) {
      const severity: "critical" | "high" | "medium" =
        dim.weight > 0.15 ? "critical" : dim.weight > 0.1 ? "high" : "medium";

      let fix: string;
      switch (dim.status) {
        case "missing":
          fix = `Run the following skills to complete this dimension: ${dim.source}`;
          break;
        case "partial":
          fix = `Some skills in this dimension need attention: ${dim.source}. Re-run or complete remaining items.`;
          break;
        default:
          fix = `Review and improve: ${dim.source}`;
      }

      blockers.push({ item: dim.name, severity, fix });
    }
  }

  const hasCriticalBlockers = blockers.some((b) => b.severity === "critical");
  const verdict = getVerdict(overallReadiness);
  const canLaunch = overallReadiness >= 70 && !hasCriticalBlockers;
  const launchRisk = getLaunchRisk(overallReadiness);

  const output: ReadinessGateOutput = {
    overallReadiness,
    verdict,
    dimensions,
    blockers,
    canLaunch,
    launchRisk,
  };

  const sources = [makeSource("MetIgnite Readiness Gate", "internal://skills/readiness-gate")];

  const verdictLabels: Record<ReadinessGateOutput["verdict"], string> = {
    blocked: "Blocked",
    "not-ready": "Not Ready",
    almost: "Almost Ready",
    ready: "Ready",
    strong: "Strong",
  };

  const summary =
    `Readiness Score: ${overallReadiness}/100 -- Verdict: ${verdictLabels[verdict]}. ` +
    `${canLaunch ? "Clear to launch." : "Not clear to launch."} ` +
    `${blockers.length} blocker${blockers.length !== 1 ? "s" : ""} identified. ` +
    `Launch risk: ${launchRisk}.`;

  const nextSteps: string[] = [];

  if (canLaunch) {
    nextSteps.push("Proceed to launch-sequence -- you are clear to launch.");
    if (blockers.length > 0) {
      nextSteps.push(
        "Optional improvements: " +
          blockers.map((b) => b.item).join(", ") +
          " could still be strengthened."
      );
    }
  } else {
    if (hasCriticalBlockers) {
      const criticals = blockers
        .filter((b) => b.severity === "critical")
        .map((b) => `${b.item}: ${b.fix}`);
      nextSteps.push("Critical blockers must be resolved first:");
      nextSteps.push(...criticals);
    }

    const incomplete = dimensions
      .filter((d) => d.status === "missing")
      .map((d) => d.source);
    if (incomplete.length > 0) {
      nextSteps.push(`Run missing skills: ${incomplete.join(", ")}`);
    }

    const partial = dimensions
      .filter((d) => d.status === "partial" && d.score < 50)
      .map((d) => d.source);
    if (partial.length > 0) {
      nextSteps.push(`Improve partial scores: ${partial.join(", ")}`);
    }
  }

  return buildSkillResponse("readiness-gate", {
    status: canLaunch ? "success" : "partial",
    data: output,
    summary,
    nextSteps,
    sources,
  });
}
