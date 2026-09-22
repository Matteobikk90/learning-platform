import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CourseDetailPage, { generateMetadata } from "@/app/[locale]/courses/[courseId]/page";
import { PUBLIC_CATALOG_COURSE_FILTER } from "@/constants/courses";
import { ACTIVE_PURCHASE_FILTER } from "@/constants/purchases";
import { getPublishedCourse } from "@/functions/courses/get-published-course";
import en from "@/messages/en.json";
import itMessages from "@/messages/it.json";

const { findFirst, findPurchase, getAppSession } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findPurchase: vi.fn(),
  getAppSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { course: { findFirst }, purchase: { findFirst: findPurchase } },
}));
vi.mock("@/lib/session", () => ({ getAppSession }));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NOT_FOUND"); },
}));
vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async ({ locale }: { locale: string }) => {
    const messages = locale === "en" ? en.CourseDetail : itMessages.CourseDetail;
    return (key: keyof typeof messages) => messages[key];
  },
}));
vi.mock("@/components/course-cover-media", () => ({
  CourseCoverMedia: ({ coverImageUrl }: { coverImageUrl: string | null }) =>
    createElement("div", { "data-course-cover": coverImageUrl ?? "placeholder" }),
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean }) =>
    createElement("a", { ...props, "data-prefetch": prefetch }),
}));

const course = {
  id: "course-1",
  title: "Yoga su misura",
  description: "La tua pratica personalizzata",
  price: 4559,
  coverImageUrl: "https://example.com/yoga.jpg",
};
const params = (locale = "it") => Promise.resolve({ locale, courseId: course.id });
const renderPage = async (locale = "it") =>
  renderToStaticMarkup(await CourseDetailPage({ params: params(locale) }));

beforeEach(() => {
  vi.clearAllMocks();
  findFirst.mockResolvedValue(course);
  getAppSession.mockResolvedValue(null);
  findPurchase.mockResolvedValue(null);
});

describe("public course detail", () => {
  it("shows the backend content and price to a guest before login", async () => {
    const html = await renderPage();

    expect(html).toContain(course.title);
    expect(html).toContain(course.description);
    expect(html).toContain("45,59\u00a0€");
    expect(html).toContain(`href="/checkout/${course.id}"`);
    expect(html).toContain('data-prefetch="false"');
    expect(findPurchase).not.toHaveBeenCalled();
  });

  it("only retrieves catalog-visible courses, without exposing video identifiers", async () => {
    await getPublishedCourse(course.id);

    expect(findFirst).toHaveBeenCalledWith({
      where: { ...PUBLIC_CATALOG_COURSE_FILTER, id: course.id },
      select: { id: true, title: true, description: true, price: true, coverImageUrl: true },
    });
  });

  it("returns not found for an unavailable course, including metadata", async () => {
    findFirst.mockResolvedValue(null);

    await expect(renderPage()).rejects.toThrow("NOT_FOUND");
    await expect(generateMetadata({ params: params() })).rejects.toThrow("NOT_FOUND");
  });

  it("rejects unsupported locales before querying the course", async () => {
    await expect(renderPage("fr")).rejects.toThrow("NOT_FOUND");
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("opens the classroom for a learner with an active purchase", async () => {
    getAppSession.mockResolvedValue({ user: { id: "learner-1", role: "USER" } });
    findPurchase.mockResolvedValue({ id: "purchase-1" });

    const html = await renderPage();

    expect(findPurchase).toHaveBeenCalledWith({
      where: { ...ACTIVE_PURCHASE_FILTER, userId: "learner-1", courseId: course.id },
      select: { id: true },
    });
    expect(html).toContain(`href="/profile/courses/${course.id}"`);
    expect(html).not.toContain("/checkout/");
  });

  it("keeps checkout available when the learner has no active purchase", async () => {
    getAppSession.mockResolvedValue({ user: { id: "learner-1", role: "USER" } });
    expect(await renderPage()).toContain(`href="/checkout/${course.id}"`);
  });

  it("offers management instead of purchase to administrators", async () => {
    getAppSession.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    const html = await renderPage();

    expect(html).toContain(`href="/admin/courses/${course.id}/modules"`);
    expect(html).not.toContain("/checkout/");
    expect(findPurchase).not.toHaveBeenCalled();
  });

  it("localizes the labels and price without replacing backend copy", async () => {
    const html = await renderPage("en");

    expect(html).toContain(course.title);
    expect(html).toContain("€45.59");
    expect(html).toContain(en.CourseDetail.buy);
  });

  it("provides localized metadata for the public detail", async () => {
    const metadata = await generateMetadata({ params: params("en") });
    expect(metadata.title).toBe(course.title);
    expect(metadata.alternates?.canonical).toBe(`/en/courses/${course.id}`);
  });
});
