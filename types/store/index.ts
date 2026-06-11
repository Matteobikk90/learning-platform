import type { StateCreator } from "@/lib/adapters/zustand";
import type { AuthSliceType } from "@/types/store/auth";
import type { LangSliceType } from "@/types/store/lang";

export type StoreState = LangSliceType & AuthSliceType;

export type SliceCreator<T> = StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  T
>;
