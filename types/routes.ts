export type CourseRouteProps = {
  params: Promise<{ id: string }>;
};

export type ModuleRouteProps = {
  params: Promise<{ id: string; moduleId: string }>;
};

export type ModuleStatusRouteContext = {
  params: Promise<{ moduleId: string }>;
};

export type NextAuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};
