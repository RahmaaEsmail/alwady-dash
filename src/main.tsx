import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { ApiError } from "./api/client";
import i18n from "./i18n";
import { AuthProvider } from "./lib/auth";
import { router } from "./routes";
import "./index.css";

const report = (err: unknown) => {
  const e = err as ApiError;
  if (e?.status === 401) return;
  toast.error(e?.status === 0 ? i18n.t("common.networkError") : e?.message || "Error");
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: report }),
  mutationCache: new MutationCache({ onError: report }),
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false, staleTime: 15_000 } },
});

function App() {
  const { i18n: i } = useTranslation();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster richColors position="top-center" dir={i.language === "ar" ? "rtl" : "ltr"} toastOptions={{ style: { fontFamily: "inherit" } }} />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
