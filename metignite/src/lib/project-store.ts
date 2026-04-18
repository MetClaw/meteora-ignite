import type { FounderContext, SkillResponse, LaunchPhase } from "./skills/types";
import { PHASE_ORDER, getPhaseSkills } from "./skills/types";

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  context: FounderContext;
  skillResults: Record<string, SkillResponse>;
  currentPhase: LaunchPhase;
}

const STORAGE_KEY = "metignite_project";

// ------ Cloud sync (fire-and-forget) ------

function syncToCloud(project: Project): void {
  fetch("/api/project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  }).catch(() => {
    // Silent fail -- localStorage is the source of truth for now
  });
}

// ------ Local persistence ------

// Read
export function getProject(): Project | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

// Write
export function saveProject(project: Project): void {
  if (typeof window === "undefined") return;
  project.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  syncToCloud(project);
}

// Create from intake
export function createProject(context: FounderContext): Project {
  const project: Project = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    context,
    skillResults: {},
    currentPhase: "qualify",
  };
  saveProject(project);
  return project;
}

// Save a skill result and update phase
export function saveSkillResult(skillId: string, result: SkillResponse): Project | null {
  const project = getProject();
  if (!project) return null;

  project.skillResults[skillId] = result;
  project.context.completedSkills = project.skillResults;
  project.currentPhase = computeCurrentPhase(project);
  saveProject(project);
  return project;
}

// Delete project (reset)
export function resetProject(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Compute which phase the founder is in based on completed skills
function computeCurrentPhase(project: Project): LaunchPhase {
  const completed = new Set(Object.keys(project.skillResults));
  const phaseSkills = getPhaseSkills(project.context.launchMode ?? "custom");

  for (const phase of PHASE_ORDER) {
    const skills = phaseSkills[phase];
    const phaseComplete = skills.every((s) => completed.has(s));
    if (!phaseComplete) return phase;
  }

  return "sustain"; // all done
}

// Get completion stats
export function getPhaseStats(project: Project) {
  const completed = new Set(Object.keys(project.skillResults));
  const phaseSkills = getPhaseSkills(project.context.launchMode ?? "custom");

  return PHASE_ORDER.map((phase) => {
    const skills = phaseSkills[phase];
    const done = skills.filter((s) => completed.has(s)).length;
    return {
      phase,
      total: skills.length,
      done,
      percent: Math.round((done / skills.length) * 100),
      complete: done === skills.length,
    };
  });
}

// Overall readiness score (0-100)
export function getReadinessScore(project: Project): number {
  const phaseSkills = getPhaseSkills(project.context.launchMode ?? "custom");
  const allSkills = PHASE_ORDER.flatMap((p) => phaseSkills[p]);
  const completed = Object.keys(project.skillResults).length;
  return Math.round((completed / allSkills.length) * 100);
}

