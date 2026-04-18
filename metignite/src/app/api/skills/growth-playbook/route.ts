import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeGrowthPlaybook } from "@/lib/skills/growth-playbook";

export const POST = createSkillRoute(executeGrowthPlaybook, { compliance: true });
