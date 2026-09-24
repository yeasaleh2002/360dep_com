"use client";

import { IMAGE_PRESETS, type ImagePreset } from "@/lib/image-presets";

export async function adminFetch<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "same-origin",
  });

  if (res.status === 401) {
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error("Your session has expired. Please sign in again.");
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data;
}

export type UploadPreset = ImagePreset;
export type UploadResult = { url: string; originalBytes: number; optimizedBytes: number };

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

// Resize + WebP-encode in the browser. Falls back to JPEG (PNG for logos) where WebP encoding isn't supported.
export async function optimizeInBrowser(file: File, preset: ImagePreset): Promise<File> {
  const { maxEdge, quality } = IMAGE_PRESETS[preset];

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`"${file.name}" couldn't be opened as a photo. Please use a JPG, PNG or WebP image.`);
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this photo. Please try another browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp") {
    blob = preset === "logo" ? await canvasToBlob(canvas, "image/png", 1) : await canvasToBlob(canvas, "image/jpeg", 0.86);
  }
  if (!blob) throw new Error("Your browser couldn't process this photo. Please try another browser.");

  return new File([blob], `upload.${blob.type.split("/")[1]}`, { type: blob.type });
}

export async function uploadImage(file: File, preset: UploadPreset, onProgress?: (pct: number) => void): Promise<UploadResult> {
  onProgress?.(5);
  const prepared = await optimizeInBrowser(file, preset);
  const body = new FormData();
  body.append("file", prepared);
  body.append("preset", preset);

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(10 + Math.round((e.loaded / e.total) * 80));
    xhr.onload = () => {
      let data: { url?: string; error?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error page */
      }
      if (xhr.status === 401) {
        window.location.href = "/admin/login";
        return reject(new Error("Your session has expired."));
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) {
        onProgress?.(100);
        resolve({ url: data.url, originalBytes: file.size, optimizedBytes: prepared.size });
      } else {
        reject(new Error(data?.error ?? "Upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("Network problem — check your connection and try again."));
    xhr.send(body);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
