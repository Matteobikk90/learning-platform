import Image from "next/image";

import { CourseCoverPlaceholder } from "@/components/course-cover-placeholder";
import { cn } from "@/lib/cn";
import type { CourseCoverMediaProps } from "@/types/course";

export function CourseCoverMedia({
  className,
  coverImageUrl,
  sizes,
}: CourseCoverMediaProps) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-surface",
        className
      )}>
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
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
