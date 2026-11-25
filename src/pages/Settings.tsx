/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { buildPayload } from "../api/payload";
import { useSaveSettings, useSettings, useTables } from "../api/hooks";
import type { SettingDef } from "../api/types";
import { SaveBar } from "../components/SaveBar";
import { SettingsCards } from "../components/SettingsCards";
import { ListSkeleton } from "../components/ui";
import { UnsavedGuard } from "../components/UnsavedGuard";
import { isEqual } from "../lib/utils";

function Form({ defs, values }: { defs: SettingDef[]; values: Record<string, any> }) {
  const save = useSaveSettings();
  const initial = useMemo(() => Object.fromEntries(defs.map((d) => [d.key, values[d.key] ?? (d.type === "lines" ? [] : "")])), [defs, values]);
  const [draft, setDraft] = useState<Record<string, any>>(initial);
  const changed = Object.keys(draft).filter((k) => !isEqual(draft[k], initial[k]));

  const onSave = () => {
    const types = Object.fromEntries(defs.map((d) => [d.key, d.type]));
    save.mutate(buildPayload(Object.fromEntries(changed.map((k) => [k, draft[k]])), types) as any);
  };

  return (
    <div className="space-y-5">
      <UnsavedGuard dirty={changed.length > 0 && !save.isPending} />
      <SettingsCards defs={defs} values={draft} onChange={(k, v) => setDraft((d) => ({ ...d, [k]: v }))} grouped />
      <SaveBar count={changed.length} saving={save.isPending} onSave={onSave} onDiscard={() => setDraft(initial)} />
    </div>
  );
}

export default function Settings() {
  const tables = useTables();
  const settings = useSettings();
  if (tables.isLoading || settings.isLoading || !tables.data || !settings.data) return <ListSkeleton rows={4} />;
  return <Form key={settings.dataUpdatedAt} defs={tables.data.settings} values={settings.data} />;
}
