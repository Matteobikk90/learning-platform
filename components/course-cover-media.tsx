import Image from "next/image";

import { CourseCoverPlaceholder } from "@/components/course-cover-placeholder";
import { cn } from "@/lib/cn";
import type { CourseCoverMediaProps } from "@/types/course";

export function CourseCoverMedia({
  className,
  coverImageUrl,
  sizes,
  variant = "card",
}: CourseCoverMediaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-surface",
        variant === "banner" ? "aspect-[32/9]" : "aspect-video",
        className
      )}>
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          sizes={sizes}
          className={variant === "banner"
            ? "object-contain"
            : "object-cover transition-transform duration-700 group-hover:scale-[1.025]"}
        />
      ) : (
        <CourseCoverPlaceholder />
      )}
      <div
        className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/8"
        aria-hidden="true"
      />
    </div>
  );
}
