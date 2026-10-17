import { useState } from "react";

interface StickerImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function StickerImage({
  src,
  alt,
  className,
}: StickerImageProps) {
  const [hasError, setHasError] =
    useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded bg-slate-100 text-xs text-slate-400 ${className ?? ""}`}
        aria-label={
          alt || "Sticker unavailable"
        }
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() =>
        setHasError(true)
      }
    />
  );
}