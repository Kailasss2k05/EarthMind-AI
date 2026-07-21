import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type DragEvent,
} from "react";
import {
  ArrowUp,
  Bot,
  Brain,
  Building2,
  ChevronDown,
  Clock,
  Coins,
  FileSpreadsheet,
  FileText,
  Flag,
  Gauge,
  Globe2,
  Image as ImageIcon,
  Layers,
  Leaf,
  LineChart,
  Loader2,
  MapPin,
  Recycle,
  Search,
  ShieldAlert,
  Sparkles,
  Sprout,
  Sun,
  Target,
  TrainFront,
  Upload,
  Wand2,
  Waves,
  X,
  Compass,
  Scale,
  Wallet,
  CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { submitQuery } from "@/services/query.service";
import { EarthMindApiError } from "@/services/api";

// Live Execution Components
import { useAgentWebSocket } from "@/services/websocket.service";
import { ExecutionHeader } from "@/components/execution/ExecutionHeader";
import { ExecutionSummary } from "@/components/execution/ExecutionSummary";
import { ExecutionTimeline } from "@/components/execution/ExecutionTimeline";
import { ReportViewer } from "@/components/execution/ReportViewer";
import type { AgentName, AgentStatus, QueryResponse } from "@/services/types";

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
          "The primary EarthMind AI workspace — compose a sustainability challenge and let multi-agent reasoning draft an intelligent action plan.",
      },
    ],
  }),
  component: PlanPage,
});

// ─────────────────────────────────────────────────────────────────────────────
// Static content

const quickSuggestions: {
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { label: "Smart City Planning", icon: Building2 },
  { label: "Waste Management", icon: Recycle },
  { label: "Renewable Energy", icon: Sun },
  { label: "Water Conservation", icon: Waves },
  { label: "Climate Adaptation", icon: ShieldAlert },
  { label: "Public Transportation", icon: TrainFront },
  { label: "Sustainable Agriculture", icon: Sprout },
];

const uploadKinds: {
  key: "pdf" | "image" | "csv";
  label: string;
  hint: string;
  accept: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    key: "pdf",
    label: "PDF documents",
    hint: "Policies, reports, disclosures",
    accept: "application/pdf",
    icon: FileText,
  },
  {
    key: "image",
    label: "Images",
    hint: "Satellite, site, infographics",
    accept: "image/*",
    icon: ImageIcon,
  },
  {
    key: "csv",
    label: "CSV datasets",
    hint: "Emissions, energy, supply chain",
    accept: ".csv,text/csv",
    icon: FileSpreadsheet,
  },
];

const sdgOptions = [
  { code: 6, label: "Clean Water" },
  { code: 7, label: "Clean Energy" },
  { code: 9, label: "Industry & Infrastructure" },
  { code: 11, label: "Sustainable Cities" },
  { code: 12, label: "Responsible Consumption" },
  { code: 13, label: "Climate Action" },
  { code: 14, label: "Life Below Water" },
  { code: 15, label: "Life on Land" },
];

/**
 * TODO: ENDPOINT MISSING — No /api/v1/history endpoint exists in the backend.
 */
const recentQueries = [
  {
    title: "Decarbonize a mid-size manufacturing plant by 2030",
    context: "Rotterdam · Manufacturing · SDG 9, 13",
    updatedAt: "2h ago",
    agents: 6,
  },
  {
    title: "Biodiversity restoration for coastal wetlands",
    context: "Lisbon · Public sector · SDG 14, 15",
    updatedAt: "Yesterday",
    agents: 5,
  },
  {
    title: "Scope 3 reduction across a global supply chain",
    context: "Global · Retail · SDG 12, 13",
    updatedAt: "3 days ago",
    agents: 7,
  },
];

const AGENT_META: Record<
  AgentName,
  { icon: ComponentType<{ className?: string }>; desc: string }
