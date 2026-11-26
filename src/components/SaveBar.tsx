import { Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSaveShortcut } from "../lib/utils";
import { Button } from "./ui";

/** Sticky bar shown only when something changed. Ctrl/Cmd+S saves. */
export function SaveBar({ count, saving, onSave, onDiscard }: { count: number; saving?: boolean; onSave: () => void; onDiscard: () => void }) {
  const { t } = useTranslation();
  const visible = count > 0;
  useSaveShortcut(() => !saving && onSave(), visible);
  if (!visible) return null;
  return (
    <div className="anim-rise fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 shadow-[0_-4px_20px_rgba(15,58,107,0.1)] backdrop-blur lg:ps-64">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-dark">
          <span className="size-2.5 rounded-full bg-accent" />
          {t("common.changes", { count })}
          <span className="hidden text-xs font-normal text-muted sm:inline">· {t("editor.saveBarHint")}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDiscard} disabled={saving}>
            {t("common.discard")}
          </Button>
          <Button onClick={onSave} disabled={saving} icon={saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}>
            {t("common.saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
}
