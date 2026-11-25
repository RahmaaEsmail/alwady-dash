import {
  Award, BarChart3, Briefcase, FileText, HelpCircle, Home, Info, KeyRound, LayoutDashboard, ListOrdered, Mail,
  MessageSquare, Newspaper, PanelTop, Phone, Settings, Sparkles, Star, Target, Users, Wrench, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  labelKey: string; // i18n key
  badge?: "unread";
}
export interface NavGroup {
  titleKey?: string;
  items: NavItem[];
}

export const PAGE_NAMES = ["layout", "home", "about", "services", "service_details", "projects", "project_details", "blog", "blog_details", "contact", "faq"] as const;
export const PAGE_ICONS: Record<string, LucideIcon> = {
  layout: PanelTop, home: Home, about: Info, services: Wrench, service_details: FileText, projects: Briefcase,
  project_details: FileText, blog: Newspaper, blog_details: FileText, contact: Phone, faq: HelpCircle,
};
export const TABLE_NAMES = ["services", "projects", "blog_posts", "faqs", "stats", "goals", "features", "steps", "certificates", "partners"] as const;
export const TABLE_ICONS: Record<string, LucideIcon> = {
  services: Wrench, projects: Briefcase, blog_posts: Newspaper, faqs: HelpCircle, stats: BarChart3, goals: Target,
  features: Star, steps: ListOrdered, certificates: Award, partners: Users,
};

export const NAV: NavGroup[] = [
  { items: [{ to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" }] },
  { titleKey: "nav.pages", items: PAGE_NAMES.map((n) => ({ to: `/pages/${n}`, icon: PAGE_ICONS[n], labelKey: `pageNames.${n}` })) },
  { titleKey: "nav.content", items: TABLE_NAMES.map((n) => ({ to: `/content/${n}`, icon: TABLE_ICONS[n], labelKey: `tableNames.${n}` })) },
  {
    titleKey: "nav.inbox",
    items: [
      { to: "/messages", icon: MessageSquare, labelKey: "nav.messages", badge: "unread" },
      { to: "/newsletter", icon: Mail, labelKey: "nav.newsletter" },
    ],
  },
  {
    titleKey: "nav.settings",
    items: [
      { to: "/settings", icon: Settings, labelKey: "nav.generalSettings" },
      { to: "/password", icon: KeyRound, labelKey: "nav.password" },
    ],
  },
];
export { Sparkles };
