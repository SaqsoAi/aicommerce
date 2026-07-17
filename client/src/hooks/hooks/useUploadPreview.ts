"use client";

import { useEffect, useState } from "react";
import { resolveAssetUrl } from "@/utils/resolveAssetUrl";

export function useUploadPreview(file?: File | null, existingUrl?: string | null) {
  const [preview, setPreview] = useState(resolveAssetUrl(existingUrl));

  useEffect(() => {
    if (!file) {
      setPreview(resolveAssetUrl(existingUrl));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, existingUrl]);

  return preview;
}