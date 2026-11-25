import { Plus, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { IMAGE_ACCEPT, useObjectUrl } from "./ImageInput";
import { move } from "./LinesInput";

export type GalleryItem = string | File;

function Thumb({ item }: { item: GalleryItem }) {
  const local = useObjectUrl(item instanceof File ? item : null);
  return <img src={local || (item as string)} alt="" className="size-full object-cover" draggable={false} />;
}

export function GalleryInput({ value, onChange, id }: { value: GalleryItem[] | undefined; onChange: (v: GalleryItem[]) => void; id?: string }) {
  const { t } = useTranslation();
  const items = Array.isArray(value) ? value : [];
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<number | null>(null);

  return (
    <div>
      <input
        id={id}
        ref={fileRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onChange([...items, ...files]);
          e.target.value = "";
        }}
      />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={`${i}-${it instanceof File ? it.name : it}`}
            draggable
            onDragStart={() => (drag.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag.current !== null) onChange(move(items, drag.current, i));
              drag.current = null;
            }}
            className={cn("group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-soft active:cursor-grabbing", it instanceof File ? "border-accent" : "border-line")}
          >
            <Thumb item={it} />
            <button
              type="button"
              aria-label={t("common.remove")}
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="absolute end-1 top-1 grid size-6 place-items-center rounded-full bg-dark/80 text-white opacity-90 hover:bg-danger"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line text-muted transition hover:border-main hover:text-main"
        >
          <span className="flex flex-col items-center gap-1 text-xs font-medium">
            <Plus className="size-6" />
            {t("common.addImages")}
          </span>
        </button>
      </div>
    </div>
  );
}
