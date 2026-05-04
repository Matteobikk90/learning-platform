"use server";

import { createCourseSchema } from "@/features/courses/schema";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
  await requireAdmin();

  const rawPrice = formData.get("price") as string;
  const normalizedPrice = rawPrice.replace(",", ".");
  const priceNumber = Number(normalizedPrice);

  if (Number.isNaN(priceNumber)) {
    throw new Error("Invalid price");
  }

  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: rawPrice,
  });

  if (!parsed.success) {
    throw new Error("Invalid course data");
  }

  const priceInCents = Math.round(priceNumber * 100);

  await prisma.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: priceInCents,
    },
  });

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}
