import { collectionHandlers } from "@/lib/crud";
import { serviceResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

export const { GET, POST } = collectionHandlers(serviceResource);
