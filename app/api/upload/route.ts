import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import {
  IMAGE_PRESETS,
  ImageUploadError,
  MAX_UPLOAD_BYTES,
  uploadName,
  uploadToImgBB,
  validateUpload,
  type ImagePreset,
} from "@/lib/imgbb";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload  (admin only, multipart/form-data: file, preset)
 * The file arrives already resized + WebP-encoded by the browser; here it is verified
 * (real bytes, format, size, dimensions) and forwarded to ImgBB. Returns the ImgBB URL.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) {
    return jsonError(413, "This image is too large after optimising. Please try another photo.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "No file received.");
  }

  const file = form.get("file");
  const presetValue = String(form.get("preset") ?? "photo");
  const preset: ImagePreset = presetValue in IMAGE_PRESETS ? (presetValue as ImagePreset) : "photo";
  if (!(file instanceof File)) return jsonError(400, "No file received.");

  try {
    const { bytes, info } = await validateUpload(file);
    const url = await uploadToImgBB(bytes, info.mime, uploadName(preset));
    return NextResponse.json({ url, width: info.width, height: info.height, bytes: bytes.byteLength });
  } catch (error) {
    if (error instanceof ImageUploadError) return jsonError(error.status, error.message);
    console.error("[upload] failed", error);
    return jsonError(500, "Upload failed. Please try again.");
  }
}
