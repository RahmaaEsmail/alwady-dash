import { Download, Mail, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteSubscriber, useNewsletter } from "../api/hooks";
import { Button, Card, ConfirmDialog, EmptyState, Input, ListSkeleton } from "../components/ui";
import { downloadCsv, fmtDate } from "../lib/utils";

export default function Newsletter() {
  const { t, i18n } = useTranslation();
  const q = useNewsletter();
  const del = useDeleteSubscriber();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<{ id: number | string; email: string } | null>(null);

  const all = q.data ?? [];
  const rows = all.filter((r) => r.email.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="me-auto">
          <h2 className="text-xl font-bold text-dark">{t("newsletter.title")}</h2>
          <p className="text-sm text-muted">{t("common.items", { count: all.length })}</p>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />
          <Input className="ps-9" dir="auto" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button
          variant="secondary"
          disabled={!rows.length}
          icon={<Download className="size-4" />}
          onClick={() => downloadCsv("newsletter.csv", [["email", "date"], ...rows.map((r) => [r.email, r.created_at])])}
        >
          {t("newsletter.export")}
        </Button>
      </div>

      <Card bodyClass="p-0">
        {q.isLoading ? (
          <div className="p-5"><ListSkeleton /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<Mail className="size-8" />} title={search ? t("common.noResults") : t("newsletter.empty")} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-soft text-xs font-semibold uppercase text-muted">
              <tr>
                <th className="px-4 py-3 text-start">{t("newsletter.email")}</th>
                <th className="hidden px-4 py-3 text-start sm:table-cell">{t("common.date")}</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-soft/60">
                  <td className="px-4 py-3" dir="ltr"><span className="block text-start">{r.email}</span></td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{fmtDate(r.created_at, i18n.language)}</td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      aria-label={t("common.delete")}
                      onClick={() => setToDelete(r)}
                      className="grid size-9 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        name={toDelete?.email}
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  );
}
