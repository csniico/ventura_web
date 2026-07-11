"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/api/message";
import { useUploadFile } from "@/features/files/hooks";
import type { UploadFolder, UploadedFile } from "@/features/files/api";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

interface ImageUploadProps {
  value?: string | null;
  folder: UploadFolder;
  shape?: "circle" | "square";
  onUploaded: (file: UploadedFile) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  folder,
  shape = "square",
  onUploaded,
  onRemove,
  label = "Upload image",
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFile();

  const pick = () => inputRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > MAX_BYTES) return toast.error("Image must be under 5 MB.");

    upload.mutate(
      { file, folder },
      {
        onSuccess: onUploaded,
        onError: (err) => toast.error(errorMessage(err, "Upload failed.")),
      },
    );
  };

  const rounded = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const size = shape === "circle" ? "size-24" : "size-32";

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={pick}
        disabled={upload.isPending}
        className={cn(
          "group relative grid shrink-0 place-items-center overflow-hidden border border-zinc-200 bg-zinc-50 transition-colors hover:border-primary-300",
          rounded,
          size,
        )}
        aria-label={label}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="128px" unoptimized className="object-cover" />
        ) : (
          <ImageIcon className="size-7 text-zinc-300" />
        )}
        <span
          className={cn(
            "absolute inset-0 grid place-items-center bg-zinc-900/40 text-white opacity-0 transition-opacity group-hover:opacity-100",
            upload.isPending && "opacity-100",
          )}
        >
          {upload.isPending ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
      </button>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={pick}
          disabled={upload.isPending}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-60"
        >
          {value ? "Change" : label}
        </button>
        {value && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-red-600"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        )}
        <p className="text-xs text-zinc-400">PNG or JPG, up to 5 MB.</p>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
