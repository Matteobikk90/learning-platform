export type CourseModuleWithProgress = {
  id: string;
  progress: {
    completedAt: Date | null;
  }[];
};
