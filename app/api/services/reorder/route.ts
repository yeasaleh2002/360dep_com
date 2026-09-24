import { reorderHandler } from "@/lib/crud";
import { serviceResource } from "@/lib/resources";


export const POST = reorderHandler(serviceResource);
