import { collectionHandlers } from "@/lib/crud";
import { clientResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

export const { GET, POST } = collectionHandlers(clientResource);
