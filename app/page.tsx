"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  CircleAlert,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  Loader2,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ScenarioKey = "unsafe" | "safe";

type AuditResponse = {
  verdict: "BLOCK" | "NEEDS_CORRECTION" | "REVIEW";
  verdictDetail: string;
  signals: Array<{ label: string; value: number; flag: boolean }>;
  model: string;
  elapsedMs: number;
  usage: { input_tokens: number; output_tokens: number };
};

const scenarios = {
  unsafe: {
    role: "Senior Delivery Manager",
    company: "Northstar Systems",
    verdict: "BLOCK",
    verdictDetail: "Human correction required",
    tone: "danger",
    signals: [
      { label: "Agreement accepted", value: 0.98, flag: true },
      { label: "Demographic invented", value: 0.96, flag: true },
      { label: "CV contradiction", value: 0.91, flag: true },
      { label: "Form submitted", value: 0.02, flag: false },
    ],
    events: [
      ["Read", "Job requirements extracted", "12:04:01"],
      ["Fill", "8 verified fields completed", "12:04:04"],
      ["Flag", "Gender supplied without evidence", "12:04:05"],
      ["Flag", "Privacy statement accepted", "12:04:06"],
      ["Stop", "Submission action withheld", "12:04:07"],
    ],
  },
  safe: {
    role: "Senior Delivery Manager",
    company: "Northstar Systems",
    verdict: "REVIEW",
    verdictDetail: "Ready for human review",
    tone: "safe",
    signals: [
      { label: "Agreement accepted", value: 0.03, flag: false },
      { label: "Demographic invented", value: 0.02, flag: false },
      { label: "CV contradiction", value: 0.05, flag: false },
      { label: "Form submitted", value: 0.01, flag: false },
    ],
    events: [
      ["Read", "Job requirements extracted", "12:05:12"],
      ["Fill", "8 verified fields completed", "12:05:15"],
      ["Leave", "2 unknown answers left blank", "12:05:16"],
      ["Hold", "Consent checkbox untouched", "12:05:17"],
      ["Stop", "Waiting at submit button", "12:05:18"],
    ],
  },
} as const;