> = {
  Planner: {
    icon: Compass,
    desc: "Decomposes the challenge into an executable graph",
  },
  Research: {
    icon: Search,
    desc: "Gathers evidence via RAG over the knowledge base",
  },
  SDG: {
    icon: Target,
    desc: "Aligns actions with UN Sustainable Development Goals",
  },
  Policy: {
    icon: Scale,
    desc: "Cross-checks municipal and international policy",
  },
  Environmental: {
    icon: Leaf,
    desc: "Models environmental impact and co-benefits",
  },
  Finance: {
    icon: Wallet,
    desc: "Estimates CAPEX, OPEX and funding pathways",
  },
  Risk: {
    icon: ShieldAlert,
    desc: "Surfaces implementation and climate risks",
  },
  Timeline: {
    icon: CalendarClock,
    desc: "Sequences milestones and dependencies",
  },
  Report: {
    icon: FileText,
    desc: "Synthesises the final plan and disclosures",
  },
};

const STATUS_PROGRESS: Record<AgentStatus, number> = {
  queued: 0,
  running: 50,
  done: 100,
  error: 100,
};

const MAX_CHARS = 4000;

// ─────────────────────────────────────────────────────────────────────────────

function PlanPage() {
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<
    { id: string; name: string; kind: "pdf" | "image" | "csv"; size: number }[]
  >([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([11, 13]);
  const [budget, setBudget] = useState<number[]>([12]);
  const [timeline, setTimeline] = useState<string>("36");
  const [priority, setPriority] = useState<string>("balanced");
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [model, setModel] = useState<string>("watsonx-granite-3.1");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // ── Unified Execution States ──────────────────────────────────────────────
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plannerOutput, setPlannerOutput] = useState("");
  const [queryText, setQueryText] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // WebSocket event integration
  const { agentStatuses, isConnected, reset: resetWs } = useAgentWebSocket();

  // Derived metrics
  const doneCount = useMemo(() => {
    return agentStatuses.filter((a) => a.status === "done").length;
  }, [agentStatuses]);

  const overallProgress = useMemo(() => {
    const total = agentStatuses.reduce(
      (sum, a) => sum + STATUS_PROGRESS[a.status],
      0
    );
    return Math.round(total / agentStatuses.length);
  }, [agentStatuses]);

  const activeAgent = useMemo(() => {
    return agentStatuses.find((a) => a.status === "running");
  }, [agentStatuses]);

  const isCompleted = useMemo(() => {
    return agentStatuses.length > 0 && doneCount === agentStatuses.length;
  }, [agentStatuses, doneCount]);

  // Handle active timer
  useEffect(() => {
    if (isExecuting) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isExecuting]);

  const elapsedSecondsString = useMemo(() => {
    return `${(elapsedMs / 1000).toFixed(1)}s`;
  }, [elapsedMs]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Autoexpand textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 420)}px`;
  }, [prompt]);

  const canGenerate = prompt.trim().length > 0 && !isSubmitting && !isExecuting;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((f) => {
      const kind: "pdf" | "image" | "csv" = f.type.includes("pdf")
        ? "pdf"
        : f.type.startsWith("image/")
        ? "image"
        : "csv";
      return {
        id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        kind,
        size: f.size,
      };
    });
    setAttachments((prev) => [...prev, ...next]);
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const toggleSdg = (code: number) =>
    setSelectedSdgs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  const characterHint = useMemo(() => {
    const ratio = prompt.length / MAX_CHARS;
    if (ratio > 0.95) return "text-[color:var(--error)]";
    if (ratio > 0.75) return "text-[color:var(--warning)]";
    return "text-muted-foreground";
  }, [prompt.length]);

  // ── Submit handler — executes inline, no navigation ────────────────────────
  const handleGenerate = async () => {
    if (!canGenerate) return;

    setQueryText(prompt.trim());
    setPlannerOutput("");
    setQueryResponse(null);
    setIsExecuting(true);
    setIsSubmitting(true);
    setElapsedMs(0);
    resetWs();

    toast.success("Pipeline started!", {
      description: "LangGraph orchestration runtime initialized.",
    });

    try {
      const result = await submitQuery(prompt.trim());
      setQueryResponse(result);
      setPlannerOutput(result.report || JSON.stringify(result.planner_output));
      toast.success("Optimization cycle complete!", {
        description: "Action report synthesized successfully.",
      });
    } catch (err) {
      if (err instanceof EarthMindApiError) {
        toast.error("Backend error", { description: err.message });
      } else if (err instanceof TypeError) {
        toast.error("Cannot reach the backend", {
          description:
            "Make sure the FastAPI server is running on http://localhost:8000",
        });
      } else {
        toast.error("Unexpected error", {
          description: "Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
      setIsExecuting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-[1400px] px-2 pb-24 pt-6 space-y-12">
      <AnimatedBackdrop />

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm dark:bg-white/5">
          <Wand2 className="h-3.5 w-3.5" />
          Multi-agent runtime · LangGraph · watsonx.ai
        </div>
        <h1 className="text-balance font-display text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl md:text-[3.4rem]">
          Build{" "}
          <span
            className="italic"
            style={{
              backgroundImage: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              display: "inline-block",
            }}
          >
            Sustainable
          </span>{" "}
          Communities with AI
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
          Describe your sustainability challenge and let EarthMind AI generate
          an intelligent action plan using multiple AI agents.
        </p>
      </motion.header>

      {/* Composer Grid */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="flex flex-col gap-8">
          {/* Prompt composer */}
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-0.5 -z-10 rounded-[28px] opacity-50 blur-2xl"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div className="glass rounded-3xl p-4 shadow-[0_30px_80px_-30px_oklch(0.42_0.22_285/0.35)] sm:p-5">
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
                    <span className="relative h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Composer ready
                </div>
                <span className={cn("font-numeric text-[11px]", characterHint)}>
                  {prompt.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) =>
                  setPrompt(e.target.value.slice(0, MAX_CHARS))
                }
                placeholder={`Describe your sustainability challenge...\n\nExample:\nReduce flooding in urban areas while improving public transportation and minimizing carbon emissions.`}
                rows={5}
                className="min-h-[160px] w-full resize-none bg-transparent px-2 pt-1 text-[15px] leading-relaxed text-foreground placeholder:whitespace-pre-line placeholder:text-muted-foreground/70 focus:outline-none"
              />

              {/* Chips row */}
              <div className="mt-3 border-t border-border/50 px-1 pt-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Quick suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((s, i) => (
                    <motion.button
                      key={s.label}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.03 }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setPrompt((p) =>
                          p ? `${p}\n\n${s.label}: ` : `${s.label}: `,
                        )
                      }
                      className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-sm backdrop-blur-sm transition hover:border-primary/40 hover:bg-white/90 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <s.icon className="h-3.5 w-3.5 text-primary" />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Attachments */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-lg tracking-tight">Attachments</h2>
              <span className="text-[11px] text-muted-foreground">
                Optional · PDF, image or CSV
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={cn(
                "relative rounded-3xl border border-dashed border-border/70 bg-white/50 p-4 backdrop-blur-sm transition dark:bg-white/[0.03]",
                dragActive &&
                  "border-primary/60 bg-primary/[0.04] shadow-[0_20px_60px_-25px_oklch(0.42_0.22_285/0.45)]",
              )}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {uploadKinds.map((u) => (
                  <label
                    key={u.key}
                    className="group cursor-pointer rounded-2xl border border-border/60 bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-20px_oklch(0.42_0.22_285/0.35)] dark:bg-white/[0.04]"
                  >
                    <input
                      type="file"
                      accept={u.accept}
                      className="sr-only"
                      onChange={(e) => handleFiles(e.target.files)}
                      multiple
                    />
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/[0.03] text-primary">
                        <u.icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.label}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {u.hint}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-xs text-muted-foreground">
                <Upload className="h-3.5 w-3.5" />
                Drag & drop files anywhere in this area
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-1 rounded-full px-2 py-0.5 text-primary underline-offset-4 hover:underline"
                >
                  or browse
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-1.5 overflow-hidden"
                  >
                    {attachments.map((a) => (
                      <motion.li
                        key={a.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-white/80 px-3 py-2 text-xs dark:bg-white/[0.06]"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileIcon kind={a.kind} />
                          <span className="truncate text-foreground">
                            {a.name}
                          </span>
                          <span className="font-numeric text-[10px] text-muted-foreground">
                            {formatBytes(a.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((x) => x.id !== a.id),
                            )
                          }
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Remove ${a.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Advanced */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <div className="glass rounded-3xl p-4 sm:p-5">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl px-1 py-1 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/[0.03] text-primary">
                        <Layers className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block font-display text-lg tracking-tight">
                          Advanced options
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Constrain geography, budget, timeline and SDGs
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-300",
                        advancedOpen && "rotate-180",
                      )}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="mt-5 grid gap-5 border-t border-border/50 pt-5 md:grid-cols-2">
                    <Field label="Target country" icon={Globe2}>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. Netherlands"
                        className="rounded-xl border-border/60 bg-white/70 dark:bg-white/[0.04]"
                      />
                    </Field>
                    <Field label="Target city" icon={MapPin}>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Rotterdam"
                        className="rounded-xl border-border/60 bg-white/70 dark:bg-white/[0.04]"
                      />
                    </Field>

                    <Field
                      label="Budget"
                      icon={Coins}
                      suffix={
                        <span className="font-numeric text-xs text-primary">
                          € {budget[0]}M
                        </span>
                      }
                    >
                      <Slider
                        value={budget}
                        onValueChange={setBudget}
                        min={1}
                        max={250}
                        step={1}
                        className="pt-3"
                      />
                    </Field>

                    <Field label="Timeline" icon={Clock}>
                      <Select value={timeline} onValueChange={setTimeline}>
                        <SelectTrigger className="rounded-xl border-border/60 bg-white/70 dark:bg-white/[0.04]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="60">5 years</SelectItem>
                          <SelectItem value="120">10 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Priority" icon={Gauge}>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="rounded-xl border-border/60 bg-white/70 dark:bg-white/[0.04]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="impact">
                            Maximize impact
                          </SelectItem>
                          <SelectItem value="cost">Lowest cost</SelectItem>
                          <SelectItem value="speed">Fastest delivery</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Model" icon={Brain}>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="rounded-xl border-border/60 bg-white/70 dark:bg-white/[0.04]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="watsonx-granite-3.1">
                            IBM watsonx · Granite 3.1
                          </SelectItem>
                          <SelectItem value="watsonx-llama-3.3">
                            IBM watsonx · Llama 3.3 70B
                          </SelectItem>
                          <SelectItem value="ollama-mixtral">
                            Ollama · Mixtral 8x22B
                          </SelectItem>
                          <SelectItem value="ollama-qwen">
                            Ollama · Qwen 2.5 32B
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="md:col-span-2">
                      <Label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        <Target className="h-3.5 w-3.5" />
                        Relevant SDGs
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {sdgOptions.map((s) => {
                          const active = selectedSdgs.includes(s.code);
                          return (
                            <button
                              key={s.code}
                              type="button"
                              onClick={() => toggleSdg(s.code)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                active
                                  ? "border-primary/50 bg-primary/10 text-primary shadow-[0_6px_20px_-10px_oklch(0.42_0.22_285/0.5)]"
                                  : "border-border/60 bg-white/60 text-muted-foreground hover:border-primary/30 hover:text-foreground dark:bg-white/[0.04]",
                              )}
                            >
                              <span className="font-numeric text-[10px] opacity-80">
                                {String(s.code).padStart(2, "0")}
                              </span>
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </motion.section>

          {/* Primary action */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-1 -z-10 rounded-[28px] opacity-60 blur-2xl"
              style={{ background: "var(--gradient-primary)" }}
            />
            <Button
              type="button"
              id="generate-plan-btn"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className={cn(
                "group relative h-14 w-full overflow-hidden rounded-2xl px-6 text-base font-medium text-white shadow-[0_20px_60px_-20px_oklch(0.42_0.22_285/0.6)] transition",
                "bg-gradient-to-r from-[oklch(0.42_0.22_285)] via-[oklch(0.55_0.24_288)] to-[oklch(0.65_0.22_290)]",
                "hover:shadow-[0_28px_80px_-20px_oklch(0.42_0.22_285/0.75)]",
                !canGenerate && "opacity-70",
              )}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting to pipeline…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Sustainability Plan
                  <ArrowUp className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              9 agents will collaborate over your brief. Estimated runtime ·{" "}
              <span className="font-numeric">45–90s</span>
            </p>
          </motion.section>
        </div>

        {/* Right rail */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass rounded-3xl p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display text-lg tracking-tight">
                  Supported AI agents
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Orchestrated by LangGraph
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-2 py-1 text-[10px] font-medium text-[color:var(--success)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
                Live
              </span>
            </div>

            <ul className="space-y-2">
              {Object.keys(AGENT_META).map((key, i) => {
                const name = key as AgentName;
                const a = AGENT_META[name];
                return (
                  <motion.li
                    key={name}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                    className="group flex items-start gap-3 rounded-2xl border border-transparent p-2.5 transition hover:border-border/60 hover:bg-white/60 dark:hover:bg-white/[0.04]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/[0.03] text-primary">
                      <a.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">
                        {a.desc}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="glass rounded-3xl p-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/[0.03] text-primary">
                <LineChart className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">Runtime signal</p>
                <p className="text-[11px] text-muted-foreground">
                  Last 24h · aggregate
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat label="Plans generated" value="128" />
              <MiniStat label="Avg. runtime" value="62s" />
              <MiniStat label="RAG hits" value="4.2k" />
              <MiniStat label="Token spend" value="1.9M" />
            </div>
          </motion.div>
        </aside>
      </div>

      {/* ── Live Execution Pipeline Section ── */}
      <AnimatePresence>
        {(isExecuting || plannerOutput) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 pt-6 border-t border-border/50"
          >
            <ExecutionHeader
              isConnected={isConnected}
              isCompleted={!!plannerOutput}
            />

            <ExecutionSummary
              overallProgress={overallProgress}
              doneCount={doneCount}
              totalCount={agentStatuses.length}
              activeAgentName={activeAgent?.name}
              activeAgentIcon={activeAgent ? AGENT_META[activeAgent.name].icon : undefined}
              activeAgentDesc={activeAgent ? AGENT_META[activeAgent.name].desc : undefined}
              elapsedTime={elapsedSecondsString}
            />

            <ExecutionTimeline
              agentStatuses={agentStatuses}
              plannerOutput={plannerOutput || undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Final Sustainability Report Section ── */}
      <AnimatePresence>
        {plannerOutput && (
          <ReportViewer
            plannerOutput={plannerOutput}
            queryText={queryText}
            elapsedMs={elapsedMs}
            agentStatuses={agentStatuses}
            queryResponse={queryResponse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  children,
  suffix,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        {suffix}
      </Label>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white/60 p-3 dark:bg-white/[0.04]">
      <p className="font-numeric text-lg tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function FileIcon({ kind }: { kind: "pdf" | "image" | "csv" }) {
  const Icon =
    kind === "pdf" ? FileText : kind === "image" ? ImageIcon : FileSpreadsheet;
  return (
    <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AnimatedBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[720px] overflow-hidden"
    >
      <div
        className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.65 0.22 290 / 0.28), transparent 70%)",
          animation: "aurora-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -left-32 top-40 h-[420px] w-[420px] rounded-full opacity-55 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.42 0.22 285 / 0.28), transparent 70%)",
          animation: "aurora-drift-2 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-32 top-60 h-[420px] w-[420px] rounded-full opacity-55 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.85 0.08 290 / 0.5), transparent 70%)",
          animation: "aurora-drift 30s ease-in-out infinite reverse",
        }}
      />
      <div className="grid-lines absolute inset-0 opacity-[0.10]" />
    </div>
  );
}
