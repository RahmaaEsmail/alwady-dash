/* eslint-disable @typescript-eslint/no-explicit-any */
type Values = Record<string, any>;
type Types = Record<string, string>;

const isFile = (v: unknown): v is File => typeof File !== "undefined" && v instanceof File;

/** Deep check for a File anywhere in the value. */
export function hasFile(v: unknown): boolean {
  if (isFile(v)) return true;
  if (Array.isArray(v)) return v.some(hasFile);
  if (v && typeof v === "object") return Object.values(v as object).some(hasFile);
  return false;
}

const cleanLines = (arr: unknown[]) => arr.map((s) => String(s ?? "").trim()).filter(Boolean);

/** Append one field to a FormData according to its type. */
function appendField(fd: FormData, value: any, type: string | undefined, fileKey: string, textKey: string) {
  if (isFile(value)) {
    fd.append(fileKey, value);
  } else if (type === "gallery" && Array.isArray(value)) {
    const keep: string[] = [];
    for (const item of value) {
      if (isFile(item)) fd.append(`${fileKey}[]`, item);
      else if (item) keep.push(String(item));
    }
    fd.append(`${textKey}_keep`, JSON.stringify(keep));
  } else if (Array.isArray(value)) {
    fd.append(textKey, cleanLines(value).join("\n"));
  } else {
    fd.append(textKey, value === null || value === undefined ? "" : String(value));
  }
}

/**
 * Flat payload (CRUD create/update, general settings).
 * JSON when there are no files and no gallery fields; otherwise FormData.
 */
export function buildPayload(values: Values, types: Types = {}): FormData | Values {
  const needsForm = hasFile(values) || Object.keys(values).some((k) => types[k] === "gallery");
  if (!needsForm) {
    const out: Values = {};
    for (const [k, v] of Object.entries(values)) out[k] = Array.isArray(v) ? cleanLines(v) : (v ?? "");
    return out;
  }
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) appendField(fd, v, types[k], k, k);
  return fd;
}

/** Page payload: { sections: {key:{field:value}}, settings: {key:value} }. */
export function buildPagePayload(
  values: { sections?: Record<string, Values>; settings?: Values },
  settingTypes: Types = {},
): FormData | Values {
  if (!hasFile(values)) {
    const settings: Values = {};
    for (const [k, v] of Object.entries(values.settings || {})) settings[k] = Array.isArray(v) ? cleanLines(v) : (v ?? "");
    return { sections: values.sections || {}, settings };
  }
  const fd = new FormData();
  for (const [sKey, fields] of Object.entries(values.sections || {})) {
    for (const [f, v] of Object.entries(fields)) {
      appendField(fd, v, undefined, `${sKey}__${f}`, `sections[${sKey}][${f}]`);
    }
  }
  for (const [k, v] of Object.entries(values.settings || {})) {
    appendField(fd, v, settingTypes[k], k, `settings[${k}]`);
  }
  return fd;
}
