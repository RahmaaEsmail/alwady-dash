/* eslint-disable @typescript-eslint/no-explicit-any */
export type FieldType = "text" | "textarea" | "image" | "gallery" | "lines" | "date" | "number" | "select";

export interface FieldDef {
  name: string;
  type: FieldType;
  options?: string[];
}
export interface TableDef {
  table: string;
  label: string;
  list_columns: string[];
  fields: FieldDef[];
}
export interface SettingDef {
  key: string;
  label: string;
  type: FieldType;
}
export interface TablesData {
  tables: TableDef[];
  settings: SettingDef[];
}

export type Row = Record<string, any>;

export interface PageSetting {
  label: string;
  type: FieldType;
  value: any;
}
export interface PageData {
  page: string;
  label: string;
  sections: Record<string, Row>;
  settings: Record<string, PageSetting>;
  lists: Record<string, Row[]>;
}
export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
export interface ListResult {
  data: Row[];
  pagination: Pagination;
  categories?: string[];
}
export interface Message {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  source: string;
  is_read: number | string;
  created_at: string;
}
export interface Admin {
  id: number | string;
  username: string;
}
