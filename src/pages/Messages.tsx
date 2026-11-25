import { Mail, MessageCircle, Phone, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteMessage, useMarkRead, useMessages } from "../api/hooks";
import type { Message } from "../api/types";
import { Button, Card, ConfirmDialog, Drawer, EmptyState, Input, ListSkeleton, Pagination, Tabs, Toggle } from "../components/ui";
import { cn, fmtDate, useDebounced } from "../lib/utils";

const isUnread = (m: Message) => String(m.is_read) !== "1";
function waLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("20") ? d : "2" + d.replace(/^0/, "")}`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-0.5 break-words text-dark" dir="auto">{children || "—"}</div>
    </div>
  );
}

export default function Messages() {
  const { t, i18n } = useTranslation();
  const [source, setSource] = useState<"contact" | "faq">("contact");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);
  const [selected, setSelected] = useState<Message | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const markRead = useMarkRead();
  const del = useDeleteMessage();

  useEffect(() => setPage(1), [source, unreadOnly, debounced]);
  const q = useMessages({ page, source, unread: unreadOnly ? 1 : undefined, search: debounced });
  const rows = q.data?.data ?? [];

  const open = (m: Message) => {
    setSelected(m);
    if (isUnread(m)) markRead.mutate(m.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Tabs
          tabs={[{ id: "contact", label: t("messages.contact") }, { id: "faq", label: t("messages.faq") }]}
          value={source}
          onChange={setSource}
        />
        <div className="flex flex-wrap items-center gap-4">
          <Toggle checked={unreadOnly} onChange={setUnreadOnly} label={t("messages.unreadOnly")} />
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />
            <Input className="ps-9" dir="auto" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <Card bodyClass="p-0">
        {q.isLoading ? (
          <div className="p-5"><ListSkeleton /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<Mail className="size-8" />} title={t("messages.empty")} />
        ) : (
          <ul className={cn("divide-y divide-line", q.isFetching && "opacity-70")}>
            {rows.map((m) => {
              const unread = isUnread(m);
              return (
                <li key={m.id}>
                  <div className="flex w-full items-start gap-3 px-5 py-4 text-start hover:bg-soft/60">
                    <button type="button" onClick={() => open(m)} className="flex min-w-0 flex-1 items-start gap-3 text-start">
                      <span className={cn("mt-2 size-2.5 shrink-0 rounded-full", unread ? "bg-accent" : "bg-transparent")} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3">
                          <span className={cn("text-sm", unread ? "font-bold text-dark" : "font-medium text-dark/80")} dir="auto">{m.name}</span>
                          <span className="text-xs text-muted" dir="ltr">{m.phone}</span>
                        </div>
                        <div className={cn("mt-0.5 line-clamp-1 text-sm", unread ? "font-semibold text-dark" : "text-muted")} dir="auto">{m.message}</div>
                      </div>
                      <span className="hidden shrink-0 text-xs text-muted sm:block">{fmtDate(m.created_at, i18n.language)}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={t("common.delete")}
                      onClick={() => setToDelete(m)}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {q.data?.pagination && <Pagination page={page} pages={q.data.pagination.pages} total={q.data.pagination.total} onChange={setPage} />}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={t("messages.detail")} width="max-w-lg">
        {selected && (
          <div className="space-y-5">
            <Row label={t("messages.from")}>{selected.name}</Row>
            <Row label={t("messages.phone")}><span dir="ltr">{selected.phone}</span></Row>
            <Row label={t("messages.email")}><span dir="ltr">{selected.email}</span></Row>
            <Row label={t("messages.service")}>{selected.service}</Row>
            <Row label={t("messages.received")}>{fmtDate(selected.created_at, i18n.language)}</Row>
            <Row label={t("messages.message")}><p className="whitespace-pre-wrap rounded-xl bg-soft p-4 leading-relaxed">{selected.message}</p></Row>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {selected.phone && (
                <>
                  <a href={`tel:${selected.phone}`}><Button variant="secondary" icon={<Phone className="size-4" />}>{t("messages.call")}</Button></a>
                  <a href={waLink(selected.phone)} target="_blank" rel="noreferrer">
                    <Button variant="secondary" icon={<MessageCircle className="size-4 text-success" />}>{t("messages.whatsapp")}</Button>
                  </a>
                </>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`}><Button variant="secondary" icon={<Mail className="size-4" />}>{t("messages.email")}</Button></a>
              )}
              <Button variant="ghost" className="ms-auto text-danger hover:bg-danger/10" icon={<Trash2 className="size-4" />} onClick={() => setToDelete(selected)}>
                {t("common.delete")}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        name={toDelete?.name}
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          del.mutate(toDelete.id, {
            onSuccess: () => {
              if (selected?.id === toDelete.id) setSelected(null);
              setToDelete(null);
            },
          })
        }
      />
    </div>
  );
}
