"use client";

import { resolveAssetUrl, assetPlaceholder } from "@/utils/resolveAssetUrl";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallbackSrc?: string;
};

export default function AssetImage({
  src,
  fallbackSrc = assetPlaceholder,
  alt = "",
  className = "",
  onError,
  ...props
}: Props) {
  const finalSrc = resolveAssetUrl(src) || fallbackSrc;

  return (
    <img
      {...props}
      src={finalSrc}
      alt={alt}
      loading={props.loading || "lazy"}
      className={className}
      onError={(event) => {
        const img = event.currentTarget;
        if (fallbackSrc && !img.src.endsWith(fallbackSrc)) {
          img.src = fallbackSrc;
        }
        onError?.(event);
      }}
    />
  );
}