import { itemHandlers } from "@/lib/crud";
import { teamResource } from "@/lib/resources";


export const { PUT, PATCH, DELETE } = itemHandlers(teamResource);
