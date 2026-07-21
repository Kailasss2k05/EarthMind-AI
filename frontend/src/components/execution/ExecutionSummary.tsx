import React from "react";
import { Activity, Clock, CheckCircle2, Database, Globe, BookOpen } from "lucide-react";
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
  retrievedChunks?: number;
  retrievedDomains?: string[];
  referenceCount?: number;
}

export function ExecutionSummary({
  overallProgress,
  doneCount,
  totalCount,
  activeAgentName,
  activeAgentIcon: ActiveIcon,
  activeAgentDesc,
  elapsedTime,
  retrievedChunks,
  retrievedDomains,
  referenceCount,
}: ExecutionSummaryProps) {
  const hasRagStats = retrievedChunks !== undefined || retrievedDomains !== undefined;

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

      {/* RAG stats row — visible once retrieval data is available */}
      {hasRagStats && (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Retrieved Docs:</span>
            <span className="font-numeric font-semibold">
              {retrievedChunks ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Domains:</span>
            <span className="font-semibold">
              {retrievedDomains && retrievedDomains.length > 0
                ? retrievedDomains.join(", ")
                : "—"}
            </span>
          </div>
          {referenceCount !== undefined && (
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">References:</span>
              <span className="font-numeric font-semibold">{referenceCount}</span>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
