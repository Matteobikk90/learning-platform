import { LANG as LangEnum } from "@/constants/shared";
import type { SliceCreator } from "@/types/store";
import type { LANG, LangSliceType } from "@/types/store/lang";

const createLangSlice: SliceCreator<LangSliceType> = (set) => ({
  lang: LangEnum.IT,
  setLang: (lang: LANG) => {
    set({ lang }, undefined, "LANG/SET_LANG");
  },
  toggleLang: () =>
    set(
      ({ lang }) => ({
        lang: lang === LangEnum.EN ? LangEnum.IT : LangEnum.EN,
      }),
      undefined,
      "LANG/TOGGLE_LANG"
    ),
});

export default createLangSlice;
