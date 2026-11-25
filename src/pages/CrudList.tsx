/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useCreate, useDelete, useItem, useList, useTables, useUpdate } from "../api/hooks";
import { buildPayload } from "../api/payload";
import type { FieldDef, Row, TableDef } from "../api/types";
import { FieldRenderer } from "../components/FieldRenderer";
import { Badge, Button, Card, ConfirmDialog, Drawer, EmptyState, Input, ListSkeleton, Pagination, Pills, Skeleton, Tabs, useFieldLabel } from "../components/ui";
import { UnsavedGuard } from "../components/UnsavedGuard";
import { diffKeys, slugify, useDebounced, useSaveShortcut } from "../lib/utils";

/* ---------- form layout config ---------- */
const TAB_CONFIG: Record<string, { id: string; fields: string[] }[]> = {
  projects: [
    { id: "basic", fields: ["title", "slug", "category", "location", "capacity", "status", "contract_date", "description", "image", "show_home", "show_about"] },
    { id: "solar", fields: ["panels", "inverter", "components"] },
    { id: "wells", fields: ["depth", "wells_count", "scope"] },
    { id: "details", fields: ["stages", "gallery"] },
  ],
  services: [
    { id: "basic", fields: ["title", "slug", "subtitle", "short_desc", "image", "show_home", "show_footer"] },
    { id: "detailsPage", fields: ["description", "bullets", "includes", "steps", "gallery"] },
  ],
  blog_posts: [
    { id: "basic", fields: ["title", "slug", "category", "author", "post_date", "featured", "image", "excerpt"] },
    { id: "content", fields: ["content", "quote", "bullets", "tags", "gallery"] },
  ],
};
const PRIORITY = ["title", "name", "question", "slug", "category", "subtitle", "short_desc", "label", "value", "suffix", "text", "answer", "image", "logo"];
const HIDDEN_FIELDS = new Set(["id", "created_at", "updated_at"]);
const PAGE_FILTERS: Record<string, { id: string; labelKey: string }[]> = {
  faqs: [{ id: "faq", labelKey: "crud.faqPage" }, { id: "contact", labelKey: "crud.contactPage" }],
  stats: [{ id: "home", labelKey: "crud.homePage" }, { id: "about", labelKey: "crud.aboutPage" }],
};
const TITLE_KEYS = ["title", "name", "question", "label", "email"];

const isToggleField = (f?: FieldDef) => !!f && f.type === "select" && !!f.options && f.options.length === 2 && f.options.includes("0") && f.options.includes("1");
const rowTitle = (r: Row) => String(TITLE_KEYS.map((k) => r[k]).find(Boolean) ?? `#${r.id}`);
const prio = (n: string) => { const i = PRIORITY.indexOf(n); return i === -1 ? 999 : i; };

function groupFields(def: TableDef) {
  const fields = def.fields.filter((f) => !HIDDEN_FIELDS.has(f.name));
  const cfg = TAB_CONFIG[def.table];
  if (!cfg) return [{ id: "basic", fields: [...fields].sort((a, b) => prio(a.name) - prio(b.name)) }];
  const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
  const used = new Set<string>();
  const tabs = cfg.map((tab) => ({
    id: tab.id,
    fields: tab.fields.filter((n) => byName[n]).map((n) => (used.add(n), byName[n])),
  }));
  const rest = fields.filter((f) => !used.has(f.name));
  tabs[0].fields.push(...rest);
  return tabs.filter((tab) => tab.fields.length);
}

/* ---------- form ---------- */
function normalize(def: TableDef, src?: Row): Row {
  const out: Row = {};
  for (const f of def.fields) {
    const v = src?.[f.name];
    if (f.type === "gallery") out[f.name] = Array.isArray(v) ? v : [];
    else if (f.type === "lines") out[f.name] = Array.isArray(v) ? v : v ? String(v).split("\n") : [];
    else if (isToggleField(f)) out[f.name] = v === undefined || v === null || v === "" ? "0" : String(v);
    else out[f.name] = v === undefined || v === null ? "" : v;
  }
  return out;
}

