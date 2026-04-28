import { prisma } from "@/lib/prisma";

export default async function Home() {
  const courses = await prisma.course.findMany();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">Courses: {courses.length}</h1>
    </main>
  );
}
