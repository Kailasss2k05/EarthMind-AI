import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Bot,
  LineChart,
  FileBarChart,
  Database,
  Settings,
  Sparkles,
} from "lucide-react";
import logoUrl from "@/assets/earthmind-logo.png";

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
  { title: "New Plan", url: "/plan", icon: Sparkles, primary: true },
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
          <img
            src={logoUrl}
            alt="EarthMind AI"
            className="h-9 w-9 shrink-0 drop-shadow-[0_4px_16px_oklch(0.55_0.24_285/0.35)]"
          />
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight">
                EarthMind <span className="text-primary">AI</span>
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Sustainability OS
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
              <span className="h-2 w-2 rounded-full bg-[oklch(0.65 0.22 290)] shadow-[0_0_12px_oklch(0.65 0.22 290)]" />
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
