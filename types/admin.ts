import type { PrismaClient, UserRole } from "@prisma/client";

export type AdminPromotionClient = Pick<PrismaClient, "user">;

export type AdminPromotionResult =
  | "alreadyAdmin"
  | "promoted"
  | "wouldPromote";

export type AdminPurchaseListItem = {
  amountRefunded: number;
  amountTotal: number | null;
  course: { title: string };
  createdAt: Date;
  currency: string | null;
  id: string;
  refundedAt: Date | null;
  stripeCheckoutSessionId: string | null;
  withdrawalAcknowledgementSentAt: Date | null;
  withdrawalRequestedAt: Date | null;
  user: { email: string; name: string | null };
};

export type AdminPurchaseLabels = {
  amount: string;
  confirmationEmailPending: string;
  course: string;
  customer: string;
  date: string;
  paid: string;
  partiallyRefunded: string;
  paymentStatus: string;
  refunded: string;
  refundedAmount: string;
  stripeSession: string;
  withdrawalRequested: string;
};

export type AdminPurchasesListProps = {
  labels: AdminPurchaseLabels;
  locale: string;
  purchases: AdminPurchaseListItem[];
};

export type AdminPaginationProps = {
  basePath: string;
  currentPage: number;
  nextLabel: string;
  pageLabel: string;
  previousLabel: string;
  query?: string;
  totalPages: number;
};

export type AdminPageHrefInput = {
  basePath: string;
  page: number;
  query?: string;
};

export type AdminPaginationInput = {
  itemCount: number;
  pageSize: number;
  requestedPage: number;
};

export type AdminPaginationResult = {
  currentPage: number;
  skip: number;
  totalPages: number;
};

export type AdminUserListItem = {
  createdAt: Date;
  email: string;
  emailVerified: Date | null;
  id: string;
  name: string | null;
  purchaseCount: number;
  role: UserRole;
};

export type AdminUserLabels = {
  administrator: string;
  joined: string;
  pendingVerification: string;
  purchasedCourses: string;
  role: string;
  student: string;
  user: string;
  verified: string;
  viewDetails: string;
};

export type AdminUsersListProps = {
  labels: AdminUserLabels;
  locale: string;
  users: AdminUserListItem[];
};

export type AdminUserPurchaseItem = {
  amountRefunded: number;
  amountTotal: number | null;
  course: {
    id: string;
    modules: {
      id: string;
      progress: { completedAt: Date | null }[];
    }[];
    title: string;
  };
  createdAt: Date;
  currency: string | null;
  id: string;
  refundedAt: Date | null;
  withdrawalAcknowledgementSentAt: Date | null;
  withdrawalRequestedAt: Date | null;
};

export type AdminUserCoursesListProps = {
  locale: string;
  purchases: AdminUserPurchaseItem[];
};

export type PurchaseAmountInput = {
  amountTotal: number | null;
  currency: string | null;
  locale: string;
};
