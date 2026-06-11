"use client";

import { useStore } from "@/store";
import type { AuthUser } from "@/types/store/auth";
import { useEffect } from "react";

export function StoreInitializer({ user }: { user: AuthUser | null }) {
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return null;
}
