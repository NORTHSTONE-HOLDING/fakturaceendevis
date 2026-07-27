"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Coins,
  Percent,
  Plus,
  Loader2,
  Sparkles,
  CheckCircle2,
  Circle,
  BookOpen,
  Receipt,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  addCostAction,
  addDefectAction,
  addDiaryEntryAction,
  toggleDefectAction,
} from "../actions";
import type { ProjectDetail } from "@/services/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  DEFECT_PRIORITY_LABELS,
  DEFECT_PRIORITY_VARIANT,
} from "@/lib/projects";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DefectPriority } from "@/types/database";

const today = () => new Date().toISOString().slice(0, 10);

export function ProjectTabs({ detail }: { detail: ProjectDetail }) {
  const { project, financials, diary, defects, costs, invoices } = detail;
  const openDefects = defects.filter((d) => !d.completed).length;

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Přehled</TabsTrigger>
        <TabsTrigger value="diary">Stavební deník ({diary.length})</TabsTrigger>
        <TabsTrigger value="defects">Vady ({openDefects})</TabsTrigger>
        <TabsTrigger value="costs">Náklady</TabsTrigger>
        <TabsTrigger value="invoices">Faktury ({invoices.length})</TabsTrigger>
      </TabsList>

      {/* ── Overview / cost control ─────────────────────────────── */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Wallet} tone="gold" label="Rozpočet" value={formatCurrency(financials.budget)} />
          <Metric
            icon={Coins}
            tone="warning"
            label="Skutečné náklady"
            value={formatCurrency(financials.actualCost)}
            hint={`Čerpání ${financials.budgetUsedPct.toFixed(0)} %`}
          />
          <Metric icon={TrendingUp} tone="success" label="Tržby (uhrazené)" value={formatCurrency(financials.revenue)} />
          <Metric
            icon={Percent}
            tone={financials.profit >= 0 ? "success" : "destructive"}
            label="Zisk / marže"
            value={formatCurrency(financials.profit)}
            hint={`${financials.margin.toFixed(1)} %`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Čerpání rozpočtu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, financials.budgetUsedPct)}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(financials.actualCost)} z{" "}
                {formatCurrency(financials.budget)} rozpočtu
              </p>
              <div className="space-y-1.5 pt-2">
                {COST_CATEGORIES.map((c) => (
                  <div key={c.value} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="tabular-nums">
                      {formatCurrency(financials.costsByCategory[c.value] ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI přehled projektu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Projekt {project.number} má {diary.length} zápisů v deníku a{" "}
                {openDefects} otevřených vad.
              </p>
              <p>
                {financials.profit >= 0
                  ? `Aktuální zisk ${formatCurrency(financials.profit)} při marži ${financials.margin.toFixed(1)} %.`
                  : `Pozor: náklady zatím převyšují uhrazené tržby o ${formatCurrency(-financials.profit)}.`}
              </p>
              <p className="text-xs">
                Zeptejte se AI asistenta (vpravo dole) na souhrn týdne, nedokončené
                vady nebo predikci materiálu.
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Diary ───────────────────────────────────────────────── */}
      <TabsContent value="diary" className="space-y-4">
        <DiaryForm projectId={project.id} />
        {diary.length === 0 ? (
          <EmptyState icon={BookOpen} text="Zatím žádné zápisy v deníku." />
        ) : (
          <div className="space-y-3">
            {diary.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{formatDate(e.entry_date)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {e.weather && <span>{e.weather}</span>}
                      {e.temperature != null && <span>{e.temperature} °C</span>}
                      <span>{e.workers_count} prac.</span>
                      <span>{e.working_hours} h</span>
                    </div>
                  </div>
                  {e.ai_summary && (
                    <p className="mb-2 rounded-lg bg-accent/50 p-3 text-sm">
                      {e.ai_summary}
                    </p>
                  )}
                  {e.activities && <p className="text-sm">{e.activities}</p>}
                  {e.materials_used && (
                    <p className="text-sm text-muted-foreground">
                      Materiál: {e.materials_used}
                    </p>
                  )}
                  {e.problems && (
                    <p className="text-sm text-destructive">Problémy: {e.problems}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Defects ─────────────────────────────────────────────── */}
      <TabsContent value="defects" className="space-y-4">
        <DefectForm projectId={project.id} />
        {defects.length === 0 ? (
          <EmptyState icon={ClipboardCheck} text="Žádné evidované vady." />
        ) : (
          <div className="space-y-2">
            {defects.map((d) => (
              <DefectRow key={d.id} defect={d} projectId={project.id} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Costs ───────────────────────────────────────────────── */}
      <TabsContent value="costs" className="space-y-4">
        <CostForm projectId={project.id} />
        {costs.length === 0 ? (
          <EmptyState icon={Coins} text="Zatím žádné zaznamenané náklady." />
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {costs.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {COST_CATEGORY_LABELS[c.category] ?? c.category}
                    </p>
                    {c.note && (
                      <p className="text-xs text-muted-foreground">{c.note}</p>
                    )}
                  </div>
                  <span className="tabular-nums">{formatCurrency(Number(c.amount))}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ── Invoices ────────────────────────────────────────────── */}
      <TabsContent value="invoices" className="space-y-4">
        {invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            text="K projektu zatím nejsou přiřazeny žádné faktury ani zálohy."
          />
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{inv.number}</span>
                    {inv.is_advance && <Badge variant="secondary">Záloha</Badge>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums">
                      {formatCurrency(Number(inv.total))}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

/* ── Sub-components ───────────────────────────────────────────── */

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gold" | "success" | "warning" | "destructive";
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground",
    gold: "bg-primary/12 text-primary",
    success: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning)/0.15)] text-[hsl(38,80%,38%)]",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof BookOpen; text: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function DiaryForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aiPending, setAiPending] = useState(false);
  const [form, setForm] = useState({
    entry_date: today(),
    weather: "",
    temperature: "",
    workers_count: "",
    working_hours: "",
    activities: "",
    materials_used: "",
    problems: "",
    ai_summary: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function generateAi() {
    setAiPending(true);
    try {
      const res = await fetch("/api/projects/diary-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: form.weather,
          temperature: form.temperature ? Number(form.temperature) : null,
          workers_count: form.workers_count ? Number(form.workers_count) : 0,
          activities: form.activities,
          materials_used: form.materials_used,
          problems: form.problems,
        }),
      });
      const data = (await res.json()) as { summary?: string };
      if (data.summary) {
        set("ai_summary", data.summary);
        toast.success("AI souhrn vygenerován");
      }
    } finally {
      setAiPending(false);
    }
  }

  function submit() {
    startTransition(async () => {
      const result = await addDiaryEntryAction(projectId, {
        entry_date: form.entry_date,
        weather: form.weather || null,
        temperature: form.temperature ? Number(form.temperature) : null,
        wind: null,
        rain: false,
        workers_count: form.workers_count ? Number(form.workers_count) : 0,
        working_hours: form.working_hours ? Number(form.working_hours) : 0,
        activities: form.activities || null,
        materials_used: form.materials_used || null,
        problems: form.problems || null,
        notes: null,
        ai_summary: form.ai_summary || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Zápis přidán");
      setForm({
        entry_date: today(),
        weather: "",
        temperature: "",
        workers_count: "",
        working_hours: "",
        activities: "",
        materials_used: "",
        problems: "",
        ai_summary: "",
      });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nový zápis do deníku</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Datum</Label>
          <Input type="date" value={form.entry_date} onChange={(e) => set("entry_date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Počasí</Label>
          <Input value={form.weather} onChange={(e) => set("weather", e.target.value)} placeholder="Slunečno" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Teplota °C</Label>
          <Input type="number" value={form.temperature} onChange={(e) => set("temperature", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Pracovníků</Label>
          <Input type="number" value={form.workers_count} onChange={(e) => set("workers_count", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-4">
          <Label className="text-xs">Provedené práce</Label>
          <Textarea rows={2} value={form.activities} onChange={(e) => set("activities", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Materiál</Label>
          <Input value={form.materials_used} onChange={(e) => set("materials_used", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Problémy</Label>
          <Input value={form.problems} onChange={(e) => set("problems", e.target.value)} />
        </div>
        {form.ai_summary && (
          <div className="sm:col-span-4">
            <Textarea rows={3} value={form.ai_summary} onChange={(e) => set("ai_summary", e.target.value)} />
          </div>
        )}
        <div className="flex items-center gap-2 sm:col-span-4">
          <Button variant="outline" onClick={generateAi} disabled={aiPending}>
            {aiPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generovat AI souhrn
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Uložit zápis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DefectForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<DefectPriority>("medium");
  const [responsible, setResponsible] = useState("");
  const [deadline, setDeadline] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await addDefectAction(projectId, {
        description,
        priority,
        responsible: responsible || null,
        deadline: deadline || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Vada přidána");
      setDescription("");
      setResponsible("");
      setDeadline("");
      setPriority("medium");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="grid gap-3 pt-6 sm:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Popis vady</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Popraskaná omítka v koupelně" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Priorita</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as DefectPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DEFECT_PRIORITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Termín</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-3">
          <Label className="text-xs">Odpovědná osoba</Label>
          <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={submit} disabled={pending} className="w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Přidat vadu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DefectRow({
  defect,
  projectId,
}: {
  defect: ProjectDetail["defects"][number];
  projectId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleDefectAction(defect.id, projectId, !defect.completed);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <button onClick={toggle} disabled={pending} className="text-primary">
            {defect.completed ? (
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <div>
            <p className={defect.completed ? "text-sm line-through text-muted-foreground" : "text-sm font-medium"}>
              {defect.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {defect.responsible ? `${defect.responsible} · ` : ""}
              {defect.deadline ? `termín ${formatDate(defect.deadline)}` : "bez termínu"}
            </p>
          </div>
        </div>
        <Badge variant={DEFECT_PRIORITY_VARIANT[defect.priority]}>
          {DEFECT_PRIORITY_LABELS[defect.priority]}
        </Badge>
      </CardContent>
    </Card>
  );
}

function CostForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [category, setCategory] = useState("material");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await addCostAction(projectId, {
        category,
        amount: Number(amount),
        note: note || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Náklad přidán");
      setAmount("");
      setNote("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="grid gap-3 pt-6 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Kategorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COST_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Částka</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Poznámka</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="sm:col-span-4">
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Přidat náklad
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
