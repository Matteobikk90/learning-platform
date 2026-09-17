import type { StaticImageData } from "next/image";

export type ResponsiveBackgroundImageProps = {
  desktopSrc: StaticImageData;
  mobileSrc: StaticImageData;
  className?: string;
  sizes?: string;
  priority?: boolean;
};
