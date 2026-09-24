"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { formatBytes, uploadImage, type UploadPreset } from "@/components/admin/api-client";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

type Pending = { key: string; name: string; progress: number };

function useUploader(preset: UploadPreset) {
  const toast = useToast();
  const [pending, setPending] = useState<Pending[]>([]);

  async function run(files: File[], onUploaded: (url: string) => void) {
    for (const file of files) {
      if (!ACCEPT.split(",").includes(file.type)) {
        toast.error(`"${file.name}" isn't a supported image. Use JPG, PNG, WebP, AVIF or GIF.`);
        continue;
      }
      if (file.size > MAX_SOURCE_BYTES) {
        toast.error(`"${file.name}" is larger than 25 MB. Please choose a smaller photo.`);
        continue;
      }
      const key = `${file.name}-${Date.now()}-${Math.random()}`;
      setPending((p) => [...p, { key, name: file.name, progress: 0 }]);
      try {
        const result = await uploadImage(file, preset, (progress) =>
          setPending((p) => p.map((x) => (x.key === key ? { ...x, progress } : x))),
        );
        onUploaded(result.url);
        toast.success(`Uploaded — optimised from ${formatBytes(result.originalBytes)} to ${formatBytes(result.optimizedBytes)}.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setPending((p) => p.filter((x) => x.key !== key));
      }
    }
  }

  return { pending, run };
}

function ProgressTile({ item, className }: { item: Pending; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/60 bg-surface-2 p-3 text-center", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-gold" />
      <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-line">
        <div className="h-full bg-gold transition-all" style={{ width: `${item.progress}%` }} />
      </div>
      <span className="text-xs text-muted">{item.progress < 10 ? "Optimising…" : item.progress < 100 ? "Uploading…" : "Done"}</span>
    </div>
  );
}

/** Single image field (banner, service photo, team photo, client logo). */
export function SingleImageUpload({
  value,
  onChange,
  preset = "photo",
  aspect = "aspect-[16/9]",
  fit = "cover",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  preset?: UploadPreset;
  aspect?: string;
  fit?: "cover" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { pending, run } = useUploader(preset);
  const busy = pending.length > 0;

  const pick = (files: FileList | null) => files?.[0] && run([files[0]], (url) => onChange(url));

  if (busy) return <ProgressTile item={pending[0]} className={cn("w-full", aspect)} />;

  return (
    <div>
      {value ? (
        <div className={cn("group relative w-full overflow-hidden rounded-xl border border-line bg-surface-2", aspect)}>
          <Image src={value} alt="" fill sizes="600px" className={fit === "contain" ? "object-contain p-4" : "object-cover"} />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="admin-btn-overlay">
              <ImagePlus className="h-4 w-4" /> Replace
            </button>
            <button type="button" onClick={() => onChange(null)} className="admin-btn-overlay">
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pick(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition",
            dragOver ? "border-gold bg-gold/5" : "border-line hover:border-gold/60 hover:bg-surface-2",
            aspect,
          )}
        >
          <UploadCloud className="h-8 w-8 text-gold" strokeWidth={1.5} />
          <span className="text-sm font-medium text-ink">Click to choose a photo, or drag it here</span>
          <span className="text-xs text-muted">JPG, PNG or WebP. We optimise it automatically.</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => (pick(e.target.files), (e.target.value = ""))} />
    </div>
  );
}

/** Multiple images with reordering; the first image is the cover. */
export function MultiImageUpload({
  value,
  onChange,
  preset = "photo",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  preset?: UploadPreset;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { pending, run } = useUploader(preset);
  // Keep a live reference so sequential uploads append to the latest list.
  const latest = useRef(value);
  latest.current = value;

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    run(Array.from(files), (url) => {
      latest.current = [...latest.current, url];
      onChange(latest.current);
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        add(e.dataTransfer.files);
      }}
      className={cn("rounded-xl transition", dragOver && "ring-2 ring-gold ring-offset-4 ring-offset-surface")}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, i) => (
          <div key={url + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface-2">
            <Image src={url} alt="" fill sizes="220px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                <Star className="h-3 w-3 fill-current" /> Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move left" className="admin-icon-overlay">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Move right" className="admin-icon-overlay">
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove photo" className="admin-icon-overlay hover:!bg-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {pending.map((item) => (
          <ProgressTile key={item.key} item={item} className="aspect-[4/3]" />
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line text-center transition hover:border-gold/60 hover:bg-surface-2"
        >
          <ImagePlus className="h-6 w-6 text-gold" strokeWidth={1.5} />
          <span className="px-2 text-xs font-medium text-ink">Add photos</span>
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">You can select several photos at once, or drag them here. The first photo is used as the cover.</p>
      <input ref={inputRef} type="file" accept={ACCEPT} multiple className="sr-only" onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
    </div>
  );
}
