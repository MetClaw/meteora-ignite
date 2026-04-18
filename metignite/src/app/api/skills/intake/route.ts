import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeIntake } from "@/lib/skills/intake";

export const POST = createSkillRoute(executeIntake);
