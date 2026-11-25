import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getToken, setToken } from "../api/client";
import { useLogout, useMe } from "../api/hooks";
import type { Admin } from "../api/types";
import { Loader2 } from "lucide-react";

interface AuthCtx {
  admin: Admin | null;
  loading: boolean;
  signedIn: (token: string, admin: Admin) => void;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [token, setTok] = useState<string | null>(getToken());
  const [admin, setAdmin] = useState<Admin | null>(null);
  const me = useMe(!!token && !admin);
  const logoutMut = useLogout();

  useEffect(() => {
    if (me.data) setAdmin(me.data);
  }, [me.data]);

  const clear = useCallback(() => {
    setToken(null);
    setTok(null);
    setAdmin(null);
    qc.clear();
  }, [qc]);

  // 401 from any request, or an invalid token on startup
  useEffect(() => {
    window.addEventListener("auth:unauthorized", clear);
    return () => window.removeEventListener("auth:unauthorized", clear);
  }, [clear]);
  useEffect(() => {
    if (me.isError) clear();
  }, [me.isError, clear]);

  const value = useMemo<AuthCtx>(
    () => ({
      admin,
      loading: !!token && !admin && !me.isError,
      signedIn: (t, a) => {
        setToken(t);
        setTok(t);
        setAdmin(a);
      },
      logout: () => {
        logoutMut.mutate();
        clear();
      },
    }),
    [admin, token, me.isError, clear, logoutMut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function Splash() {
  return (
    <div className="grid min-h-screen place-items-center">
      <Loader2 className="size-8 animate-spin text-main" />
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Splash />;
  if (!admin) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
