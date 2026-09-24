import { reorderHandler } from "@/lib/crud";
import { teamResource } from "@/lib/resources";


export const POST = reorderHandler(teamResource);
