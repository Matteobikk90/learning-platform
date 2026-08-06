export type AdminPurchaseListItem = {
  amountTotal: number | null;
  course: { title: string };
  createdAt: Date;
  currency: string | null;
  id: string;
  stripeCheckoutSessionId: string | null;
  user: { email: string; name: string | null };
};

export type AdminPurchaseLabels = {
  amount: string;
  course: string;
  customer: string;
  date: string;
  stripeSession: string;
};

export type AdminPurchasesListProps = {
  labels: AdminPurchaseLabels;
  locale: string;
  purchases: AdminPurchaseListItem[];
};

export type AdminPaginationProps = {
  currentPage: number;
  nextLabel: string;
  pageLabel: string;
  previousLabel: string;
  totalPages: number;
};

export type PurchaseAmountInput = {
  amountTotal: number | null;
  currency: string | null;
  locale: string;
};
