import { ChevronDown, ExternalLink, Globe, LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useDashboard } from "../api/hooks";
import { TitleText } from "../components/ui";
import { setLang } from "../i18n";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";
import { NAV } from "./nav";

const LOGO = "https://alwady.vercel.app/assets/images/logo.jpg";
const SITE = "https://alwady.vercel.app";

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { data } = useDashboard();
  const unread = Number(data?.counts?.unread_messages || 0);

  return (
    <div className="flex h-full flex-col bg-dark text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <img src={LOGO} alt="" className="size-11 rounded-full bg-white object-cover ring-2 ring-accent/70" />
        <div className="min-w-0">
          <div className="truncate font-bold leading-tight">{t("brand.name")}</div>
          <div className="line-clamp-2 text-[11px] leading-snug text-white/60">{t("brand.tagline")}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV.map((g, gi) => (
          <div key={gi}>
            {g.titleKey && <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">{t(g.titleKey)}</div>}
            <ul className="space-y-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end={it.to === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition",
                        isActive ? "bg-white/12 font-semibold text-white" : "text-white/75 hover:bg-white/8 hover:text-white",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-accent" />}
                        <it.icon className="size-[18px] shrink-0" />
                        <span className="flex-1 truncate">{t(it.labelKey)}</span>
                        {it.badge === "unread" && unread > 0 && (
                          <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-dark">{unread}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

/** Derive the two-part page title from the route. */
function useRouteTitle() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "pages") return { main: t("nav.editPage"), accent: t(`pageNames.${parts[1]}`, { defaultValue: parts[1] }) };
  if (parts[0] === "content") return { main: t("nav.manageTable"), accent: t(`tableNames.${parts[1]}`, { defaultValue: parts[1] }) };
  if (parts[0] === "messages") return { main: t("nav.messages") };
  if (parts[0] === "newsletter") return { main: t("nav.newsletter") };
  if (parts[0] === "settings") return { main: t("settings.title") };
  if (parts[0] === "password") return { main: t("password.title") };
  return { main: t("dashboard.title"), accent: t("brand.name") };
}

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const title = useRouteTitle();
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menu]);

  const isAr = i18n.language === "ar";

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>
      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade absolute inset-0 bg-dark/60" onClick={() => setOpen(false)} />
          <aside className="anim-drawer absolute inset-y-0 start-0 w-72 max-w-[85%]">
            <Sidebar onNavigate={() => setOpen(false)} />
            <button onClick={() => setOpen(false)} aria-label={t("common.close")} className="absolute end-2 top-4 grid size-8 place-items-center rounded-lg text-white/80 hover:bg-white/10">
              <X className="size-5" />
            </button>
          </aside>
        </div>
      )}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label={t("nav.menu")} className="grid size-10 place-items-center rounded-lg text-dark hover:bg-soft lg:hidden">
            <Menu className="size-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold sm:text-xl">
            <TitleText main={title.main} accent={title.accent} />
          </h1>
          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            className="flex h-10 items-center gap-1.5 rounded-[10px] border border-line px-3 text-sm font-semibold text-dark hover:bg-soft"
            aria-label="Language"
          >
            <Globe className="size-4" />
            {isAr ? "EN" : "AR"}
          </button>
          <a
            href={SITE}
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 items-center gap-1.5 rounded-[10px] bg-soft px-3 text-sm font-semibold text-main hover:bg-line sm:flex"
          >
            <ExternalLink className="size-4" />
            {t("nav.viewSite")}
          </a>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenu((v) => !v)} className="flex h-10 items-center gap-2 rounded-[10px] border border-line px-2.5 text-sm font-semibold text-dark hover:bg-soft">
              <span className="grid size-7 place-items-center rounded-full bg-main text-xs font-bold uppercase text-white">{admin?.username?.[0] || "A"}</span>
              <span className="hidden max-w-28 truncate sm:inline">{admin?.username}</span>
              <ChevronDown className="size-4 text-muted" />
            </button>
            {menu && (
              <div className="anim-pop absolute end-0 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                <a href={SITE} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-soft sm:hidden">
                  <ExternalLink className="size-4" /> {t("nav.viewSite")}
                </a>
                <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-soft">
                  <LogOut className="size-4" /> {t("nav.logout")}
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="w-full px-4 py-6 pb-28 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
