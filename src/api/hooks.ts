/* eslint-disable @typescript-eslint/no-explicit-any */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "../i18n";
import { api, setToken } from "./client";
import type { Admin, ListResult, Message, PageData, Pagination, Row, TablesData } from "./types";

const unwrap = (r: any) => (r && r.data !== undefined ? r.data : r);
const ok = (r: any, fallbackKey = "common.saved") => toast.success(r?.message || i18n.t(fallbackKey));

/* ---------- auth ---------- */
export function useLogin() {
  return useMutation({
    mutationFn: async (v: { username: string; password: string }) => {
      const r = await api("login", { method: "POST", body: v });
      return { token: r.token as string, admin: (r.admin || unwrap(r)?.admin) as Admin };
    },
    onSuccess: ({ token }) => setToken(token),
  });
}
export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    enabled,
    retry: false,
    queryFn: async () => {
      const r = await api("me");
      return (r.admin || unwrap(r)?.admin || unwrap(r)) as Admin;
    },
  });
}
export function useLogout() {
  return useMutation({ mutationFn: () => api("logout", { method: "POST" }).catch(() => null) });
}
export function useChangePassword() {
  return useMutation({
    mutationFn: (v: { old_password: string; new_password: string }) => api("change_password", { method: "POST", body: v }),
    onSuccess: (r) => ok(r),
  });
}

/* ---------- dashboard + meta ---------- */
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => unwrap(await api("dashboard")) as { counts: Record<string, number>; latest_messages: Message[] },
    refetchInterval: 60_000,
  });
}
export function useTables() {
  return useQuery({
    queryKey: ["tables"],
    staleTime: Infinity,
    queryFn: async () => unwrap(await api("tables")) as TablesData,
  });
}

/* ---------- pages ---------- */
export function usePage(name: string) {
  return useQuery({
    queryKey: ["page", name],
    queryFn: async () => unwrap(await api("page_get", { params: { name } })) as PageData,
  });
}
export function useSavePage(name: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData | Record<string, unknown>) => api("page_update", { method: "POST", params: { name }, body }),
    onSuccess: (r) => {
      qc.setQueryData(["page", name], unwrap(r));
      qc.invalidateQueries({ queryKey: ["settings"] });
      ok(r);
    },
  });
}

/* ---------- CRUD ---------- */
export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  page_name?: string;
}
export function useList(table: string, p: ListParams) {
  return useQuery({
    queryKey: ["list", table, p],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const r = await api("list", { params: { table, per_page: 20, ...p } });
      return { data: r.data || [], pagination: r.pagination as Pagination, categories: r.categories } as ListResult;
    },
  });
}
export function useItem(table: string, id: string | number | null) {
  return useQuery({
    queryKey: ["item", table, id],
    enabled: id !== null,
    gcTime: 0,
    queryFn: async () => unwrap(await api("get", { params: { table, id: id as any } })) as Row,
  });
}
export function useCreate(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData | Record<string, unknown>) => api("create", { method: "POST", params: { table }, body }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["list", table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      ok(r);
    },
  });
}
export function useUpdate(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: FormData | Record<string, unknown> }) =>
      api("update", { method: "POST", params: { table, id }, body }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["list", table] });
      ok(r);
    },
  });
}
export function useDelete(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api("delete", { method: "POST", params: { table, id } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["list", table] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      ok(r, "common.deleted");
    },
  });
}

/* ---------- settings ---------- */
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => unwrap(await api("settings")) as Record<string, any>,
  });
}
export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FormData | Record<string, unknown>) => api("settings_update", { method: "POST", body }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["page"] });
      ok(r);
    },
  });
}

/* ---------- inbox ---------- */
export interface MessageParams {
  page?: number;
  per_page?: number;
  source?: string;
  unread?: number;
  search?: string;
}
export function useMessages(p: MessageParams) {
  return useQuery({
    queryKey: ["messages", p],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const r = await api("messages", { params: { per_page: 20, ...p } });
      return { data: (r.data || []) as Message[], pagination: r.pagination as Pagination };
    },
  });
}
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api("message_read", { method: "POST", params: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api("message_delete", { method: "POST", params: { id } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      ok(r, "common.deleted");
    },
  });
}
export function useNewsletter() {
  return useQuery({
    queryKey: ["newsletter"],
    queryFn: async () => (unwrap(await api("newsletter")) || []) as { id: number | string; email: string; created_at: string }[],
  });
}
export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api("newsletter_delete", { method: "POST", params: { id } }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["newsletter"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      ok(r, "common.deleted");
    },
  });
}
