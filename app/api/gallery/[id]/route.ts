import { itemHandlers } from "@/lib/crud";
import { galleryResource } from "@/lib/resources";


export const { PUT, PATCH, DELETE } = itemHandlers(galleryResource);
