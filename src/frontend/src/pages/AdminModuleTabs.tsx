import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  HardHat,
  PenLine,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: string;
}

interface CostCode {
  id: string;
  csiCode: string;
  description: string;
  budgeted: number;
  spent: number;
  variance: number;
}

interface LaborResource {
  id: string;
  name: string;
  role: string;
  phaseAssignment: string;
  status: string;
}

interface EquipmentResource {
  id: string;
  name: string;
  type: string;
  phaseAssignment: string;
  utilization: number;
}

interface ComplianceItem {
  id: string;
  standard: string;
  codeRef: string;
  status: string;
  assignedTo: string;
  signOffDate: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const PHASE_STYLES: Record<string, string> = {
  Complete: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "In Progress": "border-primary/30 bg-primary/10 text-primary",
  Upcoming: "border-border bg-muted text-muted-foreground",
  Delayed: "border-red-500/30 bg-red-500/10 text-red-400",
};

const LABOR_STYLES: Record<string, string> = {
  Active: "border-primary/30 bg-primary/10 text-primary",
  Upcoming: "border-border bg-muted text-muted-foreground",
  Idle: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  "Off-site": "border-border bg-muted text-muted-foreground",
};

const COMP_STYLES: Record<string, string> = {
  Compliant: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  Review: "border-primary/30 bg-primary/10 text-primary",
  "Non-Compliant": "border-red-500/30 bg-red-500/10 text-red-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_PHASES: Phase[] = [
  {
    id: "1",
    name: "Site Preparation",
    startDate: "2026-01-15",
    endDate: "2026-02-10",
    duration: 26,
    status: "Complete",
  },
  {
    id: "2",
    name: "Foundation Work",
    startDate: "2026-02-11",
    endDate: "2026-03-28",
    duration: 45,
    status: "Complete",
  },
  {
    id: "3",
    name: "Structural Steel",
    startDate: "2026-03-29",
    endDate: "2026-05-20",
    duration: 52,
    status: "In Progress",
  },
  {
    id: "4",
    name: "Mechanical/Electrical",
    startDate: "2026-05-21",
    endDate: "2026-07-15",
    duration: 55,
    status: "Upcoming",
  },
  {
    id: "5",
    name: "Interior Finishes",
    startDate: "2026-07-16",
    endDate: "2026-09-30",
    duration: 76,
    status: "Upcoming",
  },
  {
    id: "6",
    name: "Commissioning",
    startDate: "2026-10-01",
    endDate: "2026-11-15",
    duration: 45,
    status: "Upcoming",
  },
];

const SEED_COSTS: CostCode[] = [
  {
    id: "1",
    csiCode: "02 00 00",
    description: "Existing Conditions",
    budgeted: 180000,
    spent: 175000,
    variance: 5000,
  },
  {
    id: "2",
    csiCode: "03 00 00",
    description: "Concrete",
    budgeted: 620000,
    spent: 590000,
    variance: 30000,
  },
  {
    id: "3",
    csiCode: "05 00 00",
    description: "Metals / Structural Steel",
    budgeted: 940000,
    spent: 310000,
    variance: 630000,
  },
  {
    id: "4",
    csiCode: "15 00 00",
    description: "Mechanical Systems",
    budgeted: 780000,
    spent: 200000,
    variance: 580000,
  },
  {
    id: "5",
    csiCode: "16 00 00",
    description: "Electrical Systems",
    budgeted: 560000,
    spent: 95000,
    variance: 465000,
  },
  {
    id: "6",
    csiCode: "09 00 00",
    description: "Finishes",
    budgeted: 440000,
    spent: 65000,
    variance: 375000,
  },
];

const SEED_LABOR: LaborResource[] = [
  {
    id: "1",
    name: "Marcus Rivera",
    role: "Foreman",
    phaseAssignment: "Structural Steel",
    status: "Active",
  },
  {
    id: "2",
    name: "James Okafor",
    role: "Ironworker",
    phaseAssignment: "Structural Steel",
    status: "Active",
  },
  {
    id: "3",
    name: "Priya Nair",
    role: "Electrician",
    phaseAssignment: "Mechanical/Electrical",
    status: "Upcoming",
  },
  {
    id: "4",
    name: "Diego Santos",
    role: "Carpenter",
    phaseAssignment: "Interior Finishes",
    status: "Upcoming",
  },
  {
    id: "5",
    name: "Chen Wei",
    role: "Plumber",
    phaseAssignment: "Mechanical/Electrical",
    status: "Upcoming",
  },
];

const SEED_EQUIP: EquipmentResource[] = [
  {
    id: "1",
    name: "Tower Crane TC-400",
    type: "Crane",
    phaseAssignment: "Structural Steel",
    utilization: 92,
  },
  {
    id: "2",
    name: "Excavator CAT 320",
    type: "Excavation",
    phaseAssignment: "Foundation Work",
    utilization: 45,
  },
  {
    id: "3",
    name: "Concrete Pump P-80",
    type: "Concrete",
    phaseAssignment: "Foundation Work",
    utilization: 30,
  },
  {
    id: "4",
    name: "Aerial Work Platform",
    type: "Access",
    phaseAssignment: "Structural Steel",
    utilization: 78,
  },
];

const SEED_COMPLIANCE: ComplianceItem[] = [
  {
    id: "1",
    standard: "OSHA",
    codeRef: "29 CFR 1926",
    status: "Compliant",
    assignedTo: "EHS Engineer",
    signOffDate: "2026-04-15",
  },
  {
    id: "2",
    standard: "ANSI",
    codeRef: "ANSI A10.3",
    status: "Compliant",
    assignedTo: "Safety Inspector",
    signOffDate: "2026-04-20",
  },
  {
    id: "3",
    standard: "IBC",
    codeRef: "IBC 2021",
    status: "Pending",
    assignedTo: "Structural Engineer",
    signOffDate: "",
  },
  {
    id: "4",
    standard: "NCCER",
    codeRef: "Core Curriculum",
    status: "Compliant",
    assignedTo: "Training Coordinator",
    signOffDate: "2026-03-30",
  },
  {
    id: "5",
    standard: "OSHA",
    codeRef: "29 CFR 1910.147",
    status: "Review",
    assignedTo: "Safety Inspector",
    signOffDate: "",
  },
  {
    id: "6",
    standard: "IBC",
    codeRef: "IBC Ch. 16",
    status: "Pending",
    assignedTo: "Structural Engineer",
    signOffDate: "",
  },
];

// ─── Scheduling Tab ───────────────────────────────────────────────────────────

export function SchedulingTab() {
  const [phases, setPhases] = useState<Phase[]>(SEED_PHASES);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dr, setDr] = useState<Partial<Phase>>({});

