import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

/**
 * File uploads use presigned S3, mirroring the mobile reference:
 *  1. ask the backend for a presigned PUT URL (POST /files/presign)
 *  2. PUT the raw bytes straight to storage (no auth header — S3 rejects extras)
 *  3. persist the returned { fileKey, fileUrl } on the owning entity
 */

const presignSchema = z.object({
  fileKey: z.string(),
  fileUrl: z.string(),
  uploadUrl: z.string(),
});

export interface UploadedFile {
  fileKey: string;
  fileUrl: string;
}

export type UploadFolder = "avatars" | "logos" | "products";

async function presign(file: File, folder: UploadFolder) {
  return presignSchema.parse(
    await apiFetch("/files/presign", {
      method: "POST",
      body: { filename: file.name, contentType: file.type, folder },
    }),
  );
}

/** Presign, upload the bytes to storage, and return the stored key + URL. */
export async function uploadFile(file: File, folder: UploadFolder): Promise<UploadedFile> {
  const { uploadUrl, fileKey, fileUrl } = await presign(file, folder);

  // Bare fetch to the absolute S3 URL — no Authorization header.
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  }).catch(() => {
    throw new ApiError("network", "Upload failed. Check your connection.");
  });

  if (!res.ok) throw new ApiError("server", "Upload failed. Please try again.", res.status);
  return { fileKey, fileUrl };
}

export async function deleteFile(fileKey: string): Promise<void> {
  await apiFetch("/files", { method: "DELETE", body: { fileKey } });
}
