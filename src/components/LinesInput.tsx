import { GripVertical, Plus, X } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input } from "./ui";

/** Reorder `arr` by moving `from` to `to`. */
export function move<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function LinesInput({ value, onChange, id }: { value: string[] | undefined; onChange: (v: string[]) => void; id?: string }) {
  const { t } = useTranslation();
  const lines = Array.isArray(value) ? value : [];
  const drag = useRef<number | null>(null);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex items-center gap-2"
          draggable
          onDragStart={(e) => {
            // only drag from the handle, not while selecting text in the input
            if ((e.target as HTMLElement).tagName === "INPUT") return e.preventDefault();
            drag.current = i;
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (drag.current !== null) onChange(move(lines, drag.current, i));
            drag.current = null;
          }}
        >
          <span className="cursor-grab text-muted active:cursor-grabbing" aria-hidden>
            <GripVertical className="size-5" />
          </span>
          <Input
            id={i === 0 ? id : undefined}
            dir="auto"
            value={line}
            onChange={(e) => onChange(lines.map((l, j) => (j === i ? e.target.value : l)))}
          />
          <button
            type="button"
            aria-label={t("common.remove")}
            onClick={() => onChange(lines.filter((_, j) => j !== i))}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <Button size="sm" variant="secondary" icon={<Plus className="size-4" />} onClick={() => onChange([...lines, ""])}>
        {t("common.addRow")}
      </Button>
    </div>
  );
}
