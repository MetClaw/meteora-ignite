import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeCommunitySetup } from "@/lib/skills/community-setup";

export const POST = createSkillRoute(executeCommunitySetup, { compliance: true });
