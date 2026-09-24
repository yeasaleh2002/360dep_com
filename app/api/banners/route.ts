import { collectionHandlers } from "@/lib/crud";
import { bannerResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

export const { GET, POST } = collectionHandlers(bannerResource);
