import { ImageOff, Link2, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input } from "./ui";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

export function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
}

interface Props {
  value: string | File | null | undefined;
  onChange: (v: string | File) => void;
  id?: string;
}

export function ImageInput({ value, onChange, id }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [url, setUrl] = useState("");
  const file = value instanceof File ? value : null;
  const local = useObjectUrl(file);
  const src = local || (typeof value === "string" ? value : "");

  const applyUrl = () => {
    if (url.trim()) onChange(url.trim());
    setUrlMode(false);
    setUrl("");
  };

  return (
    <div className="space-y-2">
      <div className="grid aspect-video w-full max-w-sm place-items-center overflow-hidden rounded-xl border border-line bg-soft">
        {src ? (
          <img src={src} alt="" className="size-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.2")} />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted">
            <ImageOff className="size-7" />
            <span className="text-xs">{t("common.noImage")}</span>
          </div>
        )}
      </div>
      <input
        id={id}
        ref={fileRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
          {t("common.upload")}
        </Button>
        <Button size="sm" variant="secondary" icon={<Link2 className="size-4" />} onClick={() => setUrlMode((v) => !v)}>
          {t("common.useUrl")}
        </Button>
        {src && (
          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10" icon={<Trash2 className="size-4" />} onClick={() => onChange("")}>
            {t("common.remove")}
          </Button>
        )}
      </div>
      {urlMode && (
        <div className="flex max-w-sm gap-2">
          <Input
            dir="ltr"
            autoFocus
            value={url}
            placeholder={t("common.urlPlaceholder")}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
          />
          <Button size="sm" onClick={applyUrl} className="h-auto">
            {t("common.apply")}
          </Button>
        </div>
      )}
    </div>
  );
}
