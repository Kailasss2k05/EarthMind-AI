import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bot,
  LineChart,
  FileBarChart,
  Database,
  Settings,
  Leaf,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Reports", url: "/reports", icon: FileBarChart },
  { title: "Data Sources", url: "/data-sources", icon: Database },
];

const bottomItems = [{ title: "Settings", url: "/settings", icon: Settings }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader className="px-3 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.68_0.14_148)] to-[oklch(0.62_0.13_220)] shadow-[0_8px_24px_-8px_oklch(0.42_0.09_158/0.6)]">
            <Leaf className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3 text-[oklch(0.85_0.16_85)]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg tracking-tight">EarthMind</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                AI Platform
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-3 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/8 to-transparent p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-[oklch(0.68_0.14_148)] shadow-[0_0_12px_oklch(0.68_0.14_148)]" />
              All agents nominal
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              12 workflows running · watsonx.ai
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
