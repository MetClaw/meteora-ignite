import { createSkillRoute } from "@/lib/skill-route-handler";
import { executeListingOps } from "@/lib/skills/listing-ops";

export const POST = createSkillRoute(executeListingOps);
