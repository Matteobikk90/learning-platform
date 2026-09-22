"use client";

import { Link, usePathname } from "@/i18n/navigation";

export function NavbarBrand() {
  const isHome = usePathname() === "/";
  const BrandLink = isHome ? "a" : Link;

  return (
    <BrandLink
      href={isHome ? "#hero" : "/#hero"}
      className="nav-brand text-white no-underline">
      Umberto Iglina
    </BrandLink>
  );
}
