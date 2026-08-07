import type { UserRole } from "@prisma/client";

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
