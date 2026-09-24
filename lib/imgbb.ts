// Photos are resized in the browser; the server re-checks the real bytes before uploading to ImgBB.

import { IMAGE_PRESETS, type ImagePreset } from "@/lib/image-presets";

export { IMAGE_PRESETS, type ImagePreset };

/** Formats the browser encoder can produce (WebP normally; JPEG/PNG on very old browsers). */
export const ALLOWED_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"] as const;
export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

/** A 1920px WebP is typically 150–600 KB; 3 MB leaves plenty of headroom. */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
/** Small tolerance over the largest preset edge. */
const MAX_EDGE_PX = 2048;

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

type Sniffed = { mime: AllowedMime; width: number; height: number };

/** Identifies the format from magic bytes and reads the pixel size from the header. */
export function sniffImage(bytes: Uint8Array): Sniffed | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start: number, len: number) => String.fromCharCode(...bytes.subarray(start, start + len));

  // PNG: 89 50 4E 47 … IHDR width/height at 16/20 (big-endian)
  if (bytes.length > 24 && bytes[0] === 0x89 && ascii(1, 3) === "PNG") {
    return { mime: "image/png", width: view.getUint32(16), height: view.getUint32(20) };
  }

  // WebP: "RIFF" … "WEBP" + VP8 / VP8L / VP8X chunk
  if (bytes.length > 30 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const chunk = ascii(12, 4);
    if (chunk === "VP8 ") return { mime: "image/webp", width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    if (chunk === "VP8L") {
      const b = view.getUint32(21, true);
      return { mime: "image/webp", width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") {
      const w = bytes[24] | (bytes[25] << 8) | (bytes[26] << 16);
      const h = bytes[27] | (bytes[28] << 8) | (bytes[29] << 16);
      return { mime: "image/webp", width: w + 1, height: h + 1 };
    }
    return null;
  }

  // JPEG: FF D8, then walk segments to the first SOFn marker
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) return null;
      const marker = bytes[offset + 1];
      const length = view.getUint16(offset + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) return { mime: "image/jpeg", height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
      offset += 2 + length;
    }
    return null;
  }

  return null;
}

export async function validateUpload(file: File): Promise<{ bytes: Uint8Array<ArrayBuffer>; info: Sniffed }> {
  if (file.size === 0) throw new ImageUploadError("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageUploadError("This image is too large after optimising. Please try another photo.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = sniffImage(bytes);
  if (!info) throw new ImageUploadError("This file is not a supported image. Please use a JPG, PNG or WebP photo.", 415);
  if (!info.width || !info.height) throw new ImageUploadError("This image looks damaged. Please try another photo.");
  if (info.width > MAX_EDGE_PX || info.height > MAX_EDGE_PX) {
    throw new ImageUploadError("This image wasn't resized. Please refresh the page and upload it again.");
  }
  return { bytes, info };
}

type ImgBBResponse = { success?: boolean; data?: { url: string }; error?: { message?: string } };

/** Uploads bytes to ImgBB (sent as a binary file — no base64 overhead) and returns the direct URL. */
export async function uploadToImgBB(bytes: Uint8Array<ArrayBuffer>, mime: AllowedMime, name: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new ImageUploadError("Image hosting is not configured (IMGBB_API_KEY).", 500);

  const ext = mime.split("/")[1];
  const form = new FormData();
  form.append("image", new Blob([bytes], { type: mime }), `${name}.${ext}`);
  form.append("name", name);

  let res: Response;
  try {
    res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new ImageUploadError("Could not reach the image host. Please try again.", 502);
  }

  const json = (await res.json().catch(() => ({}))) as ImgBBResponse;
  if (!res.ok || !json.success || !json.data?.url) {
    console.error("[imgbb] upload failed", res.status, json.error?.message);
    throw new ImageUploadError("The image host rejected the upload. Please try again.", 502);
  }
  return json.data.url;
}

export function uploadName(preset: ImagePreset) {
  return `360dep-${preset}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
