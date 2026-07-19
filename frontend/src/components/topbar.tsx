import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Bell, Search, Command } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-background/60 px-4 backdrop-blur-xl sm:px-8">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search agents, reports, emissions data…"
          className="h-10 rounded-full border-border/60 bg-muted/40 pl-9 pr-14 focus-visible:ring-primary/30"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          className="hidden rounded-full bg-gradient-to-r from-[oklch(0.42 0.22 285)] to-[oklch(0.55 0.24 285)] text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.42 0.22 285/0.6)] sm:inline-flex"
        >
          New workflow
        </Button>
        <Avatar className="h-9 w-9 border border-border/60">
          <AvatarFallback className="bg-gradient-to-br from-[oklch(0.62 0.18 275)] to-[oklch(0.42 0.22 285)] text-xs font-semibold text-white">
            AE
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
