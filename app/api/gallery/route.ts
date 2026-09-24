import { collectionHandlers } from "@/lib/crud";
import { galleryResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

export const { GET, POST } = collectionHandlers(galleryResource);
