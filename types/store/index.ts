import type { StateCreator } from "@/lib/adapters/zustand";
import type { LangSliceType } from "@/types/store/lang";

export type StoreState = LangSliceType;

export type SliceCreator<T> = StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  T
>;
