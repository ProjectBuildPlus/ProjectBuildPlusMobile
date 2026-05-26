import { BaselineType } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  useParticipantAssignments,
  useParticipantsList,
} from "@/hooks/useParticipants";
import {
  useAppSettings,
  useFetchRSMeansBenchmarks,
} from "@/hooks/useParticipants";
import {
  useCumulativeWithBreakdown,
  usePhases,
  useProjectEVMSummary,
} from "@/hooks/useQueries";
import { useScenariosList } from "@/hooks/useScenarios";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Printer } from "lucide-react";

const fmt = (n: number | undefined | null, decimals = 2) =>
  n == null ? "—" : n.toFixed(decimals);

const fmtCurrency = (n: number | undefined | null) =>
  n == null
    ? "—"
    : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtOffset = (offset: bigint) => {
  const days = Number(offset);
  return days === 0 ? "Day 0" : `Day ${days}`;
};

export default function ExportView() {
  const navigate = useNavigate();

  const { data: phases = [] } = usePhases();
  const { data: evmSummary } = useProjectEVMSummary(BaselineType.original);
  const { data: cumulative = [] } = useCumulativeWithBreakdown();
  const { data: participants = [] } = useParticipantsList();
  const { data: assignments = [] } = useParticipantAssignments();
  const { data: scenarios = [] } = useScenariosList();
  const { data: appSettings } = useAppSettings();
  const { data: benchmarks = [] } = useFetchRSMeansBenchmarks();

  const projectName = appSettings?.projectName ?? "Project Build Plus";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const allCostCodes = phases.flatMap((p) =>
    p.costCodes.map((c) => ({ ...c, phaseName: p.name })),
  );

  const roleLabel = (role: string) => role.replace(/([A-Z])/g, " $1").trim();

  const getAssignedPhases = (participantId: string) => {
    const assigned = assignments
      .filter((a) => a.participantId === participantId && a.phaseId)
      .map((a) => {
        const phase = phases.find((p) => String(p.id) === a.phaseId);
        return phase?.name ?? a.phaseId ?? "";
      })
      .filter(Boolean);
    return assigned.length ? assigned.join(", ") : "Project-wide";
  };

  return (
    <div
      className="export-root bg-white text-black min-h-screen"
      data-ocid="export.page"
    >
      {/* Print-hidden controls */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-6 py-3 flex items-center gap-3 shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/dashboard" })}
          className="gap-2"
          data-ocid="export.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1" />
        <Button
          variant="default"
          size="sm"
          onClick={() => window.print()}
          className="gap-2"
          data-ocid="export.print_button"
        >
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Report body — padded to clear fixed bar on screen */}
      <div className="pt-16 print:pt-0 max-w-[900px] mx-auto px-8 py-10 print:px-0 print:py-0 print:max-w-none">
        {/* ── Section 1: Project Header ─────────────────────────────── */}
        <section
          className="report-section mb-10"
          data-ocid="export.header_section"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary rounded-lg p-3">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black font-display tracking-tight">
                {projectName}
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                Full Project Report
              </p>
            </div>
          </div>
          <table className="report-meta-table w-full border border-neutral-300 text-sm rounded-md overflow-hidden">
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="font-semibold px-4 py-2 bg-neutral-50 w-40">
                  Project Name
                </td>
                <td className="px-4 py-2">{projectName}</td>
                <td className="font-semibold px-4 py-2 bg-neutral-50 w-32">
                  Report Date
                </td>
                <td className="px-4 py-2">{today}</td>
              </tr>
              <tr>
                <td className="font-semibold px-4 py-2 bg-neutral-50">Owner</td>
                <td className="px-4 py-2">{appSettings?.ownerName || "—"}</td>
                <td className="font-semibold px-4 py-2 bg-neutral-50">
                  Total Phases
                </td>
                <td className="px-4 py-2">{phases.length}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── Section 2: Schedule Phases ────────────────────────────── */}
        <section
          className="report-section page-break-before mb-10"
          data-ocid="export.phases_section"
        >
          <h2 className="section-heading">Schedule Phases</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Phase Name</th>
                <th>Start</th>
                <th>End</th>
                <th className="text-right">Required Cash</th>
                <th className="text-right">Crash Factor</th>
                <th className="text-right">Resource Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {phases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-neutral-400 py-4">
                    No phases defined
                  </td>
                </tr>
              ) : (
                phases.map((phase) => (
                  <tr
                    key={String(phase.id)}
                    data-ocid={`export.phases_section.item.${phase.phaseOrder}`}
                  >
                    <td className="font-medium">{phase.name}</td>
                    <td>{fmtOffset(phase.startOffset)}</td>
                    <td>{fmtOffset(phase.endOffset)}</td>
                    <td className="text-right">
                      {fmtCurrency(phase.requiredCash)}
                    </td>
                    <td className="text-right">{fmt(phase.crashFactor, 2)}x</td>
                    <td className="text-right">
                      {fmt(phase.resourceMultiplier, 2)}x
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ── Section 3: Cost Codes ─────────────────────────────────── */}
        <section
          className="report-section page-break-before mb-10"
          data-ocid="export.cost_codes_section"
        >
          <h2 className="section-heading">Cost Codes</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Phase</th>
                <th>CSI Code</th>
                <th>Division</th>
                <th>Area</th>
                <th>Operation</th>
                <th>Distribution</th>
                <th className="text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {allCostCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-neutral-400 py-4">
                    No cost codes defined
                  </td>
                </tr>
              ) : (
                allCostCodes.map((code, i) => (
                  <tr
                    key={`${code.phaseId}-${code.id}`}
                    data-ocid={`export.cost_codes_section.item.${i + 1}`}
                  >
                    <td>{code.phaseName}</td>
                    <td className="font-mono text-xs">{code.csiCode}</td>
                    <td>{code.csiDivision}</td>
                    <td>{code.area || "—"}</td>
                    <td>{code.operation || "—"}</td>
                    <td>{code.distribution || "—"}</td>
                    <td className="text-right">{fmtCurrency(code.cost)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ── Section 4: Cash Requirement Summary ───────────────────── */}
        <section
          className="report-section mb-10"
          data-ocid="export.cash_summary_section"
        >
          <h2 className="section-heading">Cash Requirement Summary</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Phase</th>
                <th className="text-right">Cumulative SOV</th>
                <th className="text-right">Cumulative Cash</th>
                <th className="text-right">Crashed Cash</th>
              </tr>
            </thead>
            <tbody>
              {cumulative.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-neutral-400 py-4">
                    No cash data available
                  </td>
                </tr>
              ) : (
                cumulative.map((point, i) => (
                  <tr
                    key={point.phaseName ?? i}
                    data-ocid={`export.cash_summary_section.item.${i + 1}`}
                  >
                    <td>{point.phaseName}</td>
                    <td className="text-right">
                      {fmtCurrency(point.cumulativeSOV)}
                    </td>
                    <td className="text-right">
                      {fmtCurrency(point.cumulativeCash)}
                    </td>
                    <td className="text-right">
                      {fmtCurrency(point.crashedCash)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {evmSummary && (
              <tfoot>
                <tr className="font-bold border-t-2 border-neutral-400">
                  <td>Project Totals</td>
                  <td className="text-right">
                    {fmtCurrency(evmSummary.totalPV)}
                  </td>
                  <td className="text-right">
                    {fmtCurrency(evmSummary.totalEV)}
                  </td>
                  <td className="text-right">
                    {fmtCurrency(evmSummary.totalAC)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </section>

        {/* ── Section 5: EVM Metrics ────────────────────────────────── */}
        <section
          className="report-section page-break-before mb-10"
          data-ocid="export.evm_section"
        >
          <h2 className="section-heading">EVM Metrics</h2>
          {evmSummary ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="text-right">Value</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr data-ocid="export.evm_section.item.1">
                  <td className="font-medium">Total Planned Value (PV)</td>
                  <td className="text-right">
                    {fmtCurrency(evmSummary.totalPV)}
                  </td>
                  <td className="text-neutral-500">Budgeted work scheduled</td>
                </tr>
                <tr data-ocid="export.evm_section.item.2">
                  <td className="font-medium">Total Earned Value (EV)</td>
                  <td className="text-right">
                    {fmtCurrency(evmSummary.totalEV)}
                  </td>
                  <td className="text-neutral-500">
                    Budgeted value of work done
                  </td>
                </tr>
                <tr data-ocid="export.evm_section.item.3">
                  <td className="font-medium">Total Actual Cost (AC)</td>
                  <td className="text-right">
                    {fmtCurrency(evmSummary.totalAC)}
                  </td>
                  <td className="text-neutral-500">Actual cost incurred</td>
                </tr>
                <tr data-ocid="export.evm_section.item.4">
                  <td className="font-medium">Cost Variance (CV)</td>
                  <td
                    className={`text-right font-semibold ${evmSummary.totalCV >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {fmtCurrency(evmSummary.totalCV)}
                  </td>
                  <td className="text-neutral-500">
                    {evmSummary.totalCV >= 0 ? "Under budget" : "Over budget"}
                  </td>
                </tr>
                <tr data-ocid="export.evm_section.item.5">
                  <td className="font-medium">Schedule Variance (SV)</td>
                  <td
                    className={`text-right font-semibold ${evmSummary.totalSV >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {fmtCurrency(evmSummary.totalSV)}
                  </td>
                  <td className="text-neutral-500">
                    {evmSummary.totalSV >= 0
                      ? "Ahead of schedule"
                      : "Behind schedule"}
                  </td>
                </tr>
                <tr data-ocid="export.evm_section.item.6">
                  <td className="font-medium">Cost Performance Index (CPI)</td>
                  <td
                    className={`text-right font-semibold ${evmSummary.projectCPI >= 1 ? "text-green-700" : "text-red-700"}`}
                  >
                    {fmt(evmSummary.projectCPI)}
                  </td>
                  <td className="text-neutral-500">
                    {evmSummary.projectCPI >= 1
                      ? "Efficient"
                      : "Cost overrun risk"}
                  </td>
                </tr>
                <tr data-ocid="export.evm_section.item.7">
                  <td className="font-medium">
                    Schedule Performance Index (SPI)
                  </td>
                  <td
                    className={`text-right font-semibold ${evmSummary.projectSPI >= 1 ? "text-green-700" : "text-red-700"}`}
                  >
                    {fmt(evmSummary.projectSPI)}
                  </td>
                  <td className="text-neutral-500">
                    {evmSummary.projectSPI >= 1
                      ? "On or ahead of schedule"
                      : "Behind schedule"}
                  </td>
                </tr>
                <tr data-ocid="export.evm_section.item.8">
                  <td className="font-medium">Productivity Index (PI)</td>
                  <td className="text-right font-semibold">
                    {fmt(evmSummary.projectPI)}
                  </td>
                  <td className="text-neutral-500">CPI × SPI</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-neutral-400 text-sm py-4">
              No EVM data available. Add cost codes and completion percentages
              to calculate metrics.
            </p>
          )}
        </section>

        {/* ── Section 6: Participants Roster ────────────────────────── */}
        <section
          className="report-section page-break-before mb-10"
          data-ocid="export.participants_section"
        >
          <h2 className="section-heading">Participants Roster</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Phases</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-neutral-400 py-4">
                    No participants on record
                  </td>
                </tr>
              ) : (
                participants.map((p, i) => (
                  <tr
                    key={p.id}
                    data-ocid={`export.participants_section.item.${i + 1}`}
                  >
                    <td className="font-medium">{roleLabel(p.role)}</td>
                    <td>{`${p.firstName} ${p.lastName}`.trim() || "—"}</td>
                    <td>{p.company.name || "—"}</td>
                    <td className="text-xs">{p.contact.email || "—"}</td>
                    <td className="text-xs whitespace-nowrap">
                      {p.contact.officePhone || p.contact.mobilePhone || "—"}
                    </td>
                    <td className="text-xs">{getAssignedPhases(p.id)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ── Section 7: RSMeans Benchmarks ─────────────────────────── */}
        <section
          className="report-section mb-10"
          data-ocid="export.benchmarks_section"
        >
          <h2 className="section-heading">RSMeans Benchmarks Snapshot</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>CSI Division</th>
                <th>CSI Code</th>
                <th>Description</th>
                <th>Unit</th>
                <th className="text-right">RSMeans Unit Cost</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-neutral-400 py-4">
                    No RSMeans benchmarks on record
                  </td>
                </tr>
              ) : (
                benchmarks.map((b, i) => (
                  <tr
                    key={`${b.csiDivision}-${b.csiCode}`}
                    data-ocid={`export.benchmarks_section.item.${i + 1}`}
                  >
                    <td>{b.csiDivision}</td>
                    <td className="font-mono text-xs">{b.csiCode}</td>
                    <td>{b.description}</td>
                    <td>{b.unit}</td>
                    <td className="text-right">
                      {fmtCurrency(b.nationalAvgTotal)}
                    </td>
                    <td className="capitalize">
                      {b.source === "live_api" ? "Live API" : "Manual"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* ── Section 8: Scenarios ──────────────────────────────────── */}
        <section
          className="report-section page-break-before mb-10"
          data-ocid="export.scenarios_section"
        >
          <h2 className="section-heading">Scenarios</h2>
          {scenarios.length === 0 ? (
            <p className="text-neutral-400 text-sm py-4">
              No scenarios defined.
            </p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Scenario Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr
                    key={s.id}
                    data-ocid={`export.scenarios_section.item.${i + 1}`}
                  >
                    <td className="font-medium">{s.name}</td>
                    <td className="text-neutral-600">{s.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Footer */}
        <footer
          className="mt-16 pt-6 border-t border-neutral-300 text-xs text-neutral-400 text-center"
          data-ocid="export.footer"
        >
          <p>
            Project Build Plus &mdash; Full Project Report &mdash; Generated{" "}
            {today}
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-600"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
