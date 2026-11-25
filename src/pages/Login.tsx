import { Eye, EyeOff, Globe } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogin } from "../api/hooks";
import { Button, Field, Input } from "../components/ui";
import { setLang } from "../i18n";
import { useAuth } from "../lib/auth";

const LOGO = "https://alwady.vercel.app/assets/images/logo.jpg";
const BG = "https://alwady.vercel.app/assets/images/video/videoThumb1_2.webp";

export default function Login() {
  const { t, i18n } = useTranslation();
  const { admin, signedIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const login = useLogin();
  const [show, setShow] = useState(false);
  const { register, handleSubmit } = useForm<{ username: string; password: string }>();

  if (admin) return <Navigate to="/" replace />;

  const onSubmit = handleSubmit((v) => {
    if (!v.username || !v.password) return void toast.error(t("login.required"));
    login.mutate(v, {
      onSuccess: ({ token, admin }) => {
        signedIn(token, admin);
        nav((loc.state as { from?: string } | null)?.from || "/", { replace: true });
      },
    });
  });
  const isAr = i18n.language === "ar";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-dark text-white lg:flex lg:flex-col lg:items-center lg:justify-center">
        <img src={BG} alt="" className="absolute inset-0 size-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/70 to-dark/95" />
        <div className="relative max-w-md px-10 text-center">
          <img src={LOGO} alt="" className="mx-auto size-32 rounded-full bg-white object-cover shadow-2xl ring-4 ring-accent/70" />
          <h1 className="mt-6 text-3xl font-bold">{t("brand.name")}</h1>
          <p className="mt-3 text-lg leading-relaxed text-accent">{t("brand.tagline")}</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6">
        <button
          onClick={() => setLang(isAr ? "en" : "ar")}
          className="absolute end-5 top-5 flex h-10 items-center gap-1.5 rounded-[10px] border border-line bg-white px-3 text-sm font-semibold text-dark hover:bg-soft"
        >
          <Globe className="size-4" />
          {isAr ? "EN" : "AR"}
        </button>
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <img src={LOGO} alt="" className="mx-auto size-20 rounded-full object-cover shadow-lg ring-2 ring-accent" />
            <h1 className="mt-3 text-xl font-bold text-dark">{t("brand.name")}</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-line bg-white p-7 shadow-soft">
            <div>
              <h2 className="text-2xl font-bold">
                <span className="text-dark">{t("login.title")}</span>
              </h2>
              <p className="mt-1 text-sm text-muted">{t("login.subtitle")}</p>
            </div>
            <Field label={t("login.username")} htmlFor="u">
              <Input id="u" dir="ltr" autoComplete="username" autoFocus {...register("username")} />
            </Field>
            <Field label={t("login.password")} htmlFor="p">
              <div className="relative">
                <Input id="p" dir="ltr" type={show ? "text" : "password"} autoComplete="current-password" className="pr-11" {...register("password")} />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? t("login.hide") : t("login.show")}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-dark"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" loading={login.isPending} className="w-full">
              {t("login.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
