import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  FileSpreadsheet,
  Mic,
  ArrowUp,
  Wand2,
  Globe2,
  Building2,
  Factory,
  Trees,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "New Sustainability Plan · EarthMind AI" },
      {
        name: "description",
        content:
          "Describe a sustainability challenge and let EarthMind AI's multi-agent runtime generate an SDG-aligned action plan.",
      },
      { property: "og:title", content: "New Sustainability Plan · EarthMind AI" },
      {
        property: "og:description",
        content:
          "The heart of EarthMind AI — an intelligent workspace for generating sustainability action plans.",
      },
    ],
  }),
  component: PlanPage,
});

const suggestions = [
  {
    icon: Building2,
    label: "Decarbonize a mid-size manufacturing plant by 2030",
  },
  {
    icon: Trees,
    label: "Draft a biodiversity restoration plan for a coastal region",
  },
  {
    icon: Factory,
    label: "Reduce Scope 3 emissions across a global supply chain",
  },
  {
    icon: Globe2,
    label: "Align city infrastructure with UN SDGs 7, 11 and 13",
  },
];

const uploadActions = [
  { icon: Paperclip, label: "Upload PDF" },
  { icon: ImageIcon, label: "Upload Image" },
  { icon: FileSpreadsheet, label: "Upload CSV" },
  { icon: Mic, label: "Voice Input" },
];

function PlanPage() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl flex-col items-center justify-center px-2 pb-16 pt-8">
      <AnimatedBackdrop />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-col items-center text-center"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-electric/25 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm dark:bg-white/5">
          <Wand2 className="h-3.5 w-3.5" />
          Multi-agent · LangGraph · watsonx.ai
        </div>
        <h1 className="max-w-2xl text-balance font-display text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-6xl">
          What should EarthMind{" "}
          <span
            className="italic"
            style={{
              backgroundImage: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            solve
          </span>{" "}
          today?
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
          Describe a sustainability challenge in your own words. Our agents will
          plan, research, model and produce an SDG-aligned action roadmap.
        </p>
      </motion.div>

      {/* Prompt composer */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <div
          aria-hidden
          className="absolute -inset-0.5 -z-10 rounded-[26px] opacity-60 blur-xl [background:var(--gradient-primary)]"
        />
        <div className="glass rounded-3xl p-3 shadow-[0_30px_80px_-30px_oklch(0.42_0.22_285/0.35)]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your sustainability challenge..."
            rows={4}
            className="w-full resize-none bg-transparent px-4 pt-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/50 px-2 pt-3">
            <div className="flex flex-wrap items-center gap-1">
              {uploadActions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-border/70 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5"
                >
                  <a.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{a.label}</span>
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden font-numeric text-[11px] text-muted-foreground sm:inline">
                {prompt.length} chars
              </span>
              <Button
                type="button"
                size="sm"
                className={cn(
                  "group h-9 rounded-full bg-gradient-to-r from-[oklch(0.42_0.22_285)] to-[oklch(0.62_0.22_290)] px-4 text-xs font-medium text-white shadow-[0_10px_30px_-8px_oklch(0.42_0.22_285/0.55)] transition",
                  !prompt.trim() && "opacity-70",
                )}
                disabled={!prompt.trim()}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Generate Sustainability Plan
                <ArrowUp className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggested prompts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-8 w-full"
      >
        <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Suggested prompts
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              whileHover={{ y: -2 }}
              onClick={() => setPrompt(s.label)}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-white/50 p-3.5 text-left text-sm backdrop-blur-sm transition hover:border-primary/30 hover:bg-white/80 hover:shadow-[0_10px_30px_-12px_oklch(0.42_0.22_285/0.25)] dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                <s.icon className="h-4 w-4" />
              </span>
              <span className="line-clamp-2 text-foreground/90 group-hover:text-foreground">
                {s.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Floating decorative cards */}
      <FloatingHint
        className="left-[-8%] top-24 hidden lg:flex"
        title="LangGraph"
        subtitle="6 agents in orchestration"
        delay={0.4}
      />
      <FloatingHint
        className="right-[-6%] top-40 hidden lg:flex"
        title="RAG · ChromaDB"
        subtitle="128k sustainability docs"
        delay={0.55}
      />
    </div>
  );
}

function FloatingHint({
  className,
  title,
  subtitle,
  delay = 0,
}: {
  className?: string;
  title: string;
  subtitle: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, -8, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={cn(
        "glass absolute z-0 items-center gap-3 rounded-2xl px-3.5 py-2.5 shadow-[0_20px_40px_-20px_oklch(0.42_0.22_285/0.35)]",
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-[color:var(--success)] shadow-[0_0_10px_var(--success)]" />
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-medium">{title}</span>
        <span className="font-numeric text-[10px] text-muted-foreground">
          {subtitle}
        </span>
      </div>
    </motion.div>
  );
}

function AnimatedBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[820px] overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.65 0.22 290 / 0.30), transparent 70%)",
          animation: "aurora-drift 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -left-32 top-40 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.42 0.22 285 / 0.32), transparent 70%)",
          animation: "aurora-drift-2 24s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-32 top-64 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.85 0.08 290 / 0.5), transparent 70%)",
          animation: "aurora-drift 28s ease-in-out infinite reverse",
        }}
      />
      <div className="grid-lines absolute inset-0 opacity-[0.12]" />
    </div>
  );
}
