/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import type { FieldType } from "../api/types";
import { groupKeys } from "../lib/utils";
import { FieldRenderer } from "./FieldRenderer";
import { Card } from "./ui";

export interface SettingSpec {
  key: string;
  label: string;
  type: FieldType;
}

/** Renders settings as cards. grouped=true splits them by meaning; otherwise one card. */
export function SettingsCards({
  defs, values, onChange, grouped, singleTitle,
}: {
  defs: SettingSpec[];
  values: Record<string, any>;
  onChange: (key: string, v: any) => void;
  grouped: boolean;
  singleTitle?: string;
}) {
  const { t } = useTranslation();
  if (!defs.length) return null;
  const byKey = Object.fromEntries(defs.map((d) => [d.key, d]));

  const body = (keys: string[]) => (
    <div className="grid gap-5">
      {keys.map((k) => (
        <FieldRenderer
          key={k}
          field={{ name: k, type: byKey[k].type, label: byKey[k].label }}
          value={values[k]}
          onChange={(v) => onChange(k, v)}
        />
      ))}
    </div>
  );

  if (!grouped) {
    return <Card title={singleTitle}>{body(defs.map((d) => d.key))}</Card>;
  }
  return (
    <>
      {groupKeys(defs.map((d) => d.key)).map((g) => (
        <Card key={g.id} title={t(`settings.groups.${g.id}`)}>
          {body(g.keys)}
        </Card>
      ))}
    </>
  );
}
