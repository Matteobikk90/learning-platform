import { formatPurchaseAmount } from "@/functions/admin/format-purchase-amount";
import { getPurchaseRefundStatus } from "@/functions/purchases/get-purchase-refund-status";
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
                {labels.paymentStatus}
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
            {purchases.map((purchase) => {
              const status = getPurchaseRefundStatus(purchase);

              return (
                <tr
                  key={purchase.id}
                  className="border-b border-stroke last:border-0">
                  <td className="px-6 py-5 align-top">
                    {purchase.user.name && (
                      <p className="font-medium text-white">
                        {purchase.user.name}
                      </p>
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
                    {purchase.amountRefunded > 0 && (
                      <p className="mt-1 text-[0.65rem] text-subtle">
                        {"−"}
                        {formatPurchaseAmount({
                          amountTotal: purchase.amountRefunded,
                          currency: purchase.currency,
                          locale,
                        })} {labels.refundedAmount}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 align-top">
                    <span className="inline-flex rounded-full border border-stroke px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">
                      {labels[status]}
                    </span>
                    {purchase.withdrawalRequestedAt &&
                      !purchase.withdrawalAcknowledgementSentAt && (
                        <p className="mt-2 max-w-36 whitespace-normal text-xs text-danger">
                          {labels.confirmationEmailPending}
                        </p>
                      )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-5 align-top text-sm text-muted">
                    <time dateTime={purchase.createdAt.toISOString()}>
                      {dateFormatter.format(purchase.createdAt)}
                    </time>
                  </td>
                  <td className="max-w-52 break-all px-6 py-5 align-top font-mono text-[0.65rem] leading-relaxed text-subtle">
                    {purchase.stripeCheckoutSessionId ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-stroke md:hidden">
        {purchases.map((purchase) => {
          const status = getPurchaseRefundStatus(purchase);

          return (
            <article key={purchase.id} className="space-y-5 px-6 py-6">
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.customer}
                </p>
                {purchase.user.name && (
                  <p className="mt-1 font-medium text-white">
                    {purchase.user.name}
                  </p>
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
                  <p className="mt-1 text-sm text-white">
                    {purchase.course.title}
                  </p>
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
                  {purchase.amountRefunded > 0 && (
                    <p className="mt-1 font-mono text-[0.65rem] text-subtle">
                      {"−"}
                      {formatPurchaseAmount({
                        amountTotal: purchase.amountRefunded,
                        currency: purchase.currency,
                        locale,
                      })} {labels.refundedAmount}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-subtle">
                  {labels.paymentStatus}
                </p>
                <p className="mt-1 text-sm text-white">{labels[status]}</p>
                {purchase.withdrawalRequestedAt &&
                  !purchase.withdrawalAcknowledgementSentAt && (
                    <p className="mt-1 text-xs text-danger">
                      {labels.confirmationEmailPending}
                    </p>
                  )}
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
          );
        })}
      </div>
    </>
  );
}
