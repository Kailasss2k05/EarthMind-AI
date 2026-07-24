import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  accent = "leaf",
  index = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  icon: LucideIcon;
  accent?: "leaf" | "ocean" | "solar" | "violet";
  index?: number;
}) {
  const positive = (delta ?? 0) >= 0;
  const accentMap: Record<string, string> = {
    leaf: "from-[oklch(0.65 0.22 290)]/25 to-transparent text-[oklch(0.42 0.22 285)]",
    ocean: "from-[oklch(0.62 0.18 275)]/25 to-transparent text-[oklch(0.45 0.20 275)]",
    solar: "from-[oklch(0.85 0.08 290)]/30 to-transparent text-[oklch(0.55 0.15 290)]",
    violet: "from-[oklch(0.68 0.20 290)]/25 to-transparent text-[oklch(0.55_0.20_290)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass group relative overflow-hidden rounded-3xl p-5"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-70 transition-opacity group-hover:opacity-100",
          accentMap[accent],
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl tracking-tight">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div className={cn("rounded-2xl bg-gradient-to-br p-2.5", accentMap[accent])}>
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
              positive
                ? "bg-[oklch(0.65 0.22 290)]/15 text-[oklch(0.42 0.22 285)]"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass rounded-3xl p-5 sm:p-6", className)}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-display text-xl tracking-tight">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
