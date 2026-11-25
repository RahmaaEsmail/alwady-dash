import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof File !== "undefined" && (a instanceof File || b instanceof File)) return false;
  if (a == null || b == null) return (a ?? "") === (b ?? "");
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => isEqual(v, b[i]));
  if (typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => isEqual(a[k], b[k]));
  }
  return String(a) === String(b);
}

/** Keys of `cur` whose value differs from `orig`. */
export function diffKeys(orig: Record<string, any>, cur: Record<string, any>): string[] {
  return Object.keys(cur).filter((k) => !isEqual(orig?.[k], cur[k]));
}

export function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Keeps the latest callback; fires on Ctrl/Cmd+S. */
export function useSaveShortcut(fn: () => void, enabled = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [enabled]);
}

const AR: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "dh",
  ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q",
  ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y", ى: "a", ة: "a", ؤ: "w", ئ: "y", ء: "",
};

export function slugify(text: string): string {
  const s = (text || "")
    .replace(/[ً-ٰٟ]/g, "")
    .split("")
    .map((ch) => (ch in AR ? AR[ch] : ch))
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || `item-${Date.now()}`;
}

export const humanize = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Group setting keys into cards by meaning. */
export const SETTING_GROUPS = ["brand", "contact", "social", "footer", "seo", "home", "about", "forms", "other"] as const;
type Group = (typeof SETTING_GROUPS)[number];
const RULES: [Group, RegExp][] = [
  ["seo", /^(meta_|seo)/],
  ["social", /(facebook|instagram|twitter|youtube|linkedin|tiktok|snapchat|social)/],
  ["brand", /^(site_name|tagline|logo|favicon|brand)/],
  ["footer", /^(footer_|about_short|copyright|newsletter)/],
  ["forms", /(form|submit|success|placeholder)/],
  ["home", /^home_/],
  ["about", /^(about_|vision|mission|why_)/],
  ["contact", /(phone|whatsapp|email|address|map|working|hours|tel|mobile)/],
];
export function settingGroup(key: string): Group {
  for (const [g, re] of RULES) if (re.test(key)) return g;
  return "other";
}
export function groupKeys(keys: string[]) {
  return SETTING_GROUPS.map((id) => ({ id, keys: keys.filter((k) => settingGroup(k) === id) })).filter((g) => g.keys.length);
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const fmtDate = (s?: string, lang = "ar") => {
  if (!s) return "";
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? s : d.toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
};
