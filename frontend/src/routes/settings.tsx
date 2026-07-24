import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Shield, Palette, KeyRound, Save, Loader2 } from "lucide-react";

import { PageHeader, Panel } from "@/components/ui-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { settingsService, SettingsResponse } from "@/services";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · EarthMind AI" },
      { name: "description", content: "Configure your EarthMind AI workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await settingsService.getSettings();
        setSettings(res);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      await settingsService.updateSettings(settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SettingsResponse, value: string) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const updateNotification = (key: string, value: boolean) => {
    if (settings) {
      setSettings({
        ...settings,
        notifications: { ...settings.notifications, [key]: value }
      });
    }
  };

  if (!settings) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Personalise EarthMind, manage credentials, and shape how agents notify you."
      />

      <Panel
        title="Organisation profile"
        description="Displayed across reports and shared exports"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="org">Organisation name</Label>
            <Input id="org" value={settings.organization_name} onChange={(e) => updateField('organization_name', e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">Reporting region</Label>
            <Input id="region" value={settings.reporting_region} onChange={(e) => updateField('reporting_region', e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fy">Fiscal year start</Label>
            <Input id="fy" value={settings.fiscal_year_start} onChange={(e) => updateField('fiscal_year_start', e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="baseline">Baseline year</Label>
            <Input id="baseline" value={settings.baseline_year} onChange={(e) => updateField('baseline_year', e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="rounded-full bg-gradient-to-r from-[oklch(0.42 0.22 285)] to-[oklch(0.55 0.24 285)] text-primary-foreground">
            {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save changes
          </Button>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Notifications" description="Signal, not noise">
          {[
            { key: "anomaly_alerts", icon: Bell, label: "Anomaly alerts", hint: "When agents detect drift", on: settings.notifications.anomaly_alerts },
            { key: "compliance_updates", icon: Shield, label: "Compliance updates", hint: "New CSRD/TCFD guidance", on: settings.notifications.compliance_updates },
            { key: "weekly_digest", icon: Palette, label: "Weekly digest", hint: "Every Monday, 08:00", on: settings.notifications.weekly_digest },
          ].map((n) => (
            <div
              key={n.key}
              className="mb-3 flex items-center justify-between rounded-2xl border border-border/50 p-3 last:mb-0"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <n.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.hint}</p>
                </div>
              </div>
              <Switch checked={n.on} onCheckedChange={(v) => updateNotification(n.key, v)} />
            </div>
          ))}
        </Panel>

        <Panel title="API credentials" description="Rotate keys regularly">
          <div className="space-y-3">
            {[
              { label: "watsonx.ai", value: "ibm_••••••••••••4a2f" },
              { label: "PostgreSQL", value: "postgres://••••.eu-west" },
              { label: "ChromaDB", value: "https://chroma.••••.io" },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-border/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">{k.label}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs">
                    Rotate
                  </Button>
                </div>
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">{k.value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
