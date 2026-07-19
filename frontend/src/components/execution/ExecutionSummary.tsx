import React from "react";
import { Activity, Clock, CheckCircle2, Bot } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/ui-parts";

interface ExecutionSummaryProps {
  overallProgress: number;
  doneCount: number;
  totalCount: number;
  activeAgentName?: string;
  activeAgentIcon?: React.ComponentType<{ className?: string }>;
  activeAgentDesc?: string;
  elapsedTime: string;
}

export function ExecutionSummary({
  overallProgress,
  doneCount,
  totalCount,
  activeAgentName,
  activeAgentIcon: ActiveIcon,
  activeAgentDesc,
  elapsedTime,
}: ExecutionSummaryProps) {
  return (
    <Panel className="overflow-hidden bg-white/40 dark:bg-white/[0.02]">
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Overall progress
          </p>
          <p className="mt-2 font-display text-4xl tracking-tight">
            <span className="font-numeric">{overallProgress}%</span>
            <span className="ml-2 text-base text-muted-foreground">
              {doneCount} / {totalCount} agents
            </span>
          </p>
          <Progress value={overallProgress} className="mt-4 h-2" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Currently active
          </p>
          <div className="mt-2 flex items-center gap-3">
            {ActiveIcon && <ActiveIcon className="h-5 w-5 text-primary" />}
            <span className="font-display text-2xl">
              {activeAgentName ?? "Idle / Waiting"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {activeAgentDesc ?? "All agents standing by."}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Time Elapsed
          </p>
          <p className="mt-2 flex items-center gap-2 font-display text-2xl">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-numeric">{elapsedTime || "0.0s"}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Estimated runtime: <span className="font-numeric">45–90s</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}
