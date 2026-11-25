/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { buildPagePayload } from "../api/payload";
import { usePage, useSavePage } from "../api/hooks";
import type { PageData, Row } from "../api/types";
import { FieldRenderer } from "../components/FieldRenderer";
import { SaveBar } from "../components/SaveBar";
import { SettingsCards } from "../components/SettingsCards";
import { Button, Card, EmptyState, ListSkeleton, TitleText } from "../components/ui";
import { UnsavedGuard } from "../components/UnsavedGuard";
import { TABLE_NAMES } from "../layouts/nav";
import { isEqual } from "../lib/utils";

const SECTION_FIELDS = ["badge", "title", "title_accent", "text", "button_text", "image", "image2", "image3"] as const;
const FIELD_TYPE: Record<string, string> = {
  badge: "text", title: "text", title_accent: "text", text: "textarea", button_text: "text", image: "image", image2: "image", image3: "image",
};
const ALIASES: Record<string, string> = { blog: "blog_posts", posts: "blog_posts", faq: "faqs", why: "features", how: "steps" };
const tableFor = (key: string) => (TABLE_NAMES as readonly string[]).includes(key) ? key : ALIASES[key];

type Draft = { sections: Record<string, Row>; settings: Record<string, any> };

function toDraft(page: PageData): Draft {
  const sections: Record<string, Row> = {};
  for (const [k, s] of Object.entries(page.sections || {})) {
    sections[k] = Object.fromEntries(SECTION_FIELDS.filter((f) => f in s || f === "title").map((f) => [f, s[f] ?? ""]));
  }
  const settings: Record<string, any> = {};
  for (const [k, s] of Object.entries(page.settings || {})) settings[k] = s.value ?? (s.type === "lines" ? [] : "");
  return { sections, settings };
}

function SectionCard({ skey, values, onField }: { skey: string; values: Row; onField: (f: string, v: any) => void }) {
  const { t, i18n } = useTranslation();
  const [more, setMore] = useState(false);
  const fields = Object.keys(values);
  const visible = fields.filter((f) => f === "title" || more || (values[f] !== "" && values[f] != null));
  const hidden = fields.length - visible.length;
  const name = i18n.exists(`sections.${skey}`) ? t(`sections.${skey}`) : skey;

  return (
    <Card
      title={
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-muted">{name}</div>
          <div className="truncate text-base">
            <TitleText main={values.title || "—"} accent={values.title_accent} />
          </div>
        </div>
      }
    >
      <div className="grid gap-5">
        {visible.map((f) => (
          <FieldRenderer key={f} field={{ name: f, type: FIELD_TYPE[f] }} value={values[f]} onChange={(v) => onField(f, v)} />
        ))}
      </div>
      {hidden > 0 && !more && (
        <button type="button" onClick={() => setMore(true)} className="mt-4 text-sm font-semibold text-main hover:underline">
          {t("common.showMore")}
        </button>
      )}
    </Card>
  );
}

function Lists({ lists }: { lists: Record<string, Row[]> }) {
  const { t } = useTranslation();
  const entries = Object.entries(lists || {}).filter(([, rows]) => Array.isArray(rows));
  if (!entries.length) return null;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-dark">{t("editor.lists")}</h2>
        <p className="text-sm text-muted">{t("editor.listsHint")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map(([key, rows]) => {
          const table = tableFor(key);
          const label = table ? t(`tableNames.${table}`) : key;
          return (
            <Card
              key={key}
              title={
                <span>
                  {label} <span className="text-sm font-normal text-muted">({rows.length})</span>
                </span>
              }
              actions={
                table && (
                  <Link to={`/content/${table}`}>
                    <Button size="sm" variant="secondary">
                      {t("common.manage")}
                    </Button>
                  </Link>
                )
              }
              bodyClass="p-0"
            >
              <ul className="divide-y divide-line">
                {rows.slice(0, 5).map((r, i) => (
                  <li key={r.id ?? i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                    {r.image && <img src={r.image} alt="" className="size-8 shrink-0 rounded-md object-cover" />}
                    <span dir="auto" className="truncate">
                      {r.title || r.name || r.question || r.label || r.email || `#${r.id}`}
                    </span>
                  </li>
                ))}
                {rows.length > 5 && <li className="px-5 py-2 text-xs text-muted">{t("common.more", { count: rows.length - 5 })}</li>}
                {rows.length === 0 && <li className="px-5 py-3 text-sm text-muted">{t("common.none")}</li>}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Editor({ name, page }: { name: string; page: PageData }) {
  const { t } = useTranslation();
  const save = useSavePage(name);
  const initial = useMemo(() => toDraft(page), [page]);
  const [draft, setDraft] = useState<Draft>(initial);

  const sectionKeys = Object.keys(draft.sections).sort((a, b) => Number(page.sections[a]?.sort_order ?? 0) - Number(page.sections[b]?.sort_order ?? 0));
  const changedSections = sectionKeys.filter((k) => !isEqual(draft.sections[k], initial.sections[k]));
  const changedSettings = Object.keys(draft.settings).filter((k) => !isEqual(draft.settings[k], initial.settings[k]));
  const count = changedSections.length + changedSettings.length;

  const settingDefs = Object.entries(page.settings || {}).map(([key, s]) => ({ key, label: s.label, type: s.type }));
  const settingTypes = Object.fromEntries(settingDefs.map((d) => [d.key, d.type]));

  const onSave = () => {
    const sections: Record<string, Row> = {};
    for (const k of changedSections) {
      sections[k] = Object.fromEntries(Object.keys(draft.sections[k]).filter((f) => !isEqual(draft.sections[k][f], initial.sections[k][f])).map((f) => [f, draft.sections[k][f]]));
    }
    const settings = Object.fromEntries(changedSettings.map((k) => [k, draft.settings[k]]));
    save.mutate(buildPagePayload({ sections, settings }, settingTypes));
  };

  const isLayout = name === "layout";
  const settingsCards = (
    <SettingsCards
      defs={settingDefs}
      values={draft.settings}
      onChange={(k, v) => setDraft((d) => ({ ...d, settings: { ...d.settings, [k]: v } }))}
      grouped={isLayout}
      singleTitle={t("editor.pageContent")}
    />
  );

  return (
    <div className="space-y-5">
      <UnsavedGuard dirty={count > 0 && !save.isPending} />
      {isLayout && settingsCards}
      {sectionKeys.map((k) => (
        <SectionCard
          key={k}
          skey={k}
          values={draft.sections[k]}
          onField={(f, v) => setDraft((d) => ({ ...d, sections: { ...d.sections, [k]: { ...d.sections[k], [f]: v } } }))}
        />
      ))}
      {!isLayout && settingsCards}
      {!sectionKeys.length && !settingDefs.length && <Card><EmptyState title={t("editor.noSections")} /></Card>}
      <Lists lists={page.lists} />
      <SaveBar count={count} saving={save.isPending} onSave={onSave} onDiscard={() => setDraft(initial)} />
    </div>
  );
}

export default function PageEditor() {
  const { name = "home" } = useParams();
  const q = usePage(name);
  if (q.isLoading) return <ListSkeleton rows={4} />;
  if (q.isError || !q.data) return <Card><EmptyState title={(q.error as Error)?.message || "Error"} /></Card>;
  return <Editor key={`${name}-${q.dataUpdatedAt}`} name={name} page={q.data} />;
}
