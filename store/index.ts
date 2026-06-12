import { STORAGE_KEYS } from "@/constants/storage";
import {
  create,
  devtools,
  persist,
  subscribeWithSelector,
} from "@/lib/adapters/zustand";
import createLangSlice from "@/store/slices/lang";
import type { StoreState } from "@/types/store";
export { useShallow } from "zustand/react/shallow";

export const useStore = create<StoreState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get, store) => ({
        ...createLangSlice(set, get, store),
      })),
      {
        name: STORAGE_KEYS.GLOBAL_STORE,
        partialize: ({ lang }) => ({ lang }),
      }
    )
  )
);
