import { formatPurchaseAmount } from "@/functions/admin/format-purchase-amount";
import type { AdminPurchasesListProps } from "@/types/admin";

export function AdminPurchasesList({
  labels,
  locale,
  purchases,
}: AdminPurchasesListProps) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-stroke font-mono text-[0.65rem] uppercase tracking-[0.16em] text-subtle">
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.customer}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.course}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.amount}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.date}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {labels.stripeSession}
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b border-stroke last:border-0">
                <td className="px-6 py-5 align-top">
                  {purchase.user.name && (
                    <p className="font-medium text-white">{purchase.user.name}</p>
                  )}
                  <p className="text-sm text-muted">{purchase.user.email}</p>
                </td>
                <td className="px-6 py-5 align-top text-sm text-white">
                  {purchase.course.title}
                </td>
                <td className="whitespace-nowrap px-6 py-5 align-top font-mono text-sm text-white">
                  {formatPurchaseAmount({
                    amountTotal: purchase.amountTotal,
                    currency: purchase.currency,
                    locale,
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-5 align-top text-sm text-muted">
                  <time dateTime={purchase.createdAt.toISOString()}>
                    {dateFormatter.format(purchase.createdAt)}
                  </time>
                </td>
                <td className="max-w-52 px-6 py-5 align-top font-mono text-[0.65rem] leading-relaxed text-subtle break-all">
                  {purchase.stripeCheckoutSessionId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-stroke md:hidden">
        {purchases.map((purchase) => (
          <article key={purchase.id} className="space-y-5 px-6 py-6">
            <div>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                {labels.customer}
              </p>
              {purchase.user.name && (
                <p className="mt-1 font-medium text-white">{purchase.user.name}</p>
              )}
              <p className="mt-1 break-all text-sm text-muted">
                {purchase.user.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.course}
                </p>
                <p className="mt-1 text-sm text-white">{purchase.course.title}</p>
              </div>
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.amount}
                </p>
                <p className="mt-1 font-mono text-sm text-white">
                  {formatPurchaseAmount({
                    amountTotal: purchase.amountTotal,
                    currency: purchase.currency,
                    locale,
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                {labels.date}
              </p>
              <p className="mt-1 text-sm text-muted">
                <time dateTime={purchase.createdAt.toISOString()}>
                  {dateFormatter.format(purchase.createdAt)}
                </time>
              </p>
            </div>

            <div>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                {labels.stripeSession}
              </p>
              <p className="mt-1 break-all font-mono text-[0.65rem] leading-relaxed text-subtle">
                {purchase.stripeCheckoutSessionId ?? "—"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
