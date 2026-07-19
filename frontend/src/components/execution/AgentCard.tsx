import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Loader2, Circle, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/services/types";

interface AgentCardProps {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  errorReason?: string;
  output?: string;
}

const statusStyles: Record<
  AgentStatus,
  {
    ring: string;
    badge: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  done: {
    ring: "border-[oklch(0.72_0.16_160)]/40 bg-[oklch(0.72_0.16_160)]/5",
    badge: "bg-[oklch(0.72_0.16_160)]/12 text-[oklch(0.55_0.16_160)]",
    label: "Complete",
    Icon: CheckCircle2,
  },
  running: {
    ring: "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]",
    badge: "bg-primary/12 text-primary animate-pulse",
    label: "Running",
    Icon: Loader2,
  },
  queued: {
    ring: "border-border/60 bg-white/40 dark:bg-white/[0.01]",
    badge: "bg-muted text-muted-foreground",
    label: "Queued",
    Icon: Circle,
  },
  error: {
    ring: "border-destructive/40 bg-destructive/5",
    badge: "bg-destructive/10 text-destructive",
    label: "Error",
    Icon: AlertTriangle,
  },
};

export function AgentCard({
  name,
  icon: Icon,
  desc,
  status,
  startedAt,
  completedAt,
  errorReason,
  output,
}: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const s = statusStyles[status];

  // Calculate elapsed time
  const getElapsed = () => {
    if (!startedAt) return "";
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const sec = (end - start) / 1000;
    return `${sec.toFixed(1)}s`;
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  };

  const elapsed = getElapsed();

  return (
    <motion.div
      layout
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "glass overflow-hidden rounded-3xl border p-4 transition-all duration-300",
        s.ring
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/[0.03] text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display text-base tracking-tight">{name}</h4>
              <Badge className={cn("rounded-full text-[10px] py-0 px-2 font-normal", s.badge)}>
                {status === "running" && <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />}
                {s.label}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {elapsed && (
            <span className="font-numeric flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" />
              {elapsed}
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-300", isExpanded && "rotate-180")}
            />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (status === "running" || status === "done" || status === "error") && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border/40 pt-3 text-sm">
              {status === "running" && (
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Agent is actively generating reasoning steps...</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="h-full w-1/3 bg-primary rounded-full"
                    />
                  </div>
                </div>
              )}

              {status === "error" && errorReason && (
                <div className="rounded-2xl bg-destructive/5 border border-destructive/10 p-3 text-xs text-destructive">
                  <p className="font-semibold">Pipeline Execution Failed</p>
                  <p className="mt-1 font-mono">{errorReason}</p>
                </div>
              )}

              {status === "done" && (
                <div className="space-y-2">
                  {output ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-xs leading-relaxed">
                      {output.split("\n").map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                          return (
                            <li key={idx} className="ml-3 list-disc my-0.5">
                              {trimmed.substring(1).trim()}
                            </li>
                          );
                        }
                        return <p key={idx} className="my-1">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/80 italic">
                      Execution complete. Outputs synthesized into final report.
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 font-numeric text-[10px] text-muted-foreground/75 border-t border-border/30">
                    {startedAt && (
                      <span>Started: {formatTime(startedAt)}</span>
                    )}
                    {completedAt && (
                      <span>Completed: {formatTime(completedAt)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
