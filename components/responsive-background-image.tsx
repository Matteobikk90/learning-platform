import { getImageProps, type StaticImageData } from "next/image";

type ResponsiveBackgroundImageProps = {
  desktopSrc: StaticImageData;
  mobileSrc: StaticImageData;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

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
    props: { srcSet: mobileSrcSet, ...mobileImageProps },
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
      />
      <source
        media="(max-width: 767px)"
        sizes={sizes}
        srcSet={mobileSrcSet}
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
