import { reorderHandler } from "@/lib/crud";
import { bannerResource } from "@/lib/resources";


export const POST = reorderHandler(bannerResource);
