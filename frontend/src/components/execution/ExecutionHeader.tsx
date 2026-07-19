import React from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionHeaderProps {
  isConnected: boolean;
  requestId?: string;
  isCompleted: boolean;
}

export function ExecutionHeader({
  isConnected,
  requestId,
  isCompleted,
}: ExecutionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/50 pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="font-display text-xl tracking-tight sm:text-2xl">
          Live Execution Pipeline
        </h3>
        <p className="text-xs text-muted-foreground">
          {isCompleted
            ? "Multi-agent optimization cycle complete."
            : "Orchestrated by LangGraph multi-agent runtime."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {requestId && (
          <span className="font-numeric rounded-full bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground border border-border/30">
            Trace ID: {requestId.slice(0, 8)}...
          </span>
        )}

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all duration-300",
            isConnected
              ? "border border-[oklch(0.72_0.16_160)]/30 bg-[oklch(0.72_0.16_160)]/10 text-[oklch(0.55_0.16_160)]"
              : "border border-border bg-muted text-muted-foreground"
          )}
        >
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3 animate-pulse" />
              Connected
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Disconnected
            </>
          )}
        </span>

        {!isCompleted && isConnected && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing
          </span>
        )}
      </div>
    </div>
  );
}
