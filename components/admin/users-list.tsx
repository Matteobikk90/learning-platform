import { Link } from "@/i18n/navigation";
import type { AdminUsersListProps } from "@/types/admin";

export function AdminUsersList({
  labels,
  locale,
  users,
}: AdminUsersListProps) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-stroke font-mono text-[0.65rem] uppercase tracking-[0.16em] text-subtle">
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.user}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.role}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.purchasedCourses}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.joined}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                <span className="sr-only">{labels.viewDetails}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-stroke last:border-0">
                <td className="px-6 py-5 align-top">
                  {user.name && (
                    <p className="font-medium text-white">{user.name}</p>
                  )}
                  <p className="text-sm text-muted">{user.email}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {user.emailVerified
                      ? labels.verified
                      : labels.pendingVerification}
                  </p>
                </td>
                <td className="px-6 py-5 align-top">
                  <span className="rounded-full border border-stroke px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                    {user.role === "ADMIN"
                      ? labels.administrator
                      : labels.student}
                  </span>
                </td>
                <td className="px-6 py-5 align-top font-mono text-sm text-white">
                  {user.purchaseCount}
                </td>
                <td className="whitespace-nowrap px-6 py-5 align-top text-sm text-muted">
                  <time dateTime={user.createdAt.toISOString()}>
                    {dateFormatter.format(user.createdAt)}
                  </time>
                </td>
                <td className="px-6 py-5 text-right align-top">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="btn-secondary no-underline">
                    {labels.viewDetails}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-stroke md:hidden">
        {users.map((user) => (
          <article key={user.id} className="space-y-5 px-6 py-6">
            <div>
              <h2 className="break-words font-display text-xl text-white">
                {user.name ?? user.email}
              </h2>
              {user.name && (
                <p className="break-all text-sm text-muted">{user.email}</p>
              )}
              <p className="mt-1 text-xs text-subtle">
                {user.emailVerified
                  ? labels.verified
                  : labels.pendingVerification}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-5">
              <div>
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.role}
                </dt>
                <dd className="mt-1 text-sm text-white">
                  {user.role === "ADMIN"
                    ? labels.administrator
                    : labels.student}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.purchasedCourses}
                </dt>
                <dd className="mt-1 font-mono text-sm text-white">
                  {user.purchaseCount}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.joined}
                </dt>
                <dd className="mt-1 text-sm text-muted">
                  <time dateTime={user.createdAt.toISOString()}>
                    {dateFormatter.format(user.createdAt)}
                  </time>
                </dd>
              </div>
            </dl>

            <Link
              href={`/admin/users/${user.id}`}
              className="btn-secondary w-full text-center no-underline">
              {labels.viewDetails}
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