function ItemForm({ def, id, initial, onClose }: { def: TableDef; id: string | number | null; initial?: Row; onClose: () => void }) {
  const { t } = useTranslation();
  const isNew = id === null;
  const create = useCreate(def.table);
  const update = useUpdate(def.table);
  const base = useMemo(() => normalize(def, initial), [def, initial]);
  const { control, handleSubmit, watch, setValue, formState } = useForm<Row>({ defaultValues: base });
  const tabs = useMemo(() => groupFields(def), [def]);
  const [tab, setTab] = useState(tabs[0]?.id);
  const types = useMemo(() => Object.fromEntries(def.fields.map((f) => [f.name, f.type])), [def]);
  const hasSlug = def.fields.some((f) => f.name === "slug");
  const titleName = ["title", "name", "question"].find((n) => def.fields.some((f) => f.name === n));
  const slugTouched = useRef(!isNew);
  const titleVal = titleName ? watch(titleName) : "";
  const saving = create.isPending || update.isPending;

  useEffect(() => {
    if (isNew && hasSlug && !slugTouched.current && titleVal) setValue("slug", slugify(String(titleVal)));
  }, [titleVal, isNew, hasSlug, setValue]);

  const dirty = formState.isDirty;

  const submit = handleSubmit((values) => {
    let keys: string[];
    if (isNew) {
      keys = Object.keys(values).filter((k) => {
        const v = values[k];
        return v !== "" && v != null && !(Array.isArray(v) && v.length === 0);
      });
    } else {
      keys = diffKeys(base, values);
      if (!keys.length) return onClose();
    }
    const body = buildPayload(Object.fromEntries(keys.map((k) => [k, values[k]])), types) as any;
    const done = { onSuccess: onClose };
    if (isNew) create.mutate(body, done);
    else update.mutate({ id: id as string | number, body }, done);
  });
  useSaveShortcut(() => !saving && submit(), true);

  const current = tabs.find((x) => x.id === tab) || tabs[0];
  return (
    <form onSubmit={submit} className="space-y-5">
      <UnsavedGuard dirty={dirty && !saving} />
      {tabs.length > 1 && <Tabs tabs={tabs.map((x) => ({ id: x.id, label: t(`crud.tabs.${x.id}`) }))} value={current.id} onChange={setTab} />}
      <div className="grid gap-5">
        {current.fields.map((f) => (
          <Controller
            key={f.name}
            name={f.name}
            control={control}
            render={({ field }) => (
              <FieldRenderer
                field={f}
                value={field.value}
                hint={f.name === "slug" ? t("crud.slugHint") : undefined}
                onChange={(v) => {
                  if (f.name === "slug") slugTouched.current = true;
                  field.onChange(v);
                }}
              />
            )}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" loading={saving}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}

function EditDrawer({ def, target, onClose }: { def: TableDef; target: "new" | Row; onClose: () => void }) {
  const { t } = useTranslation();
  const id = target === "new" ? null : (target as Row).id;
  const item = useItem(def.table, id);
  return (
    <Drawer open onClose={onClose} title={target === "new" ? t("crud.newItem") : t("crud.editItem")} width="max-w-2xl">
      {id !== null && item.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10" /> <Skeleton className="h-10" /> <Skeleton className="h-32" />
        </div>
      ) : (
        <ItemForm def={def} id={id} initial={id !== null ? (item.data ?? (target as Row)) : undefined} onClose={onClose} />
      )}
    </Drawer>
  );
}

/* ---------- list ---------- */
function Cell({ col, row, def }: { col: string; row: Row; def: TableDef }) {
  const { t } = useTranslation();
  const f = def.fields.find((x) => x.name === col);
  const v = row[col];
  if (f?.type === "image" || col === "image" || col === "logo") {
    return v ? <img src={v} alt="" className="size-11 rounded-lg border border-line object-cover" /> : <span className="text-muted">—</span>;
  }
  if (isToggleField(f)) return v === "1" || v === 1 ? <Badge tone="green">{t("common.yes")}</Badge> : <Badge tone="gray">{t("common.no")}</Badge>;
  if (Array.isArray(v)) return <span dir="auto">{v.length}</span>;
  return (
    <span dir="auto" className="line-clamp-2">
      {v === null || v === undefined || v === "" ? "—" : String(v)}
    </span>
  );
}

function Flags({ row }: { row: Row }) {
  const { t } = useTranslation();
  return (
    <>
      {String(row.featured) === "1" && <Badge>{t("common.featured")}</Badge>}
      {String(row.show_home) === "1" && <Badge tone="blue">{t("common.home")}</Badge>}
    </>
  );
}

function CrudInner({ def }: { def: TableDef }) {
  const { t } = useTranslation();
  const getLabel = useFieldLabel();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const pageFilters = PAGE_FILTERS[def.table];
  const [pageName, setPageName] = useState("");
  const debounced = useDebounced(search);
  const [target, setTarget] = useState<null | "new" | Row>(null);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const del = useDelete(def.table);

  useEffect(() => setPage(1), [debounced, category, pageName]);

  const list = useList(def.table, { page, search: debounced, category, page_name: pageName });
  const rows = list.data?.data ?? [];
  const total = list.data?.pagination?.total ?? rows.length;
  const cols = def.list_columns.length ? def.list_columns : ["title"];
  const tableLabel = t(`tableNames.${def.table}`, { defaultValue: def.label });
  const categories = list.data?.categories ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="me-auto">
          <h2 className="text-xl font-bold text-dark">{tableLabel}</h2>
          <p className="text-sm text-muted">{t("common.items", { count: total })}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" />
          <Input className="ps-9" dir="auto" placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => setTarget("new")}>
          {t("common.addNew")}
        </Button>
      </div>

      {pageFilters && (
        <Pills items={[{ id: "", label: t("common.all") }, ...pageFilters.map((p) => ({ id: p.id, label: t(p.labelKey) }))]} value={pageName} onChange={setPageName} />
      )}
      {categories.length > 0 && (
        <Pills items={[{ id: "", label: t("common.all") }, ...categories.map((c) => ({ id: c, label: c }))]} value={category} onChange={setCategory} />
      )}

      <Card bodyClass="p-0">
        {list.isLoading ? (
          <div className="p-5"><ListSkeleton /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={debounced || category || pageName ? t("common.noResults") : t("crud.emptyTitle")}
            text={debounced || category || pageName ? undefined : t("crud.emptyText")}
            action={!debounced && !category && !pageName ? <Button icon={<Plus className="size-4" />} onClick={() => setTarget("new")}>{t("common.addFirst")}</Button> : undefined}
          />
        ) : (
          <>
            {/* desktop table */}
            <div className={`hidden overflow-x-auto md:block ${list.isFetching ? "opacity-70" : ""}`}>
              <table className="w-full text-sm">
                <thead className="bg-soft text-start text-xs font-semibold uppercase text-muted">
                  <tr>
                    {cols.map((c) => (
                      <th key={c} className="px-4 py-3 text-start">{getLabel(c)}</th>
                    ))}
                    <th className="w-28 px-4 py-3 text-end">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((r) => (
                    <tr key={r.id} className="cursor-pointer hover:bg-soft/60" onClick={() => setTarget(r)}>
                      {cols.map((c, ci) => (
                        <td key={c} className="max-w-xs px-4 py-3 align-middle">
                          <div className="flex flex-wrap items-center gap-2">
                            <Cell col={c} row={r} def={def} />
                            {ci === cols.findIndex((x) => TITLE_KEYS.includes(x)) && <Flags row={r} />}
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <IconBtn label={t("common.edit")} onClick={() => setTarget(r)}><Pencil className="size-4" /></IconBtn>
                          <IconBtn label={t("common.delete")} danger onClick={() => setToDelete(r)}><Trash2 className="size-4" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {rows.map((r) => {
                const imgCol = cols.find((c) => c === "image" || c === "logo" || def.fields.find((f) => f.name === c)?.type === "image");
                const rest = cols.filter((c) => c !== imgCol && !TITLE_KEYS.includes(c));
                return (
                  <li key={r.id} className="flex gap-3 p-4" onClick={() => setTarget(r)}>
                    {imgCol && r[imgCol] && <img src={r[imgCol]} alt="" className="size-14 shrink-0 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 font-semibold text-dark">
                        <span dir="auto" className="truncate">{rowTitle(r)}</span>
                        <Flags row={r} />
                      </div>
                      {rest.slice(0, 3).map((c) => (
                        <div key={c} className="flex gap-2 text-xs text-muted">
                          <span className="shrink-0">{getLabel(c)}:</span>
                          <Cell col={c} row={r} def={def} />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                      <IconBtn label={t("common.edit")} onClick={() => setTarget(r)}><Pencil className="size-4" /></IconBtn>
                      <IconBtn label={t("common.delete")} danger onClick={() => setToDelete(r)}><Trash2 className="size-4" /></IconBtn>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      {list.data?.pagination && <Pagination page={page} pages={list.data.pagination.pages} total={total} onChange={setPage} />}

      {target && <EditDrawer def={def} target={target} onClose={() => setTarget(null)} />}
      <ConfirmDialog
        open={!!toDelete}
        name={toDelete ? rowTitle(toDelete) : ""}
        loading={del.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </div>
  );
}

function IconBtn({ children, label, danger, onClick }: { children: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-lg text-muted transition ${danger ? "hover:bg-danger/10 hover:text-danger" : "hover:bg-main/10 hover:text-main"}`}
    >
      {children}
    </button>
  );
}

export default function CrudList() {
  const { table = "" } = useParams();
  const tables = useTables();
  if (tables.isLoading) return <ListSkeleton />;
  const def = tables.data?.tables.find((x) => x.table === table);
  if (!def) return <Card><EmptyState title="Unknown table" /></Card>;
  return <CrudInner key={table} def={def} />;
}