  const startEdit = (p: Phase) => {
    setEditId(p.id);
    setDr({ ...p });
  };
  const cancelEdit = () => {
    setEditId(null);
    setDr({});
  };
  const saveEdit = () => {
    if (!editId) return;
    setPhases((prev) =>
      prev.map((p) => (p.id === editId ? ({ ...p, ...dr } as Phase) : p)),
    );
    setEditId(null);
    setDr({});
  };
  const addPhase = () => {
    const np: Phase = {
      id: String(Date.now()),
      name: "New Phase",
      startDate: "2026-12-01",
      endDate: "2026-12-31",
      duration: 30,
      status: "Upcoming",
    };
    setPhases((p) => [...p, np]);
    startEdit(np);
  };

  return (
    <div className="space-y-4" data-ocid="admin.scheduling_panel">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base font-semibold">
              Schedule Summary
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setEditOpen((v) => !v)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            data-ocid="admin.scheduling_edit_button"
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit Schedule
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Total Activities</p>
            <p className="text-lg font-semibold text-foreground">47</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Critical Path</p>
            <p className="text-lg font-semibold text-foreground">12</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Phases Active</p>
            <p className="text-lg font-semibold text-foreground">6</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Completion</p>
            <p className="text-lg font-semibold text-foreground">34%</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex flex-col justify-between">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge
              variant="outline"
              className="w-fit text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              On Schedule
            </Badge>
          </div>
        </div>
      </div>

      {editOpen && (
        <div
          className="rounded-xl border border-border bg-muted/20 p-5 space-y-4"
          data-ocid="admin.scheduling_edit_section"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold">Phase List</h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addPhase}
              className="gap-1.5 text-xs"
              data-ocid="admin.scheduling_add_phase_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Phase
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="hidden lg:grid grid-cols-[1fr_130px_130px_100px_120px_90px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Phase Name</span>
              <span>Start</span>
              <span>End</span>
              <span>Days</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.scheduling_phase.${idx + 1}`}
                >
                  {editId === phase.id ? (
                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[1fr_130px_130px_100px_120px_90px] lg:items-center lg:gap-2">
                      <Input
                        value={dr.name ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, name: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        type="date"
                        value={dr.startDate ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, startDate: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        type="date"
                        value={dr.endDate ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, endDate: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        value={dr.duration ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({
                            ...d,
                            duration: Number(e.target.value),
                          }))
                        }
                        className="h-7 text-xs"
                      />
                      <Select
                        value={dr.status ?? "Upcoming"}
                        onValueChange={(v) =>
                          setDr((d) => ({ ...d, status: v }))
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Complete",
                            "In Progress",
                            "Upcoming",
                            "Delayed",
                          ].map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveEdit}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-7 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[1fr_130px_130px_100px_120px_90px] lg:items-center lg:gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {phase.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {phase.startDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {phase.endDate}
                      </p>
                      <p className="text-xs text-foreground">
                        {phase.duration}d
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs border w-fit ${PHASE_STYLES[phase.status] ?? PHASE_STYLES.Upcoming}`}
                      >
                        {phase.status}
                      </Badge>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(phase)}
                          className="p-1 rounded hover:bg-muted/40"
                          aria-label="Edit phase"
                          data-ocid={`admin.scheduling_edit_phase.${idx + 1}`}
                        >
                          <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPhases((prev) =>
                              prev.filter((x) => x.id !== phase.id),
                            )
                          }
                          className="p-1 rounded hover:bg-red-500/10"
                          aria-label="Delete phase"
                          data-ocid={`admin.scheduling_delete_phase.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="admin.scheduling_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditOpen(false);
                toast.success("Schedule saved successfully.");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.scheduling_save_button"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cost Tab ─────────────────────────────────────────────────────────────────

export function CostTab() {
  const [codes, setCodes] = useState<CostCode[]>(SEED_COSTS);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dr, setDr] = useState<Partial<CostCode>>({});

  const startEdit = (c: CostCode) => {
    setEditId(c.id);
    setDr({ ...c });
  };
  const cancelEdit = () => {
    setEditId(null);
    setDr({});
  };
  const saveEdit = () => {
    if (!editId) return;
    setCodes((prev) =>
      prev.map((c) =>
        c.id === editId
          ? ({
              ...c,
              ...dr,
              variance: (dr.budgeted ?? c.budgeted) - (dr.spent ?? c.spent),
            } as CostCode)
          : c,
      ),
    );
    setEditId(null);
    setDr({});
  };
  const addCode = () => {
    const nc: CostCode = {
      id: String(Date.now()),
      csiCode: "00 00 00",
      description: "New Cost Code",
      budgeted: 0,
      spent: 0,
      variance: 0,
    };
    setCodes((p) => [...p, nc]);
    startEdit(nc);
  };

  return (
    <div className="space-y-4" data-ocid="admin.cost_panel">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base font-semibold">
              Cost Summary
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setEditOpen((v) => !v)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            data-ocid="admin.cost_edit_button"
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit Cost Codes
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="text-lg font-semibold text-foreground">$4.2M</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Spent to Date</p>
            <p className="text-lg font-semibold text-foreground">$1.435M</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-semibold text-foreground">$2.765M</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Burn Rate</p>
            <p className="text-lg font-semibold text-foreground">$47,833/mo</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Variance</p>
            <p className="text-lg font-semibold text-emerald-400">+$12,400</p>
            <Badge
              variant="outline"
              className="mt-1 text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              On Budget
            </Badge>
          </div>
        </div>
      </div>

      {editOpen && (
        <div
          className="rounded-xl border border-border bg-muted/20 p-5 space-y-4"
          data-ocid="admin.cost_edit_section"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold">
              Cost Code Breakdown
            </h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addCode}
              className="gap-1.5 text-xs"
              data-ocid="admin.cost_add_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Cost Code
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="hidden lg:grid grid-cols-[100px_1fr_130px_130px_120px_80px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>CSI Code</span>
              <span>Description</span>
              <span className="text-right">Budgeted</span>
              <span className="text-right">Spent</span>
              <span className="text-right">Variance</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {codes.map((code, idx) => (
                <div
                  key={code.id}
                  className="px-4 py-3 hover:bg-muted/10 transition-colors"
                  data-ocid={`admin.cost_code.${idx + 1}`}
                >
                  {editId === code.id ? (
                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[100px_1fr_130px_130px_120px_80px] lg:items-center lg:gap-2">
                      <Input
                        value={dr.csiCode ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, csiCode: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        value={dr.description ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, description: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        value={dr.budgeted ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({
                            ...d,
                            budgeted: Number(e.target.value),
                          }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        value={dr.spent ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({
                            ...d,
                            spent: Number(e.target.value),
                          }))
                        }
                        className="h-7 text-xs"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {currency((dr.budgeted ?? 0) - (dr.spent ?? 0))}
                      </p>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveEdit}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-7 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[100px_1fr_130px_130px_120px_80px] lg:items-center lg:gap-2">
                      <p className="text-xs font-mono text-muted-foreground">
                        {code.csiCode}
                      </p>
                      <p className="text-sm text-foreground">
                        {code.description}
                      </p>
                      <p className="text-xs text-foreground text-right">
                        {currency(code.budgeted)}
                      </p>
                      <p className="text-xs text-foreground text-right">
                        {currency(code.spent)}
                      </p>
                      <p
                        className={`text-xs font-semibold text-right ${code.variance >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {code.variance >= 0 ? "+" : ""}
                        {currency(code.variance)}
                      </p>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(code)}
                          className="p-1 rounded hover:bg-muted/40"
                          aria-label="Edit cost code"
                          data-ocid={`admin.cost_edit_code.${idx + 1}`}
                        >
                          <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCodes((prev) =>
                              prev.filter((x) => x.id !== code.id),
                            )
                          }
                          className="p-1 rounded hover:bg-red-500/10"
                          aria-label="Delete cost code"
                          data-ocid={`admin.cost_delete_code.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="admin.cost_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditOpen(false);
                toast.success("Cost codes saved successfully.");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.cost_save_button"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resources Tab ────────────────────────────────────────────────────────────

export function ResourcesTab() {
  const [labor, setLabor] = useState<LaborResource[]>(SEED_LABOR);
  const [equip, setEquip] = useState<EquipmentResource[]>(SEED_EQUIP);
  const [editOpen, setEditOpen] = useState(false);
  const [lEditId, setLEditId] = useState<string | null>(null);
  const [eEditId, setEEditId] = useState<string | null>(null);
  const [lDr, setLDr] = useState<Partial<LaborResource>>({});
  const [eDr, setEDr] = useState<Partial<EquipmentResource>>({});

  const startLE = (r: LaborResource) => {
    setLEditId(r.id);
    setLDr({ ...r });
  };
  const saveLE = () => {
    if (!lEditId) return;
    setLabor((prev) =>
      prev.map((r) =>
        r.id === lEditId ? ({ ...r, ...lDr } as LaborResource) : r,
      ),
    );
    setLEditId(null);
    setLDr({});
  };
  const startEE = (e: EquipmentResource) => {
    setEEditId(e.id);
    setEDr({ ...e });
  };
  const saveEE = () => {
    if (!eEditId) return;
    setEquip((prev) =>
      prev.map((e) =>
        e.id === eEditId ? ({ ...e, ...eDr } as EquipmentResource) : e,
      ),
    );
    setEEditId(null);
    setEDr({});
  };
  const addLabor = () => {
    const r: LaborResource = {
      id: String(Date.now()),
      name: "New Worker",
      role: "Laborer",
      phaseAssignment: "General",
      status: "Upcoming",
    };
    setLabor((p) => [...p, r]);
    startLE(r);
  };
  const addEquip = () => {
    const e: EquipmentResource = {
      id: String(Date.now()),
      name: "New Equipment",
      type: "General",
      phaseAssignment: "General",
      utilization: 0,
    };
    setEquip((p) => [...p, e]);
    startEE(e);
  };

  return (
    <div className="space-y-4" data-ocid="admin.resources_panel">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base font-semibold">
              Resource Summary
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setEditOpen((v) => !v)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            data-ocid="admin.resources_edit_button"
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit Resources
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Total Labor</p>
            <p className="text-lg font-semibold text-foreground">23 workers</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Active Equipment</p>
            <p className="text-lg font-semibold text-foreground">8 units</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Crew Utilization</p>
            <p className="text-lg font-semibold text-foreground">78%</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Idle Forecast</p>
            <p className="text-lg font-semibold text-yellow-400">
              3 workers next wk
            </p>
          </div>
        </div>
      </div>

      {editOpen && (
        <div
          className="rounded-xl border border-border bg-muted/20 p-5 space-y-6"
          data-ocid="admin.resources_edit_section"
        >
          {/* Labor sub-table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold">Labor</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addLabor}
                className="gap-1.5 text-xs"
                data-ocid="admin.resources_add_labor_button"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Labor
              </Button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_120px_1fr_100px_80px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Name</span>
                <span>Role</span>
                <span>Phase Assignment</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-border">
                {labor.map((r, idx) => (
                  <div
                    key={r.id}
                    className="px-4 py-3 hover:bg-muted/10"
                    data-ocid={`admin.resources_labor.${idx + 1}`}
                  >
                    {lEditId === r.id ? (
                      <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_120px_1fr_100px_80px] md:items-center md:gap-2">
                        <Input
                          value={lDr.name ?? ""}
                          onChange={(e) =>
                            setLDr((d) => ({ ...d, name: e.target.value }))
                          }
                          className="h-7 text-xs"
                        />
                        <Input
                          value={lDr.role ?? ""}
                          onChange={(e) =>
                            setLDr((d) => ({ ...d, role: e.target.value }))
                          }
                          className="h-7 text-xs"
                        />
                        <Input
                          value={lDr.phaseAssignment ?? ""}
                          onChange={(e) =>
                            setLDr((d) => ({
                              ...d,
                              phaseAssignment: e.target.value,
                            }))
                          }
                          className="h-7 text-xs"
                        />
                        <Select
                          value={lDr.status ?? "Upcoming"}
                          onValueChange={(v) =>
                            setLDr((d) => ({ ...d, status: v }))
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Active", "Upcoming", "Idle", "Off-site"].map(
                              (s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs"
                                >
                                  {s}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={saveLE}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setLEditId(null)}
                            className="h-7 text-xs px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_120px_1fr_100px_80px] md:items-center md:gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {r.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.phaseAssignment}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs border w-fit ${LABOR_STYLES[r.status] ?? LABOR_STYLES.Upcoming}`}
                        >
                          {r.status}
                        </Badge>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startLE(r)}
                            className="p-1 rounded hover:bg-muted/40"
                            aria-label="Edit labor"
                            data-ocid={`admin.resources_edit_labor.${idx + 1}`}
                          >
                            <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setLabor((prev) =>
                                prev.filter((x) => x.id !== r.id),
                              )
                            }
                            className="p-1 rounded hover:bg-red-500/10"
                            aria-label="Delete labor"
                            data-ocid={`admin.resources_delete_labor.${idx + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment sub-table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-semibold">Equipment</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addEquip}
                className="gap-1.5 text-xs"
                data-ocid="admin.resources_add_equip_button"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Equipment
              </Button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_120px_1fr_100px_80px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Name</span>
                <span>Type</span>
                <span>Phase Assignment</span>
                <span>Utilization</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-border">
                {equip.map((eq, idx) => (
                  <div
                    key={eq.id}
                    className="px-4 py-3 hover:bg-muted/10"
                    data-ocid={`admin.resources_equip.${idx + 1}`}
                  >
                    {eEditId === eq.id ? (
                      <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_120px_1fr_100px_80px] md:items-center md:gap-2">
                        <Input
                          value={eDr.name ?? ""}
                          onChange={(ev) =>
                            setEDr((d) => ({ ...d, name: ev.target.value }))
                          }
                          className="h-7 text-xs"
                        />
                        <Input
                          value={eDr.type ?? ""}
                          onChange={(ev) =>
                            setEDr((d) => ({ ...d, type: ev.target.value }))
                          }
                          className="h-7 text-xs"
                        />
                        <Input
                          value={eDr.phaseAssignment ?? ""}
                          onChange={(ev) =>
                            setEDr((d) => ({
                              ...d,
                              phaseAssignment: ev.target.value,
                            }))
                          }
                          className="h-7 text-xs"
                        />
                        <Input
                          type="number"
                          value={eDr.utilization ?? ""}
                          onChange={(ev) =>
                            setEDr((d) => ({
                              ...d,
                              utilization: Number(ev.target.value),
                            }))
                          }
                          className="h-7 text-xs"
                        />
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={saveEE}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEEditId(null)}
                            className="h-7 text-xs px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_120px_1fr_100px_80px] md:items-center md:gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {eq.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {eq.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {eq.phaseAssignment}
                        </p>
                        <p className="text-xs font-semibold text-foreground">
                          {eq.utilization}%
                        </p>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEE(eq)}
                            className="p-1 rounded hover:bg-muted/40"
                            aria-label="Edit equipment"
                            data-ocid={`admin.resources_edit_equip.${idx + 1}`}
                          >
                            <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEquip((prev) =>
                                prev.filter((x) => x.id !== eq.id),
                              )
                            }
                            className="p-1 rounded hover:bg-red-500/10"
                            aria-label="Delete equipment"
                            data-ocid={`admin.resources_delete_equip.${idx + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="admin.resources_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditOpen(false);
                toast.success("Resources saved successfully.");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.resources_save_button"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Compliance Tab ───────────────────────────────────────────────────────────

export function ComplianceTab() {
  const [items, setItems] = useState<ComplianceItem[]>(SEED_COMPLIANCE);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dr, setDr] = useState<Partial<ComplianceItem>>({});

  const startEdit = (i: ComplianceItem) => {
    setEditId(i.id);
    setDr({ ...i });
  };
  const saveEdit = () => {
    if (!editId) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === editId ? ({ ...i, ...dr } as ComplianceItem) : i,
      ),
    );
    setEditId(null);
    setDr({});
  };
  const addItem = () => {
    const ni: ComplianceItem = {
      id: String(Date.now()),
      standard: "OSHA",
      codeRef: "",
      status: "Pending",
      assignedTo: "",
      signOffDate: "",
    };
    setItems((p) => [...p, ni]);
    startEdit(ni);
  };
  const checkedCount = items.filter((i) => i.status === "Compliant").length;
  const pendingCt = items.filter(
    (i) => i.status !== "Compliant" && i.status !== "Non-Compliant",
  ).length;

  return (
    <div className="space-y-4" data-ocid="admin.compliance_panel">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base font-semibold">
              Compliance Summary
            </h3>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setEditOpen((v) => !v)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            data-ocid="admin.compliance_edit_button"
          >
            <PenLine className="h-3.5 w-3.5" />
            Edit Compliance
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Active Standards</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {["OSHA", "ANSI", "IBC", "NCCER"].map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs border-primary/30 bg-primary/10 text-primary px-1.5 py-0"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Checked Items</p>
            <p className="text-lg font-semibold text-foreground">
              {checkedCount}/{items.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Sign-offs Pending</p>
            <p
              className={`text-lg font-semibold ${pendingCt > 0 ? "text-yellow-400" : "text-foreground"}`}
            >
              {pendingCt}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Next Review</p>
            <p className="text-lg font-semibold text-foreground">
              Jun 15, 2026
            </p>
          </div>
        </div>
      </div>

      {editOpen && (
        <div
          className="rounded-xl border border-border bg-muted/20 p-5 space-y-4"
          data-ocid="admin.compliance_edit_section"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold">
              Standards Checklist
            </h4>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              className="gap-1.5 text-xs"
              data-ocid="admin.compliance_add_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Standard
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="hidden lg:grid grid-cols-[80px_110px_1fr_130px_120px_80px] gap-2 bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Standard</span>
              <span>Code Ref</span>
              <span>Assigned To</span>
              <span>Status</span>
              <span>Sign-off Date</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="px-4 py-3 hover:bg-muted/10"
                  data-ocid={`admin.compliance_item.${idx + 1}`}
                >
                  {editId === item.id ? (
                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[80px_110px_1fr_130px_120px_80px] lg:items-center lg:gap-2">
                      <Input
                        value={dr.standard ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, standard: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        value={dr.codeRef ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, codeRef: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Input
                        value={dr.assignedTo ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, assignedTo: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <Select
                        value={dr.status ?? "Pending"}
                        onValueChange={(v) =>
                          setDr((d) => ({ ...d, status: v }))
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Compliant",
                            "Pending",
                            "Review",
                            "Non-Compliant",
                          ].map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={dr.signOffDate ?? ""}
                        onChange={(e) =>
                          setDr((d) => ({ ...d, signOffDate: e.target.value }))
                        }
                        className="h-7 text-xs"
                      />
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveEdit}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditId(null)}
                          className="h-7 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[80px_110px_1fr_130px_120px_80px] lg:items-center lg:gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {item.standard}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {item.codeRef}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.assignedTo}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs border w-fit ${COMP_STYLES[item.status] ?? COMP_STYLES.Pending}`}
                      >
                        {item.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {item.signOffDate || "\u2014"}
                      </p>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="p-1 rounded hover:bg-muted/40"
                          aria-label="Edit compliance item"
                          data-ocid={`admin.compliance_edit_item.${idx + 1}`}
                        >
                          <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setItems((prev) =>
                              prev.filter((x) => x.id !== item.id),
                            )
                          }
                          className="p-1 rounded hover:bg-red-500/10"
                          aria-label="Delete compliance item"
                          data-ocid={`admin.compliance_delete_item.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="admin.compliance_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditOpen(false);
                toast.success("Compliance records saved.");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.compliance_save_button"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
