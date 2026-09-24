import { itemHandlers } from "@/lib/crud";
import { clientResource } from "@/lib/resources";


export const { PUT, PATCH, DELETE } = itemHandlers(clientResource);
