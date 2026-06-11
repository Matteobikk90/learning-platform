import type { SliceCreator } from "@/types/store";
import type { AuthSliceType, AuthUser } from "@/types/store/auth";

const createAuthSlice: SliceCreator<AuthSliceType> = (set) => ({
  user: null,
  setUser: (user: AuthUser | null) => {
    set({ user }, undefined, "AUTH/SET_USER");
  },
});

export default createAuthSlice;
