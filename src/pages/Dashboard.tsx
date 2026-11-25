import { Briefcase, HelpCircle, Mail, MessageSquare, Newspaper, Users, Wrench, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDashboard } from "../api/hooks";
import { Button, Card, EmptyState, Skeleton, TitleText } from "../components/ui";
import { PAGE_ICONS, PAGE_NAMES } from "../layouts/nav";
import { useAuth } from "../lib/auth";
import { cn, fmtDate } from "../lib/utils";

const STATS: { key: string; icon: LucideIcon; label: string; to: string; gold?: boolean }[] = [
  { key: "services", icon: Wrench, label: "tableNames.services", to: "/content/services" },
  { key: "projects", icon: Briefcase, label: "tableNames.projects", to: "/content/projects" },
  { key: "blog_posts", icon: Newspaper, label: "tableNames.blog_posts", to: "/content/blog_posts" },
  { key: "faqs", icon: HelpCircle, label: "tableNames.faqs", to: "/content/faqs" },
  { key: "partners", icon: Users, label: "tableNames.partners", to: "/content/partners" },
  { key: "unread_messages", icon: MessageSquare, label: "dashboard.unreadMessages", to: "/messages", gold: true },
  { key: "newsletter", icon: Mail, label: "dashboard.subscribers", to: "/newsletter" },
];

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { admin } = useAuth();
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          <TitleText main={t("dashboard.welcome", { name: admin?.username })} />
        </h2>
        <p className="text-muted">{t("dashboard.welcomeSub")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {STATS.map((s) => (
          <Link
            key={s.key}
            to={s.to}
            className={cn(
              "group rounded-2xl border p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md",
              s.gold ? "border-accent bg-accent/20" : "border-line bg-white",
            )}
          >
            <div className={cn("mb-3 grid size-10 place-items-center rounded-xl", s.gold ? "bg-accent text-dark" : "bg-soft text-main")}>
              <s.icon className="size-5" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-3xl font-bold text-dark">{data?.counts?.[s.key] ?? 0}</div>}
            <div className="mt-0.5 text-sm text-muted">{t(s.label)}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title={t("dashboard.latestMessages")}
          actions={
            <Link to="/messages" className="text-sm font-semibold text-main hover:underline">
              {t("common.viewAll")}
            </Link>
          }
          bodyClass="p-0"
        >
          {isLoading ? (
            <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
          ) : !data?.latest_messages?.length ? (
            <EmptyState icon={<MessageSquare className="size-8" />} title={t("dashboard.noMessages")} />
          ) : (
            <ul className="divide-y divide-line">
              {data.latest_messages.slice(0, 5).map((m) => {
                const unread = String(m.is_read) !== "1";
                return (
                  <li key={m.id}>
                    <Link to="/messages" className="flex items-start gap-3 px-5 py-3 hover:bg-soft/60">
                      <span className={cn("mt-2 size-2.5 shrink-0 rounded-full", unread ? "bg-accent" : "bg-transparent")} />
                      <div className="min-w-0 flex-1">
                        <div className={cn("truncate text-sm", unread ? "font-bold" : "font-medium")} dir="auto">{m.name}</div>
                        <div className="truncate text-xs text-muted" dir="auto">{m.message}</div>
                      </div>
                      <span className="shrink-0 text-xs text-muted">{fmtDate(m.created_at, i18n.language)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title={t("dashboard.quickEdit")}>
          <div className="grid grid-cols-2 gap-2">
            {PAGE_NAMES.map((n) => {
              const Icon = PAGE_ICONS[n];
              return (
                <Link key={n} to={`/pages/${n}`}>
                  <Button variant="secondary" className="w-full justify-start" icon={<Icon className="size-4 text-main" />}>
                    <span className="truncate">{t(`pageNames.${n}`)}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
