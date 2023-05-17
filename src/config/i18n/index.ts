/* eslint-disable @typescript-eslint/naming-convention */
import en from "./en.js";
import jp from "./jp.js";
import ptBR from "./pt-BR.js";
import ru from "./ru.js";
import zhCN from "./zh-CN.js";
import zhTW from "./zh-TW.js";
import { type WalineLocale } from "../../typings/index.js";

export type Locales = Record<string, WalineLocale>;

export const DEFAULT_LOCALES: Locales = {
  en: en,
  zh: zhCN,
  ja: jp,
  ru: ru,
  "zh-cn": zhCN,
  "zh-tw": zhTW,
  "en-us": en,
  "ja-jp": jp,
  "pt-br": ptBR,
  "ru-ru": ru,
};
