"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserData } from "@/shared/types/supabase";
import {
  LayoutDashboard,
  Bot,
  Database,
  GitBranch,
  FileText,
  MessageSquare,
  Settings,
  Users,
  Key,
  BarChart,
} from "lucide-react";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { title: "Agentes", href: "/agents", icon: <Bot size={20} /> },
  { title: "Base de Conhecimento", href: "/knowledge", icon: <Database size={20} /> },
  { title: "Fluxos de Trabalho", href: "/workflow", icon: <GitBranch size={20} /> },
  { title: "Prompts", href: "/prompts", icon: <FileText size={20} /> },
  { title: "Chat", href: "/chat", icon: <MessageSquare size={20} /> },
  { title: "Configurações", href: "/settings", icon: <Settings size={20} /> },
  { title: "API", href: "/api-docs", icon: <Key size={20} /> },
  { title: "Análise", href: "/analytics", icon: <BarChart size={20} /> },
  { title: "Administração", href: "/admin", icon: <Users size={20} />, adminOnly: true },
];

interface DashboardSidebarProps {
  user: UserData;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">Agentes ECOM</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {sidebarItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          v0.1.0 | {new Date().getFullYear()} © Agentes ECOM
        </p>
      </div>
    </aside>
  );
}