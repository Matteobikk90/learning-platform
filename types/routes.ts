import type { ReactNode } from "react";

type LocalizedParams = {
  locale: string;
};

export type CourseRouteProps = {
  params: Promise<LocalizedParams & { id: string }>;
};

export type ModuleRouteProps = {
  params: Promise<LocalizedParams & { id: string; moduleId: string }>;
};

export type ProfileCourseRouteProps = {
  params: Promise<LocalizedParams & { courseId: string }>;
};

export type ProfileModuleRouteProps = {
  params: Promise<
    LocalizedParams & { courseId: string; moduleId: string }
  >;
};

export type CheckoutCourseRouteProps = {
  params: Promise<LocalizedParams & { courseId: string }>;
};

export type CheckoutSuccessRouteProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export type LoginRouteProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export type LocalizedLayoutProps = {
  children: ReactNode;
  params: Promise<LocalizedParams>;
};

export type LayoutProps = {
  children: ReactNode;
};

export type ModuleStatusRouteContext = {
  params: Promise<{ moduleId: string }>;
};

export type NextAuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};
