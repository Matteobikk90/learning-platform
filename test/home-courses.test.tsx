import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import { Corsi } from "@/app/sections/corsi";
import enMessages from "@/messages/en.json";
import itMessages from "@/messages/it.json";
import type { CorsiSectionProps, Course } from "@/types/home";

vi.mock("@/components/responsive-background-image", () => ({
  ResponsiveBackgroundImage: () => null,
}));

vi.mock("@/components/course-cover-media", () => ({
  CourseCoverMedia: ({ coverImageUrl }: { coverImageUrl: string | null }) =>
    createElement("div", { "data-course-cover": coverImageUrl ?? "placeholder" }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean }) =>
    createElement("a", { ...props, "data-prefetch": prefetch }),
}));

const courses: Course[] = [
  {
    id: "yoga-from-catalog",
    title: "Yoga su misura",
    description: "La tua pratica personalizzata",
    price: 4559,
    coverImageUrl: "https://example.com/yoga.jpg",
  },
  {
    id: "breathing-from-catalog",
    title: "Respiro consapevole",
    description: "Un secondo percorso dal catalogo",
    price: 7900,
    coverImageUrl: "https://example.com/breathing.jpg",
  },
];

function renderCourses(
  props: Partial<CorsiSectionProps> = {},
  locale: "it" | "en" = "it"
) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "it" ? itMessages : enMessages}
      timeZone="Europe/Rome">
      <Corsi courses={courses} isAdmin={false} purchasedSet={new Set()} {...props} />
    </NextIntlClientProvider>
  );
}

describe("home course catalog", () => {
  it("renders only the supplied courses with their own covers, descriptions and prices", () => {
    const html = renderCourses();

    expect(html.match(/<article\b/g)).toHaveLength(2);
    for (const course of courses) {
      expect(html).toContain(`id="course-${course.id}-title"`);
      expect(html).toContain(course.title);
      expect(html).toContain(course.description);
      expect(html).toContain(`data-course-cover="${course.coverImageUrl}"`);
    }
    expect(html).toContain("45,59\u00a0€");
    expect(html).toContain("79,00\u00a0€");
    expect(html).not.toContain('href="/yoga-su-misura"');
  });

  it("does not insert a static Yoga banner when the backend only returns another course", () => {
    const html = renderCourses({ courses: [courses[1]] });

    expect(html.match(/<article\b/g)).toHaveLength(1);
    expect(html).toContain("Respiro consapevole");
    expect(html).not.toContain("Yoga su misura");
    expect(html).not.toContain("La tua pratica personalizzata");
  });

  it.each(["it", "en"] as const)("shows the localized empty state without placeholder courses in %s", (locale) => {
    const html = renderCourses({ courses: [] }, locale);
    const messages = locale === "it" ? itMessages : enMessages;

    expect(html).toContain(messages.Home.courses.empty);
    expect(html).not.toContain("<article");
    expect(html).not.toContain("Yoga su misura");
    expect(html).not.toContain("/checkout/");
  });

  it("uses checkout links without prefetch for courses that have not been purchased", () => {
    const html = renderCourses();

    for (const course of courses) {
      expect(html).toMatch(new RegExp(`<a[^>]*href="/checkout/${course.id}"[^>]*data-prefetch="false"`));
    }
    expect(html.match(/>Acquista il corso<\/a>/g)).toHaveLength(2);
    expect(html).not.toContain("/profile/courses/");
  });

  it("opens purchased courses directly while retaining checkout for unowned courses", () => {
    const html = renderCourses({ purchasedSet: new Set([courses[0].id]) });

    expect(html).toContain(`href="/profile/courses/${courses[0].id}"`);
    expect(html).toContain(itMessages.Home.courses.goToCourse);
    expect(html).not.toContain(`href="/checkout/${courses[0].id}"`);
    expect(html).toContain(`href="/checkout/${courses[1].id}"`);
  });

  it("prioritizes management links for administrators even if they purchased a course", () => {
    const html = renderCourses({ isAdmin: true, purchasedSet: new Set([courses[0].id]) });

    for (const course of courses) {
      expect(html).toContain(`href="/admin/courses/${course.id}/modules"`);
    }
    expect(html.match(/>Gestisci corso<\/a>/g)).toHaveLength(2);
    expect(html).not.toContain("/checkout/");
    expect(html).not.toContain("/profile/courses/");
  });

  it("keeps a course usable without an uploaded cover or description", () => {
    const html = renderCourses({
      courses: [{ ...courses[0], coverImageUrl: null, description: null }],
    });

    expect(html.match(/<article\b/g)).toHaveLength(1);
    expect(html).toContain('data-course-cover="placeholder"');
    expect(html).toContain(courses[0].title);
    expect(html).toContain(`href="/checkout/${courses[0].id}"`);
    expect(html).not.toContain("La tua pratica personalizzata");
  });

  it("localizes the action and price without replacing backend course content", () => {
    const html = renderCourses({ courses: [courses[0]] }, "en");

    expect(html).toContain(courses[0].title);
    expect(html).toContain(courses[0].description);
    expect(html).toContain("€45.59");
    expect(html).toContain(enMessages.Home.courses.buyCourse);
    expect(html).not.toContain(itMessages.Home.courses.buyCourse);
  });
});
