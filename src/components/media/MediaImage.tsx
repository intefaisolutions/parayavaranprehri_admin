import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/apiConfig";
import { isS3MediaUrl, permanentMediaUrl } from "../../utils/mediaUrl";

type MediaImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  src?: string | null;
  /** Called when permanent + signed both fail. */
  onBroken?: () => void;
};

/**
 * Renders S3 (or other) media for <img>.
 * Prefers permanent object URL; if the bucket is private, falls back once
 * to a freshly signed GET URL from the API.
 */
export function MediaImage({ src, alt = "", onBroken, ...rest }: MediaImageProps) {
  const [displaySrc, setDisplaySrc] = useState(() =>
    src && isS3MediaUrl(src) ? permanentMediaUrl(src) : src || "",
  );
  const [triedSigned, setTriedSigned] = useState(false);

  useEffect(() => {
    setTriedSigned(false);
    if (!src) {
      setDisplaySrc("");
      return;
    }
    setDisplaySrc(isS3MediaUrl(src) ? permanentMediaUrl(src) : src);
  }, [src]);

  if (!displaySrc) return null;

  return (
    <img
      {...rest}
      src={displaySrc}
      alt={alt}
      referrerPolicy={rest.referrerPolicy ?? "no-referrer"}
      onError={() => {
        if (!src || triedSigned || !isS3MediaUrl(src)) {
          onBroken?.();
          return;
        }
        setTriedSigned(true);
        const permanent = permanentMediaUrl(src);
        void apiFetch<{ signedUrl: string }>(
          `/api/v1/uploads/signed?url=${encodeURIComponent(permanent)}`,
        )
          .then((data) => {
            if (data?.signedUrl) {
              setDisplaySrc(data.signedUrl);
            } else {
              onBroken?.();
            }
          })
          .catch(() => onBroken?.());
      }}
    />
  );
}
