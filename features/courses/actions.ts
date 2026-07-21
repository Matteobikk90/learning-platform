"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";

import {
  courseFormSchema,
  updateCourseSchema,
} from "@/features/courses/schema";
import { deleteCourseImage, getCourseImagePath } from "@/lib/course-images";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

function getCourseFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    coverImageUrl: formData.get("coverImageUrl"),
  };
}

function revalidateCoursePages() {
  revalidatePath("/");
  revalidatePath("/admin/courses");
  revalidatePath("/profile");
}

function assertManagedCoverImage(url: string | null) {
  if (url && !getCourseImagePath(url)) {
    throw new Error("L’immagine deve essere caricata dalla piattaforma");
  }
}

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const parsed = courseFormSchema.safeParse(getCourseFormData(formData));

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dati del corso non validi");
  }

  assertManagedCoverImage(parsed.data.coverImageUrl);

  await prisma.course.create({ data: parsed.data });

  revalidateCoursePages();
  redirect("/admin/courses");
}

export async function updateCourse(formData: FormData) {
  await requireAdmin();

  const parsed = updateCourseSchema.safeParse({
    id: formData.get("id"),
    ...getCourseFormData(formData),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dati del corso non validi");
  }

  assertManagedCoverImage(parsed.data.coverImageUrl);

  const existingCourse = await prisma.course.findUnique({
    where: { id: parsed.data.id },
    select: { coverImageUrl: true },
  });

  if (!existingCourse) {
    throw new Error("Corso non trovato");
  }

  await prisma.course.update({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      coverImageUrl: parsed.data.coverImageUrl,
    },
  });

  if (existingCourse.coverImageUrl !== parsed.data.coverImageUrl) {
    after(() => deleteCourseImage(existingCourse.coverImageUrl));
  }

  revalidateCoursePages();
  redirect("/admin/courses");
}
