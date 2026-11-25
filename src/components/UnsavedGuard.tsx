import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";
import { ConfirmDialog } from "./ui";

/** Warns before leaving (route change or tab close) while `dirty`. */
export function UnsavedGuard({ dirty }: { dirty: boolean }) {
  const { t } = useTranslation();
  const blocker = useBlocker(dirty);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  return (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      tone="primary"
      title={t("common.unsavedTitle")}
      message={t("common.unsavedMsg")}
      confirmLabel={t("common.leave")}
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    />
  );
}
