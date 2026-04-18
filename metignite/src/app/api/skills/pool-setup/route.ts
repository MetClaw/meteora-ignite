import { createSkillRoute } from "@/lib/skill-route-handler";
import { executePoolSetup } from "@/lib/skills/pool-setup";

export const POST = createSkillRoute(executePoolSetup, { compliance: true });
