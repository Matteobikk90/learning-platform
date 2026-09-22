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
    coverImageUrl: "https://example.com/yoga.jpg",
  },
  {
    id: "breathing-from-catalog",
    title: "Respiro consapevole",
    description: "Un secondo percorso dal catalogo",
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
      <Corsi courses={courses} {...props} />
    </NextIntlClientProvider>
  );
}

describe("home course catalog", () => {
  it("renders only the supplied courses with their own covers and descriptions, without prices", () => {
    const html = renderCourses();

    expect(html.match(/<article\b/g)).toHaveLength(2);
    for (const course of courses) {
      expect(html).toContain(`id="course-${course.id}-title"`);
      expect(html).toContain(course.title);
      expect(html).toContain(course.description);
      expect(html).toContain(`data-course-cover="${course.coverImageUrl}"`);
    }
    expect(html).not.toContain("€");
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

  it("links to the public detail instead of checkout", () => {
    const html = renderCourses();

    for (const course of courses) {
      expect(html).toContain(`href="/courses/${course.id}"`);
    }
    expect(html.match(/>Scopri di più<\/a>/g)).toHaveLength(2);
    expect(html).not.toContain("/checkout/");
    expect(html).not.toContain("/profile/courses/");
  });

  it("keeps the compact banner strip to a description and discovery action", () => {
    const html = renderCourses({ courses: [courses[0]] });

    expect(html).toContain(`class="sr-only">${courses[0].title}</h3>`);
    expect(html).toContain(courses[0].description);
    expect(html).not.toContain(itMessages.Home.courses.buyCourse);
    expect(html).not.toContain(itMessages.Home.courses.manageCourse);
  });

  it("keeps a course usable without an uploaded cover or description", () => {
    const html = renderCourses({
      courses: [{ ...courses[0], coverImageUrl: null, description: null }],
    });

    expect(html.match(/<article\b/g)).toHaveLength(1);
    expect(html).toContain('data-course-cover="placeholder"');
    expect(html).toContain(courses[0].title);
    expect(html).toContain(`href="/courses/${courses[0].id}"`);
    expect(html).not.toContain('class="sr-only"');
    expect(html).not.toContain("La tua pratica personalizzata");
  });

  it("localizes the discovery action without replacing backend course content", () => {
    const html = renderCourses({ courses: [courses[0]] }, "en");

    expect(html).toContain(courses[0].title);
    expect(html).toContain(courses[0].description);
    expect(html).not.toContain("€");
    expect(html).toContain(enMessages.Home.courses.discover);
    expect(html).not.toContain(itMessages.Home.courses.discover);
  });
});
