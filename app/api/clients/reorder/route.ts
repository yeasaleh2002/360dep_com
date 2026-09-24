import { reorderHandler } from "@/lib/crud";
import { clientResource } from "@/lib/resources";


export const POST = reorderHandler(clientResource);
