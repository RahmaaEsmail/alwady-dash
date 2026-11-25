import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./ar.json";
import en from "./en.json";

export const LANG_KEY = "alwadi_lang";

function initialLang(): "ar" | "en" {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function applyLang(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
}
applyLang(i18n.language);

export function setLang(lng: "ar" | "en") {
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch {
    /* ignore */
  }
  i18n.changeLanguage(lng);
  applyLang(lng);
}

export default i18n;
