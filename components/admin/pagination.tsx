import { getAdminPageHref } from "@/functions/admin/get-admin-page-href";
import { Link } from "@/i18n/navigation";
import type { AdminPaginationProps } from "@/types/admin";

export function AdminPagination({
  basePath,
  currentPage,
  nextLabel,
  pageLabel,
  previousLabel,
  query,
  totalPages,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={pageLabel}
      className="mt-6 grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      {currentPage > 1 ? (
        <Link
          href={getAdminPageHref({
            basePath,
            page: currentPage - 1,
            query,
          })}
          className="btn-secondary justify-self-start no-underline">
          ← {previousLabel}
        </Link>
      ) : (
        <span />
      )}

      <span className="col-span-2 row-start-1 text-center font-mono text-xs uppercase tracking-widest text-muted sm:col-span-1 sm:col-start-2">
        {pageLabel}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={getAdminPageHref({
            basePath,
            page: currentPage + 1,
            query,
          })}
          className="justify-self-end btn-secondary no-underline sm:col-start-3">
          {nextLabel} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
