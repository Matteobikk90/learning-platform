import { getImageProps } from "next/image";

import type { ResponsiveBackgroundImageProps } from "@/types/image";

export function ResponsiveBackgroundImage({
  desktopSrc,
  mobileSrc,
  className,
  sizes = "100vw",
  priority = false,
}: ResponsiveBackgroundImageProps) {
  const common = {
    alt: "",
    sizes,
    quality: 75,
  } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: desktopSrc,
  });
  const {
    props: mobileImageProps,
  } = getImageProps({
    ...common,
    src: mobileSrc,
  });

  return (
    <picture>
      <source
        media="(min-width: 768px)"
        sizes={sizes}
        srcSet={desktopSrcSet}
        width={desktopSrc.width}
        height={desktopSrc.height}
      />
      <img
        {...mobileImageProps}
        alt=""
        className={className}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
      />
    </picture>
  );
}
