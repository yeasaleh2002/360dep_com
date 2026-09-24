import { itemHandlers } from "@/lib/crud";
import { serviceResource } from "@/lib/resources";


export const { PUT, PATCH, DELETE } = itemHandlers(serviceResource);
