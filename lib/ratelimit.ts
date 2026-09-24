import { getCloudflareContext } from "@opennextjs/cloudflare";

type Limiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

// Must match the `ratelimits` bindings in wrangler.jsonc.
const LIMITS = {
  LOGIN_LIMITER: { limit: 5, periodMs: 60_000 },
  CONTACT_LIMITER: { limit: 3, periodMs: 60_000 },
} as const;

export type LimiterName = keyof typeof LIMITS;

function cloudflareLimiter(name: LimiterName): Limiter | undefined {
  try {
    return (getCloudflareContext().env as unknown as Record<string, Limiter | undefined>)[name];
  } catch {
    return undefined; // not running on Cloudflare (next dev / next start)
  }
}

// Local fallback so rate limiting also works under `next dev` / `next start`.
const memory = new Map<string, number[]>();

function memoryLimit(name: LimiterName, key: string): boolean {
  const { limit, periodMs } = LIMITS[name];
  const now = Date.now();
  const id = `${name}:${key}`;
  const hits = (memory.get(id) ?? []).filter((t) => now - t < periodMs);
  if (hits.length >= limit) return false;
  hits.push(now);
  memory.set(id, hits);
  return true;
}

/** Returns true if the request is allowed. On Cloudflare this uses the built-in Rate Limiting binding. */
export async function rateLimit(name: LimiterName, key: string): Promise<boolean> {
  const limiter = cloudflareLimiter(name);
  if (limiter) return (await limiter.limit({ key })).success;
  return memoryLimit(name, key);
}
