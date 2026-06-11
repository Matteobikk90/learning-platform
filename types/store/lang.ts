import type { LANG as LangConst } from "@/constants/shared";

export type LANG = (typeof LangConst)[keyof typeof LangConst];

export type LangSliceType = {
  lang: LANG;
  setLang: (lang: LANG) => void;
  toggleLang: () => void;
};
