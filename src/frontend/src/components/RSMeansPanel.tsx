import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  RSMeansBenchmark,
  RSMeansEntry,
  RSMeansEntryInput,
} from "@/hooks/useParticipants";
import {
  useFetchRSMeansBenchmarks,
  useUpdateRSMeansEntry,
} from "@/hooks/useParticipants";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface RSMeansPanelProps {
  participantId: string;
  csiDivision: string;
  csiCode?: string;
  existingEntry?: RSMeansEntry | null;
  actualCost?: number;
  apiEnabled: boolean;
  onClose?: () => void;
}

function VarianceBadge({
  actual,
  benchmark,
}: { actual: number; benchmark: number }) {
  if (!actual || !benchmark) return null;
  const diff = actual - benchmark;
  const pct = benchmark > 0 ? (diff / benchmark) * 100 : 0;
  const over = diff > 0;
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
        over
          ? "bg-red-600/15 text-red-400 border border-red-600/30"
          : "bg-emerald-600/15 text-emerald-400 border border-emerald-600/30",
      )}
    >
      {over ? "+" : ""}
      {diff.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })}
      &nbsp;({over ? "+" : ""}
      {pct.toFixed(1)}%)
    </div>
  );
}

export function RSMeansPanel({
  participantId,
  csiDivision,
  csiCode,
  existingEntry,
  actualCost = 0,
  apiEnabled,
  onClose,
}: RSMeansPanelProps) {
  const updateEntry = useUpdateRSMeansEntry();
  const {
    data: benchmarks,
    refetch,
    isFetching,
  } = useFetchRSMeansBenchmarks(csiDivision);

  const liveBenchmark: RSMeansBenchmark | undefined = benchmarks?.find(
    (b) => !csiCode || b.csiCode === csiCode,
  );

  const [unitCost, setUnitCost] = useState(
    existingEntry?.unitCost?.toString() ?? "",
  );
  const [laborCost, setLaborCost] = useState(
    existingEntry?.laborCost?.toString() ?? "",
  );
  const [materialCost, setMaterialCost] = useState(
    existingEntry?.materialCost?.toString() ?? "",
  );
  const [crewCode, setCrewCode] = useState(existingEntry?.crewCode ?? "");
  const [notes, setNotes] = useState(existingEntry?.notes ?? "");

  // Populate from live benchmark if no manual entry exists
  useEffect(() => {
    if (apiEnabled && liveBenchmark && !existingEntry) {
      setUnitCost(liveBenchmark.nationalAvgTotal.toString());
      setCrewCode(liveBenchmark.crewCode);
    }
  }, [apiEnabled, liveBenchmark, existingEntry]);

  const effectiveUnitCost =
    existingEntry?.source === "manual"
      ? existingEntry.unitCost
      : apiEnabled && liveBenchmark
        ? liveBenchmark.nationalAvgTotal
        : (existingEntry?.unitCost ?? 0);

  const isManualMode = !apiEnabled || existingEntry?.source === "manual";
  const sourceLabel =
    existingEntry?.source === "manual"
      ? "Manual Entry"
      : apiEnabled
        ? "Live API"
        : "None";

  function handleSave() {
    const input: RSMeansEntryInput & { id?: string } = {
      id: existingEntry?.id,
      participantId,
      csiDivision,
      csiCode: csiCode ?? csiDivision,
      description: liveBenchmark?.description ?? "",
      unit: liveBenchmark?.unit ?? "LS",
      unitCost: Number.parseFloat(unitCost) || 0,
      laborCost: Number.parseFloat(laborCost) || 0,
      materialCost: Number.parseFloat(materialCost) || 0,
      equipmentCost: 0,
      totalCost:
        (Number.parseFloat(laborCost) || 0) +
        (Number.parseFloat(materialCost) || 0),
      crewCode,
      source: "manual",
      notes,
    };
    updateEntry.mutate(input, { onSuccess: onClose });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">
            RSMeans Benchmark — Div {csiDivision}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              apiEnabled
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {sourceLabel}
          </span>
          {apiEnabled && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => refetch()}
              disabled={isFetching}
              data-ocid="rsmeans.refresh_button"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Live API read-only section */}
      {apiEnabled && liveBenchmark && existingEntry?.source !== "manual" && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Live API Data
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Description</span>
              <p className="text-foreground font-medium">
                {liveBenchmark.description}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Unit</span>
              <p className="text-foreground font-medium">
                {liveBenchmark.unit}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">National Avg</span>
              <p className="text-foreground font-medium">
                ${liveBenchmark.nationalAvgTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Crew Code</span>
              <p className="text-foreground font-medium">
                {liveBenchmark.crewCode}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual entry form */}
      {isManualMode && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs text-muted-foreground">
              Manual override — enter values from your RSMeans lookup.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Unit Cost ($)</Label>
              <Input
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
                className="h-8 text-sm"
                data-ocid="rsmeans.unit_cost_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Labor Cost ($)</Label>
              <Input
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="0.00"
                className="h-8 text-sm"
                data-ocid="rsmeans.labor_cost_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Material Cost ($)</Label>
              <Input
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
                placeholder="0.00"
                className="h-8 text-sm"
                data-ocid="rsmeans.material_cost_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Crew Code</Label>
              <Input
                value={crewCode}
                onChange={(e) => setCrewCode(e.target.value)}
                placeholder="e.g. C-14A"
                className="h-8 text-sm"
                data-ocid="rsmeans.crew_code_input"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="h-8 text-sm"
              data-ocid="rsmeans.notes_input"
            />
          </div>
        </div>
      )}

      {/* Variance */}
      {actualCost > 0 && effectiveUnitCost > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Actual vs Benchmark
          </span>
          <VarianceBadge actual={actualCost} benchmark={effectiveUnitCost} />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        {onClose && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClose}
            data-ocid="rsmeans.cancel_button"
          >
            Cancel
          </Button>
        )}
        {isManualMode && (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={updateEntry.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="rsmeans.save_button"
          >
            {updateEntry.isPending ? "Saving…" : "Save Entry"}
          </Button>
        )}
      </div>
    </div>
  );
}
