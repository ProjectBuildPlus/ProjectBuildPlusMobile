import type { CostCodeInput } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CSI_MASTER_FORMAT } from "@/data/csiMasterFormat";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface CostCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CostCodeInput) => void;
  phaseId: number;
}

type EntryMode = "csi" | "custom";

export function CostCodeModal({
  isOpen,
  onClose,
  onSave,
  phaseId,
}: CostCodeModalProps) {
  const [mode, setMode] = useState<EntryMode>("csi");
  const [search, setSearch] = useState("");
  const [csiCode, setCsiCode] = useState("");
  const [csiDivision, setCsiDivision] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [area, setArea] = useState("");
  const [operation, setOperation] = useState("");
  const [distribution, setDistribution] = useState("");
  const [cost, setCost] = useState("");

  if (!isOpen) return null;

  const filtered = CSI_MASTER_FORMAT.filter(
    (entry) =>
      entry.code.toLowerCase().includes(search.toLowerCase()) ||
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.division.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectCSI = (entry: (typeof CSI_MASTER_FORMAT)[number]) => {
    setCsiCode(entry.code);
    setCsiDivision(entry.division);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCost = Number.parseFloat(cost);
    if (Number.isNaN(parsedCost)) return;
    onSave({
      csiCode,
      csiDivision,
      projectNumber,
      area,
      operation,
      distribution,
      cost: parsedCost,
    });
    // reset
    setSearch("");
    setCsiCode("");
    setCsiDivision("");
    setProjectNumber("");
    setArea("");
    setOperation("");
    setDistribution("");
    setCost("");
    setMode("csi");
    onClose();
  };

  const inputBase =
    "bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      data-ocid="costcode.modal"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="costcode.close_button"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 font-display text-xl font-semibold text-foreground">
          Add Cost Code
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">Phase #{phaseId}</p>

        <div className="mb-5 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("csi")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "csi"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="costcode.csi_tab"
          >
            CSI Template
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "custom"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="costcode.custom_tab"
          >
            Custom Entry
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "csi" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search CSI codes, divisions, or descriptions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputBase} pl-9`}
                  data-ocid="costcode.search_input"
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No matches found.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {filtered.map((entry) => (
                      <li key={entry.code}>
                        <button
                          type="button"
                          onClick={() => handleSelectCSI(entry)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                            csiCode === entry.code
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
                          }`}
                          data-ocid={`costcode.csi_item.${entry.code.replace(/\s/g, "_")}`}
                        >
                          <span className="font-mono font-medium">
                            {entry.code}
                          </span>
                          <span className="mx-2 text-muted-foreground">—</span>
                          <span>{entry.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {csiCode && (
                <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
                  Selected:{" "}
                  <span className="font-mono font-semibold">{csiCode}</span> —{" "}
                  {csiDivision}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="csiCode"
                className="text-sm text-muted-foreground"
              >
                CSI Code
              </Label>
              <Input
                id="csiCode"
                value={csiCode}
                onChange={(e) => setCsiCode(e.target.value)}
                placeholder="e.g. 03 30 00"
                className={inputBase}
                data-ocid="costcode.csiCode_input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="csiDivision"
                className="text-sm text-muted-foreground"
              >
                CSI Division
              </Label>
              <Input
                id="csiDivision"
                value={csiDivision}
                onChange={(e) => setCsiDivision(e.target.value)}
                placeholder="e.g. Division 03 - Concrete"
                className={inputBase}
                data-ocid="costcode.csiDivision_input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="projectNumber"
                className="text-sm text-muted-foreground"
              >
                Project Number
              </Label>
              <Input
                id="projectNumber"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                placeholder="e.g. P-2026-001"
                className={inputBase}
                data-ocid="costcode.projectNumber_input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area" className="text-sm text-muted-foreground">
                Area
              </Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Building A"
                className={inputBase}
                data-ocid="costcode.area_input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="operation"
                className="text-sm text-muted-foreground"
              >
                Operation
              </Label>
              <Input
                id="operation"
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                placeholder="e.g. Formwork"
                className={inputBase}
                data-ocid="costcode.operation_input"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="distribution"
                className="text-sm text-muted-foreground"
              >
                Distribution
              </Label>
              <Input
                id="distribution"
                value={distribution}
                onChange={(e) => setDistribution(e.target.value)}
                placeholder="e.g. Labor"
                className={inputBase}
                data-ocid="costcode.distribution_input"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cost" className="text-sm text-muted-foreground">
              Cost (USD)
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              className={inputBase}
              data-ocid="costcode.cost_input"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="costcode.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="costcode.submit_button"
            >
              Save Cost Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
