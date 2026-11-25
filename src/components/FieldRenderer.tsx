/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { FieldType } from "../api/types";
import { GalleryInput } from "./GalleryInput";
import { ImageInput } from "./ImageInput";
import { LinesInput } from "./LinesInput";
import { Field, Input, Select, Textarea, Toggle, useFieldLabel } from "./ui";

export interface FieldSpec {
  name: string;
  type: FieldType | string;
  options?: string[];
  label?: string; // API fallback label
}

interface Props {
  field: FieldSpec;
  value: any;
  onChange: (v: any) => void;
  error?: string;
  hint?: string;
  /** override label */
  label?: string;
}

const isToggle = (o?: string[]) => !!o && o.length === 2 && o.includes("1") && o.includes("0");

/** One component renders every field type. Used by CRUD drawer, page editor and settings. */
export function FieldRenderer({ field, value, onChange, error, hint, label }: Props) {
  const { t } = useTranslation();
  const getLabel = useFieldLabel();
  const id = useId();
  const text = label ?? getLabel(field.name, field.label);
  const { type, options } = field;

  // Toggle renders its own inline label.
  if (type === "select" && isToggle(options)) {
    return (
      <Field error={error} hint={hint}>
        <Toggle id={id} checked={String(value) === "1"} onChange={(v) => onChange(v ? "1" : "0")} label={text} />
      </Field>
    );
  }

  let control: React.ReactNode;
  switch (type) {
    case "textarea":
      control = <Textarea id={id} dir="auto" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "image":
      control = <ImageInput id={id} value={value} onChange={onChange} />;
      break;
    case "gallery":
      control = <GalleryInput id={id} value={value} onChange={onChange} />;
      break;
    case "lines":
      control = <LinesInput id={id} value={Array.isArray(value) ? value : value ? String(value).split("\n") : []} onChange={onChange} />;
      break;
    case "date":
      control = <Input id={id} type="date" dir="ltr" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      control = <Input id={id} type="number" dir="ltr" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "select":
      control = (
        <Select id={id} dir="auto" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t("common.none")}</option>
          {(options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
      break;
    default:
      control = <Input id={id} dir="auto" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <Field label={text} htmlFor={id} error={error} hint={hint}>
      {control}
    </Field>
  );
}
