"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadFile, type UploadFolder, type UploadedFile } from "./api";

/** Uploads a single file to storage and returns { fileKey, fileUrl }. */
export function useUploadFile() {
  return useMutation<UploadedFile, unknown, { file: File; folder: UploadFolder }>({
    mutationFn: ({ file, folder }) => uploadFile(file, folder),
  });
}
