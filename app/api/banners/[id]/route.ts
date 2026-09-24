import { itemHandlers } from "@/lib/crud";
import { bannerResource } from "@/lib/resources";


export const { PUT, PATCH, DELETE } = itemHandlers(bannerResource);
