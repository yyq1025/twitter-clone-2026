"use client";

import { type ChangeEvent, useCallback, useRef, useState } from "react";

export type SelectedMedia = { file: File; previewUrl: string };

type UsePostMediaOptions = {
  maxFiles?: number;
  maxFileSizeBytes?: number;
};

const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function usePostMedia({
  maxFiles = 4,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
}: UsePostMediaOptions = {}) {
  const [mediaFiles, setMediaFiles] = useState<SelectedMedia[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      setMediaError(null);
      return;
    }

    for (const file of files) {
      const isSupportedType = file.type.startsWith("image/");
      if (!isSupportedType) {
        setMediaError("Only images are supported.");
        event.target.value = "";
        return;
      }
      if (file.size > maxFileSizeBytes) {
        setMediaError("Each file must be smaller than 30MB.");
        event.target.value = "";
        return;
      }
    }

    let exceededLimit = false;
    setMediaFiles((prev) => {
      if (prev.length + files.length > maxFiles) {
        exceededLimit = true;
        return prev;
      }
      return [
        ...prev,
        ...files.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
    });

    setMediaError(
      exceededLimit ? `You can upload up to ${maxFiles} media files.` : null,
    );
    event.target.value = "";
  };

  const handleRemoveMedia = useCallback((previewUrl: string) => {
    setMediaFiles((prev) => {
      const toRemove = prev.find((item) => item.previewUrl === previewUrl);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.previewUrl);
      }
      return prev.filter((item) => item.previewUrl !== previewUrl);
    });
  }, []);

  const cleanupMedia = useCallback(() => {
    setMediaFiles((prev) => {
      prev.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
      return [];
    });
    setMediaError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    mediaFiles,
    mediaError,
    fileInputRef,
    handleMediaChange,
    handleRemoveMedia,
    cleanupMedia,
  };
}
