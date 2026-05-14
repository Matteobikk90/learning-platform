type CourseModuleWithProgress = {
  id: string;
  progress: {
    completedAt: Date | null;
  }[];
};

export function getCourseProgress(modules: CourseModuleWithProgress[]) {
  const totalModules = modules.length;

  if (totalModules === 0) {
    return {
      totalModules: 0,
      completedModules: 0,
      percentage: 0,
    };
  }

  const completedModules = modules.filter(
    (module) => module.progress[0]?.completedAt
  ).length;

  return {
    totalModules,
    completedModules,
    percentage: Math.round((completedModules / totalModules) * 100),
  };
}
