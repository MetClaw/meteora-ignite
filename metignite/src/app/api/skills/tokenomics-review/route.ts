import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeTokenomicsReview } from "@/lib/skills/tokenomics-review";

export const POST = createSkillRoute(executeTokenomicsReview, { compliance: true });
