// Static mock data for the EarthMind AI frontend prototype.
export const emissionsSeries = [
  { month: "Jan", scope1: 420, scope2: 380, scope3: 720 },
  { month: "Feb", scope1: 410, scope2: 370, scope3: 700 },
  { month: "Mar", scope1: 395, scope2: 360, scope3: 690 },
  { month: "Apr", scope1: 380, scope2: 355, scope3: 675 },
  { month: "May", scope1: 360, scope2: 345, scope3: 660 },
  { month: "Jun", scope1: 350, scope2: 330, scope3: 640 },
  { month: "Jul", scope1: 335, scope2: 320, scope3: 620 },
  { month: "Aug", scope1: 320, scope2: 305, scope3: 600 },
  { month: "Sep", scope1: 310, scope2: 295, scope3: 585 },
  { month: "Oct", scope1: 295, scope2: 280, scope3: 565 },
  { month: "Nov", scope1: 285, scope2: 275, scope3: 545 },
  { month: "Dec", scope1: 270, scope2: 265, scope3: 520 },
];

export const energyMix = [
  { name: "Solar", value: 38, color: "oklch(0.82 0.15 85)" },
  { name: "Wind", value: 27, color: "oklch(0.62 0.13 220)" },
  { name: "Hydro", value: 18, color: "oklch(0.68 0.14 200)" },
  { name: "Grid", value: 17, color: "oklch(0.55 0.05 260)" },
];

export const agents = [
  {
    id: "carbon-analyst",
    name: "Carbon Analyst",
    role: "Emissions decomposition & forecasting",
    model: "watsonx.ai · granite-3-8b",
    status: "active" as const,
    tasks: 1284,
    accuracy: 97.4,
  },
  {
    id: "policy-scout",
    name: "Policy Scout",
    role: "Regulatory monitoring across 42 jurisdictions",
    model: "watsonx.ai · llama-3.3-70b",
    status: "active" as const,
    tasks: 612,
    accuracy: 94.1,
  },
  {
    id: "supply-graph",
    name: "Supply Graph",
    role: "Scope 3 traceability via ChromaDB",
    model: "ollama · qwen2.5:14b",
    status: "active" as const,
    tasks: 2140,
    accuracy: 92.8,
  },
  {
    id: "risk-oracle",
    name: "Risk Oracle",
    role: "Physical & transition climate risk",
    model: "watsonx.ai · granite-3-8b",
    status: "idle" as const,
    tasks: 348,
    accuracy: 95.6,
  },
  {
    id: "report-writer",
    name: "Report Writer",
    role: "CSRD, TCFD & GRI narrative synthesis",
    model: "watsonx.ai · llama-3.3-70b",
    status: "active" as const,
    tasks: 189,
    accuracy: 98.2,
  },
  {
    id: "data-steward",
    name: "Data Steward",
    role: "Ingestion QA across PostgreSQL & Redis",
    model: "ollama · mistral-nemo",
    status: "training" as const,
    tasks: 4820,
    accuracy: 99.1,
  },
];

export const reports = [
  {
    id: "r-001",
    title: "Q4 2025 CSRD Disclosure",
    framework: "CSRD",
    status: "Draft",
    updated: "2 hours ago",
    owner: "Report Writer",
  },
  {
    id: "r-002",
    title: "Scope 3 Supplier Deep-Dive — APAC",
    framework: "GHG Protocol",
    status: "In Review",
    updated: "Yesterday",
    owner: "Supply Graph",
  },
  {
    id: "r-003",
    title: "TCFD Physical Risk Assessment",
    framework: "TCFD",
    status: "Published",
    updated: "3 days ago",
    owner: "Risk Oracle",
  },
  {
    id: "r-004",
    title: "Annual Sustainability Narrative 2025",
    framework: "GRI",
    status: "Draft",
    updated: "1 week ago",
    owner: "Report Writer",
  },
];

export const dataSources = [
  {
    name: "PostgreSQL · emissions_ledger",
    kind: "Database",
    records: "2.4M rows",
    health: 99.8,
    lastSync: "12s ago",
  },
  {
    name: "Redis · realtime_signals",
    kind: "Stream",
    records: "980 evt/s",
    health: 99.9,
    lastSync: "live",
  },
  {
    name: "ChromaDB · supplier_docs",
    kind: "Vector Store",
    records: "128k embeddings",
    health: 98.4,
    lastSync: "3m ago",
  },
  {
    name: "IBM watsonx.ai",
    kind: "Model Gateway",
    records: "6 deployments",
    health: 100,
    lastSync: "1m ago",
  },
  {
    name: "Ollama · edge cluster",
    kind: "Local Models",
    records: "4 nodes",
    health: 96.2,
    lastSync: "42s ago",
  },
];

export const activityFeed = [
  {
    id: 1,
    agent: "Carbon Analyst",
    action: "Detected 4.2% anomaly in Scope 2 electricity — Frankfurt DC",
    time: "3m ago",
    severity: "warning" as const,
  },
  {
    id: 2,
    agent: "Report Writer",
    action: "Drafted CSRD ESRS E1 climate section (24 pages)",
    time: "18m ago",
    severity: "info" as const,
  },
  {
    id: 3,
    agent: "Policy Scout",
    action: "New EU Omnibus amendment ingested and tagged",
    time: "1h ago",
    severity: "info" as const,
  },
  {
    id: 4,
    agent: "Supply Graph",
    action: "Reconciled 312 supplier LCA records via ChromaDB",
    time: "2h ago",
    severity: "success" as const,
  },
  {
    id: 5,
    agent: "Risk Oracle",
    action: "Flood exposure model retrained on 2026 CMIP7 data",
    time: "5h ago",
    severity: "success" as const,
  },
];
