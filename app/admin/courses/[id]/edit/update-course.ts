"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";

export async function updateCourse(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const price = Number(formData.get("price"));
  const coverImageUrl = formData.get("coverImageUrl");

  await prisma.course.update({
    where: { id },
    data: {
      title,
      description,
      price,
      coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
    },
  });

  redirect(`/admin/courses`);
}
