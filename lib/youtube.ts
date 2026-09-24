const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extracts the 11-character video id from any common YouTube URL shape. */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
    let id: string | null = null;
    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const match = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
        id = match?.[2] ?? null;
      }
    }
    return id && YT_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Privacy-enhanced embed with related videos limited to the same channel. */
export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1", autoplay: "1" });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
