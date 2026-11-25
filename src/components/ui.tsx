import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, Loader2, X } from "lucide-react";
import { useEffect, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { cn, humanize } from "../lib/utils";

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-main text-white hover:bg-main-2 shadow-sm",
  secondary: "bg-white text-dark border border-line hover:bg-soft",
  ghost: "text-main hover:bg-soft",
  danger: "bg-danger text-white hover:bg-red-700 shadow-sm",
  accent: "bg-accent text-dark hover:brightness-95 shadow-sm",
};
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
}
export function Button({ variant = "primary", size = "md", loading, icon, children, className, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-5 text-sm",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/* ---------- Inputs ---------- */
const inputCls =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 text-sm text-dark placeholder:text-muted/60 transition focus:border-main focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-soft";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputCls, className)} {...rest} />;
}
export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(inputCls, "resize-y leading-relaxed", className)} {...rest} />;
}
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputCls, "pe-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({ label, hint, error, htmlFor, children, className }: { label?: ReactNode; hint?: ReactNode; error?: string; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-dark">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; id?: string }) {
  const auto = useId();
  const tid = id || auto;
  return (
    <div className="flex items-center gap-3">
      <button
        id={tid}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-main" : "bg-line")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "start-[22px]" : "start-0.5")} />
      </button>
      {label && (
        <label htmlFor={tid} className="cursor-pointer text-sm text-dark">
          {label}
        </label>
      )}
    </div>
  );
}

/* ---------- Layout bits ---------- */
export function Card({ title, actions, children, className, bodyClass }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white shadow-soft", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 font-bold text-dark">{title}</div>
          {actions}
        </header>
      )}
      <div className={cn("p-5", bodyClass)}>{children}</div>
    </section>
  );
}

/** Two-part website-style title: dark main text + gold accent. */
export function TitleText({ main, accent, className }: { main?: ReactNode; accent?: ReactNode; className?: string }) {
  return (
    <span className={className}>
      <span className="text-dark">{main}</span>
      {accent ? <> <span className="text-gold">{accent}</span></> : null}
    </span>
  );
}

export function Badge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "blue" | "green" | "gray" }) {
  const tones = { gold: "bg-accent/25 text-[#8a6200]", blue: "bg-main/10 text-main", green: "bg-success/10 text-success", gray: "bg-soft text-muted" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-line/70", className)} />;
}
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: ReactNode; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-soft text-main">{icon || <Inbox className="size-8" />}</div>
      <h3 className="font-bold text-dark">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition",
            value === t.id ? "border-accent text-dark" : "border-transparent text-muted hover:text-dark",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Pill-style filter chips. */
export function Pills<T extends string>({ items, value, onChange }: { items: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition",
            value === t.id ? "border-main bg-main text-white" : "border-line bg-white text-muted hover:border-main hover:text-main",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, total, onChange }: { page: number; pages: number; total?: number; onChange: (p: number) => void }) {
  const { t } = useTranslation();
  if (pages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <span className="text-sm text-muted">
        {t("common.pageOf", { page, pages })}
        {total !== undefined && ` · ${t("common.items", { count: total })}`}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} icon={<ChevronRight className="size-4 rtl:rotate-0 ltr:rotate-180" />}>
          {t("common.prev")}
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          {t("common.next")}
          <ChevronLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Overlays ---------- */
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; size?: "md" | "lg" }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="anim-fade absolute inset-0 bg-dark/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={cn("anim-pop relative w-full rounded-2xl bg-white shadow-2xl", size === "lg" ? "max-w-2xl" : "max-w-md")}>
        {title && <div className="border-b border-line px-6 py-4 font-bold text-dark">{title}</div>}
        <div className="p-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/** Side drawer: right in Arabic, left in English (logical `start`). */
export function Drawer({ open, onClose, title, children, footer, width = "max-w-2xl" }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; width?: string }) {
  const { t } = useTranslation();
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="anim-fade absolute inset-0 bg-dark/50" onClick={onClose} />
      <aside role="dialog" aria-modal="true" className={cn("anim-drawer absolute inset-y-0 start-0 flex w-full flex-col bg-white shadow-2xl", width)}>
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 truncate text-lg font-bold text-dark">{title}</div>
          <button type="button" onClick={onClose} aria-label={t("common.close")} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-soft">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-soft/50 px-5 py-3">{footer}</footer>}
      </aside>
    </div>
  );
}

export function ConfirmDialog({ open, name, loading, onConfirm, onCancel, title, message, confirmLabel, tone = "danger" }: { open: boolean; name?: string; loading?: boolean; onConfirm: () => void; onCancel: () => void; title?: string; message?: string; confirmLabel?: string; tone?: "danger" | "primary" }) {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel || t("common.delete")}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-full", tone === "danger" ? "bg-danger/10 text-danger" : "bg-accent/25 text-gold")}>
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-dark">{title || t("common.confirmDelete")}</h3>
          <p className="mt-1 text-sm text-muted">{message || t("common.confirmDeleteMsg", { name })}</p>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- helpers ---------- */
export function useFieldLabel() {
  const { t, i18n } = useTranslation();
  return (name: string, fallback?: string) => (i18n.exists(`fields.${name}`) ? t(`fields.${name}`) : fallback || humanize(name));
}