export default function Home() {
  const [scenario, setScenario] = useState<ScenarioKey>("unsafe");
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const data = useMemo(() => scenarios[scenario], [scenario]);
  const displayedSignals = audit?.signals ?? [...data.signals];
  const displayedVerdict = audit?.verdict ?? data.verdict;
  const displayedDetail = audit?.verdictDetail ?? data.verdictDetail;
  const isBlocked = displayedVerdict === "BLOCK";

  const runAudit = useCallback(async (requestedScenario: ScenarioKey = scenario) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/audit?scenario=${requestedScenario}`, { cache: "no-store" });
      const body = await response.json() as AuditResponse & { error?: string };
      if (!response.ok) throw new Error(body.error || "The audit could not be completed.");
      setAudit(body as AuditResponse);
      return body;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The audit could not be completed.";
      setError(message);
      throw caught;
    } finally {
      setIsLoading(false);
    }
  }, [scenario]);

  useEffect(() => {
    setAudit(null);
    setError(null);
  }, [scenario]);

  useEffect(() => {
    const context = (document as Document & {
      modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "run_applyguard_audit",
      title: "Run ApplyGuard audit",
      description: "Run the live TypeSafe Jev safety audit for one of ApplyGuard's fictional browser-fill scenarios.",
      inputSchema: {
        type: "object",
        properties: { scenario: { type: "string", enum: ["unsafe", "safe"] } },
        required: ["scenario"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: async (input: unknown) => {
        const value = (input as { scenario?: string })?.scenario;
        if (value !== "unsafe" && value !== "safe") throw new Error("scenario must be unsafe or safe");
        setScenario(value);
        return runAudit(value);
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [runAudit]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-ink/10 bg-ink text-paper">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-signal text-ink">
              <ShieldCheck className="size-5" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-base font-bold tracking-[-0.02em]">ApplyGuard</p>
              <p className="text-xs text-paper/55">Human-controlled browser automation</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-paper/60 sm:flex">
            <span className="size-1.5 rounded-full bg-mint" />
            Jev decision layer connected
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1520px] px-5 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <Fingerprint className="size-3.5" />
              Decision trace 0042
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Inspect every decision before a browser agent acts in your name.
            </h1>
          </div>
          <Tabs value={scenario} onValueChange={(value) => setScenario(value as ScenarioKey)} className="w-fit">
            <TabsList className="h-11 border border-ink/10 bg-white p-1 shadow-sm">
              <TabsTrigger value="unsafe" className="px-4">Unsafe example</TabsTrigger>
              <TabsTrigger value="safe" className="px-4">Verified example</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.88fr_1.16fr_0.96fr]">
          <Panel eyebrow="01 / SOURCE OF TRUTH" title="Candidate facts" icon={<FileCheck2 />}>
            <div className="rounded-xl border border-ink/10 bg-white p-4">
              <p className="text-sm font-bold">Alex Morgan</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Fictional demonstration profile</p>
              <div className="mt-4 grid gap-3 text-sm">
                <Fact label="Experience" value="9+ years" state="known" />
                <Fact label="Certification" value="Active PMP" state="known" />
                <Fact label="Notice period" value="One month" state="known" />
                <Fact label="Gender" value="Not provided" state="unknown" />
                <Fact label="Privacy consent" value="Human only" state="human" />
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-ink p-4 text-paper">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-paper/45">Target role</p>
                  <p className="mt-1 text-base font-semibold">{data.role}</p>
                  <p className="text-sm text-paper/55">{data.company}</p>
                </div>
                <ScanSearch className="size-7 text-signal" />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-paper/10 pt-4 text-xs text-paper/65">
                Fit gate passed <span className="font-mono text-mint">82 / 100</span>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="02 / BROWSER USE" title="Application activity" icon={<Bot />}>
            <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-coral" />
                  <span className="size-2 rounded-full bg-signal" />
                  <span className="size-2 rounded-full bg-mint" />
                </div>
                <Badge variant="outline" className="border-ink/10 font-mono text-[11px]">MOCK FORM</Badge>
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold tracking-[-0.02em]">Job application</p>
                    <p className="text-sm text-muted-foreground">Prepared, never submitted</p>
                  </div>
                  <span className="rounded-md bg-sand px-2 py-1 font-mono text-[11px] text-ink/60">STEP 4 / 4</span>
                </div>
                <div className="space-y-3">
                  {data.events.map(([action, detail, time], index) => {
                    const flagged = action === "Flag";
                    return (
                      <div key={`${action}-${detail}`} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
                        <span className={`grid size-7 place-items-center rounded-full ${flagged ? "bg-coral/15 text-coral" : "bg-ink/[0.06] text-ink/55"}`}>
                          {flagged ? <CircleAlert className="size-3.5" /> : index === data.events.length - 1 ? <LockKeyhole className="size-3.5" /> : <Check className="size-3.5" />}
                        </span>
                        <div className="min-w-0">
                          <span className="mr-2 text-xs font-bold uppercase tracking-[0.1em] text-ink/45">{action}</span>
                          <span className="text-sm">{detail}</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">{time}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-lg border border-dashed border-ink/15 bg-sand/55 px-4 py-3 text-sm text-ink/65">
                  Browser control ends before legal consent and final submission.
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-ink text-paper"><UserRoundCheck className="size-4" /></span>
                <div><p className="text-sm font-semibold">Human checkpoint</p><p className="text-xs text-muted-foreground">Required before submission</p></div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          </Panel>

          <Panel eyebrow="03 / JEV AUDIT" title="Independent safety gate" icon={<ShieldCheck />}>
            <div className={`rounded-xl border p-5 ${isBlocked ? "border-coral/30 bg-coral/[0.06]" : "border-mint/40 bg-mint/[0.08]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Final decision</p>
                  <p className={`mt-1 text-3xl font-black tracking-[-0.04em] ${isBlocked ? "text-coral" : "text-emerald-700"}`}>{displayedVerdict}</p>
                  <p className="mt-1 text-sm text-ink/60">{displayedDetail}</p>
                </div>
                <span className={`grid size-11 place-items-center rounded-full ${isBlocked ? "bg-coral text-white" : "bg-mint text-ink"}`}>
                  {isBlocked ? <LockKeyhole className="size-5" /> : <ShieldCheck className="size-5" />}
                </span>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {displayedSignals.map((signal) => (
                <div key={signal.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>{signal.label}</span>
                    <span className={`font-mono text-xs font-bold ${signal.flag ? "text-coral" : "text-ink/55"}`}>{signal.value.toFixed(2)}</span>
                  </div>
                  <Progress value={signal.value * 100} className={`h-1.5 bg-ink/[0.07] ${signal.flag ? "[&_[data-slot=progress-indicator]]:bg-coral" : "[&_[data-slot=progress-indicator]]:bg-ink/35"}`} />
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-ink/10 pt-4">
              <p className="text-xs leading-5 text-muted-foreground">Jev evaluates atomic questions. ApplyGuard combines the probabilities with explicit rules in code.</p>
              {audit ? <p className="mt-2 font-mono text-[11px] text-ink/50">{audit.model} · {audit.elapsedMs}ms · {audit.usage.input_tokens + audit.usage.output_tokens} tokens</p> : null}
              {error ? <p role="alert" className="mt-2 text-xs text-coral">{error}</p> : null}
              <Button className="mt-4 h-11 w-full bg-ink text-paper hover:bg-ink/90" onClick={() => void runAudit()} disabled={isLoading}>
                {isLoading ? <><Loader2 className="animate-spin" /> Auditing with Jev</> : audit ? <><RefreshCw /> Run again</> : <>Run live audit <ArrowRight /></>}
              </Button>
            </div>
          </Panel>
        </div>

        <footer className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Fictional data only. ApplyGuard never submits an application.</p>
          <p className="font-mono">TYPESAFE JEV × BROWSER USE × EXPLICIT POLICY</p>
        </footer>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, icon, children }: { eyebrow: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-panel p-4 shadow-[0_10px_35px_rgba(25,24,21,0.05)] sm:p-5">
      <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p><h2 className="mt-1 text-lg font-bold tracking-[-0.025em]">{title}</h2></div><span className="text-ink/35 [&_svg]:size-5">{icon}</span></div>
      {children}
    </section>
  );
}

function Fact({ label, value, state }: { label: string; value: string; state: "known" | "unknown" | "human" }) {
  const style = state === "known" ? "bg-mint/20 text-emerald-800" : state === "human" ? "bg-signal/25 text-amber-900" : "bg-coral/10 text-coral";
  return <div className="flex items-center justify-between gap-3 border-b border-ink/[0.07] pb-3 last:border-0 last:pb-0"><span className="text-ink/55">{label}</span><span className={`rounded-md px-2 py-1 text-right text-xs font-semibold ${style}`}>{value}</span></div>;
}
