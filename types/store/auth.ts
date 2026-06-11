export type AuthUser = {
  name?: string | null;
  email?: string | null;
};

export type AuthSliceType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};
