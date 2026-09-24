"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { getYouTubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";

/**
 * "Lite" YouTube embed: a thumbnail until clicked, so no YouTube JS loads on page view.
 * Uses youtube-nocookie.com with rel=0 so suggestions stay within the same channel.
 */
export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const { t } = useLocale();
  const [playing, setPlaying] = useState(false);
  const id = getYouTubeId(url);
  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-night">
      {playing ? (
        <iframe
          src={youtubeEmbedUrl(id)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`${t("gallery.playVideo")}: ${title}`}
        >
          <Image src={youtubeThumbnail(id)} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-90 transition group-hover:opacity-100" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-night shadow-lift transition group-hover:scale-110">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
