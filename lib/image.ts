import type { Attachment } from "./types";

export interface PreparedImage extends Attachment {
  /** data: URL for showing a thumbnail in the chat */
  preview: string;
}

/**
 * Downscale + re-encode a picked photo before sending it to the model.
 * Keeps payloads small (phone cameras are 4000px+) and strips EXIF.
 */
export async function prepareImage(
  file: File,
  maxDim = 1152,
  quality = 0.82
): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return {
    mime: "image/jpeg",
    data: dataUrl.slice(dataUrl.indexOf(",") + 1),
    preview: dataUrl,
  };
}
