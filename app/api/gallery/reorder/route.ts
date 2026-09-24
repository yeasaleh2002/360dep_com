import { reorderHandler } from "@/lib/crud";
import { galleryResource } from "@/lib/resources";


export const POST = reorderHandler(galleryResource);
