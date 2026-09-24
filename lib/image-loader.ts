// Resizes remote images through wsrv.nl (free) since Next's image optimiser doesn't run on Workers.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (!/^https:\/\//.test(src)) return src;
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 78),
    output: "webp",
    we: "", // "without enlargement" — never upscale small originals
  });
  return `https://wsrv.nl/?${params}`;
}
