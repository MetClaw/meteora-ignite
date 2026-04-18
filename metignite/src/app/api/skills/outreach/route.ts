import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeOutreach } from "@/lib/skills/outreach";

export const POST = createSkillRoute(executeOutreach, { compliance: true });
