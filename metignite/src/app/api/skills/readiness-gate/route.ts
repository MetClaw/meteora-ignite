import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeReadinessGate } from "@/lib/skills/readiness-gate";

export const POST = createSkillRoute(executeReadinessGate);
