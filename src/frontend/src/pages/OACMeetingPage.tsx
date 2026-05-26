import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteReviewRequest } from "@/hooks/useDrawings";
import {
  useCreateOACSession,
  useGenerateZoomMeeting,
  useGetAIAForms,
  useGetOACSession,
  useMeetingPackage,
  useOACSessions,
  useSaveAIAForm,
  useSetFixedZoomLink,
  useUpdateAIAForm,
} from "@/hooks/useOACMeeting";
import { useParticipantsList } from "@/hooks/useParticipants";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Check,
  Copy,
  Edit2,
  FileText,
  Mail,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useIsFeatureLocked } from "../context/FeatureLockContext";

const FORM_TABS = [
  { key: "G702", label: "G702" },
  { key: "G703", label: "G703" },
  { key: "G701", label: "G701" },
  { key: "MeetingMinutes", label: "Meeting Minutes" },
  { key: "Addendum", label: "Addendum" },
] as const;

type FormTab = (typeof FORM_TABS)[number]["key"];

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeDisplay(timeStr: string) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── G702 Form ────────────────────────────────────────────────────────────────

function G702Form({
  sessionId: _sessionId,
  savedForm,
  onSave,
  onUpdate,
}: {
  sessionId: string;
  savedForm: {
    id: string;
    fieldData: Record<string, string>;
    submittedAt: string;
  } | null;
  onSave: (data: Record<string, string>) => void;
  onUpdate: (formId: string, data: Record<string, string>) => void;
}) {
  const fields = useMemo(
    () => ({
      projectName: "",
      applicationNumber: "",
      periodTo: "",
      contractDate: "",
      originalContractSum: "",
      netChangeByChangeOrders: "",
      contractSumToDate: "",
      totalCompletedStored: "",
      percentCompleted: "",
      balanceToFinish: "",
      currentPaymentDue: "",
      retainagePercent: "",
      contractorName: "",
      contractorSignature: "",
      contractorDate: "",
      architectName: "",
      architectCertification: "",
      architectDate: "",
      ...savedForm?.fieldData,
    }),
    [savedForm],
  );

  const [data, setData] = useState(fields);

  useEffect(() => {
    setData(fields);
  }, [fields]);

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Project Name", key: "projectName" },
          { label: "Application Number", key: "applicationNumber" },
          { label: "Period To", key: "periodTo", type: "date" },
          { label: "Contract Date", key: "contractDate", type: "date" },
          { label: "Original Contract Sum", key: "originalContractSum" },
          {
            label: "Net Change by Change Orders",
            key: "netChangeByChangeOrders",
          },
          { label: "Contract Sum to Date", key: "contractSumToDate" },
          {
            label: "Total Completed & Stored to Date",
            key: "totalCompletedStored",
          },
          { label: "% Completed", key: "percentCompleted" },
          { label: "Balance to Finish", key: "balanceToFinish" },
          { label: "Current Payment Due", key: "currentPaymentDue" },
          { label: "Retainage (%)", key: "retainagePercent" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="form-label">{f.label}</Label>
            <Input
              type={f.type ?? "text"}
              value={data[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="form-input"
              data-ocid={`g702.${f.key}.input`}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Contractor Name", key: "contractorName" },
          { label: "Contractor Signature", key: "contractorSignature" },
          { label: "Date", key: "contractorDate", type: "date" },
          { label: "Architect Name", key: "architectName" },
          { label: "Architect Certification", key: "architectCertification" },
          { label: "Date", key: "architectDate", type: "date" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="form-label">{f.label}</Label>
            <Input
              type={f.type ?? "text"}
              value={data[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="form-input"
              data-ocid={`g702.${f.key}.input`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-2">
        {savedForm ? (
          <>
            <Button
              type="button"
              onClick={() => onUpdate(savedForm.id, data)}
              data-ocid="g702.update_button"
            >
              Update
            </Button>
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(savedForm.submittedAt).toLocaleString()}
            </span>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => onSave(data)}
            data-ocid="g702.save_button"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── G703 Form ────────────────────────────────────────────────────────────────

interface G703Row {
  itemNo: string;
  description: string;
  scheduledValue: string;
  previousApplications: string;
  materialsStored: string;
  totalCompleted: string;
  percentComplete: string;
  balanceToFinish: string;
  retainage: string;
}

function G703Form({
  sessionId: _sessionId,
  savedForm,
  onSave,
  onUpdate,
}: {
  sessionId: string;
  savedForm: {
    id: string;
    fieldData: Record<string, string>;
    submittedAt: string;
  } | null;
  onSave: (data: Record<string, string>) => void;
  onUpdate: (formId: string, data: Record<string, string>) => void;
}) {
  const defaultRows: G703Row[] = Array.from({ length: 5 }, (_, i) => ({
    itemNo: String(i + 1),
    description: "",
    scheduledValue: "",
    previousApplications: "",
    materialsStored: "",
    totalCompleted: "",
    percentComplete: "",
    balanceToFinish: "",
    retainage: "",
  }));

  const parseRows = (fd: Record<string, string>): G703Row[] => {
    try {
      const parsed = JSON.parse(fd.rows ?? "[]") as G703Row[];
      if (parsed.length >= 5) return parsed;
    } catch {
      // ignore
    }
    return defaultRows;
  };

  const [meta, setMeta] = useState({
    applicationNumber: savedForm?.fieldData.applicationNumber ?? "",
    projectName: savedForm?.fieldData.projectName ?? "",
    contractDate: savedForm?.fieldData.contractDate ?? "",
    contractorNotes: savedForm?.fieldData.contractorNotes ?? "",
  });
  const [rows, setRows] = useState<G703Row[]>(
    parseRows(savedForm?.fieldData ?? {}),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: parse functions are stable
  useEffect(() => {
    if (savedForm) {
      setMeta({
        applicationNumber: savedForm.fieldData.applicationNumber ?? "",
        projectName: savedForm.fieldData.projectName ?? "",
        contractDate: savedForm.fieldData.contractDate ?? "",
        contractorNotes: savedForm.fieldData.contractorNotes ?? "",
      });
      setRows(parseRows(savedForm.fieldData));
    }
  }, [savedForm]);

  const updateRow = (idx: number, key: keyof G703Row, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const totals = useMemo(() => {
    const sum = (key: keyof G703Row) =>
      rows.reduce((acc, r) => acc + (Number.parseFloat(r[key]) || 0), 0);
    return {
      scheduledValue: sum("scheduledValue"),
      previousApplications: sum("previousApplications"),
      materialsStored: sum("materialsStored"),
      totalCompleted: sum("totalCompleted"),
      balanceToFinish: sum("balanceToFinish"),
      retainage: sum("retainage"),
    };
  }, [rows]);

  const buildData = (): Record<string, string> => ({
    ...meta,
    rows: JSON.stringify(rows),
    totals: JSON.stringify(totals),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Application Number", key: "applicationNumber" },
          { label: "Project Name", key: "projectName" },
          { label: "Contract Date", key: "contractDate", type: "date" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="form-label">{f.label}</Label>
            <Input
              type={f.type ?? "text"}
              value={meta[f.key as keyof typeof meta]}
              onChange={(e) =>
                setMeta((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              className="form-input"
              data-ocid={`g703.${f.key}.input`}
            />
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {[
                "Item No.",
                "Description",
                "Scheduled Value",
                "Previous Apps",
                "Materials Stored",
                "Total Completed",
                "% Complete",
                "Balance",
                "Retainage",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-2 py-1.5 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable IDs
                key={i}
                className="border-b"
              >
                {(
                  [
                    "itemNo",
                    "description",
                    "scheduledValue",
                    "previousApplications",
                    "materialsStored",
                    "totalCompleted",
                    "percentComplete",
                    "balanceToFinish",
                    "retainage",
                  ] as const
                ).map((k) => (
                  <td key={k} className="px-1 py-1">
                    <Input
                      type={k === "description" ? "text" : "text"}
                      value={row[k]}
                      onChange={(e) => updateRow(i, k, e.target.value)}
                      className="h-8 min-w-[80px] text-sm"
                      data-ocid={`g703.row.${i + 1}.${k}.input`}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-muted/40 font-semibold">
              <td className="px-2 py-2" colSpan={2}>
                Totals
              </td>
              <td className="px-2 py-2">{totals.scheduledValue.toFixed(2)}</td>
              <td className="px-2 py-2">
                {totals.previousApplications.toFixed(2)}
              </td>
              <td className="px-2 py-2">{totals.materialsStored.toFixed(2)}</td>
              <td className="px-2 py-2">{totals.totalCompleted.toFixed(2)}</td>
              <td className="px-2 py-2">—</td>
              <td className="px-2 py-2">{totals.balanceToFinish.toFixed(2)}</td>
              <td className="px-2 py-2">{totals.retainage.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-1.5">
        <Label className="form-label">Contractor Notes</Label>
        <Textarea
          value={meta.contractorNotes}
          onChange={(e) =>
            setMeta((prev) => ({ ...prev, contractorNotes: e.target.value }))
          }
          className="form-textarea min-h-[80px]"
          data-ocid="g703.contractorNotes.input"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        {savedForm ? (
          <>
            <Button
              type="button"
              onClick={() => onUpdate(savedForm.id, buildData())}
              data-ocid="g703.update_button"
            >
              Update
            </Button>
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(savedForm.submittedAt).toLocaleString()}
            </span>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => onSave(buildData())}
            data-ocid="g703.save_button"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── G701 Form ────────────────────────────────────────────────────────────────

function G701Form({
  sessionId: _sessionId,
  savedForm,
  onSave,
  onUpdate,
}: {
  sessionId: string;
  savedForm: {
    id: string;
    fieldData: Record<string, string>;
    submittedAt: string;
  } | null;
  onSave: (data: Record<string, string>) => void;
  onUpdate: (formId: string, data: Record<string, string>) => void;
}) {
  const fields = useMemo(
    () => ({
      changeOrderNumber: "",
      projectName: "",
      contractDate: "",
      dateOfIssuance: "",
      descriptionOfChange: "",
      contractSumChangeAmount: "",
      contractTimeChange: "",
      reasonJustification: "",
      ownerAuthorization: "",
      ownerDate: "",
      architectAuthorization: "",
      architectDate: "",
      contractorAcceptance: "",
      contractorDate: "",
      ...savedForm?.fieldData,
    }),
    [savedForm],
  );

  const [data, setData] = useState(fields);

  useEffect(() => {
    setData(fields);
  }, [fields]);

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Change Order Number", key: "changeOrderNumber" },
          { label: "Project Name", key: "projectName" },
          { label: "Contract Date", key: "contractDate", type: "date" },
          { label: "Date of Issuance", key: "dateOfIssuance", type: "date" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="form-label">{f.label}</Label>
            <Input
              type={f.type ?? "text"}
              value={data[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="form-input"
              data-ocid={`g701.${f.key}.input`}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="form-label">Description of Change</Label>
        <Textarea
          value={data.descriptionOfChange}
          onChange={(e) => handleChange("descriptionOfChange", e.target.value)}
          className="form-textarea min-h-[80px]"
          data-ocid="g701.descriptionOfChange.input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            label: "Contract Sum Change Amount",
            key: "contractSumChangeAmount",
          },
          { label: "Contract Time Change (days)", key: "contractTimeChange" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="form-label">{f.label}</Label>
            <Input
              type="text"
              value={data[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="form-input"
              data-ocid={`g701.${f.key}.input`}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="form-label">Reason / Justification</Label>
        <Textarea
          value={data.reasonJustification}
          onChange={(e) => handleChange("reasonJustification", e.target.value)}
          className="form-textarea min-h-[80px]"
          data-ocid="g701.reasonJustification.input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Owner Authorization", key: "ownerAuthorization" },
          { label: "Date", key: "ownerDate", type: "date" },
          { label: "Architect Authorization", key: "architectAuthorization" },
          { label: "Date", key: "architectDate", type: "date" },
          { label: "Contractor Acceptance", key: "contractorAcceptance" },
          { label: "Date", key: "contractorDate", type: "date" },
        ].map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="form-label">{f.label}</Label>
            <Input
              type={f.type ?? "text"}
              value={data[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              className="form-input"
              data-ocid={`g701.${f.key}.input`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-2">
        {savedForm ? (
          <>
            <Button
              type="button"
              onClick={() => onUpdate(savedForm.id, data)}
              data-ocid="g701.update_button"
            >
              Update
            </Button>
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(savedForm.submittedAt).toLocaleString()}
            </span>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => onSave(data)}
            data-ocid="g701.save_button"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Meeting Minutes Form ─────────────────────────────────────────────────────

interface AttendeeRow {
  name: string;
  role: string;
}

interface ActionItemRow {
  action: string;
  owner: string;
  dueDate: string;
}

function MeetingMinutesForm({
  sessionId: _sessionId,
  savedForm,
  onSave,
  onUpdate,
  participants,
}: {
  sessionId: string;
  savedForm: {
    id: string;
    fieldData: Record<string, string>;
    submittedAt: string;
  } | null;
  onSave: (data: Record<string, string>) => void;
  onUpdate: (formId: string, data: Record<string, string>) => void;
  participants: { fullName: string; role: string }[];
}) {
  const parseList = (key: string): string[] => {
    try {
      return JSON.parse(savedForm?.fieldData[key] ?? "[]") as string[];
    } catch {
      return [];
    }
  };

  const parseAttendees = (): AttendeeRow[] => {
    try {
      const parsed = JSON.parse(
        savedForm?.fieldData.attendees ?? "[]",
      ) as AttendeeRow[];
      if (parsed.length) return parsed;
    } catch {
      // ignore
    }
    if (participants.length) {
      return participants.map((p) => ({ name: p.fullName, role: p.role }));
    }
    return [{ name: "", role: "" }];
  };

  const parseActionItems = (): ActionItemRow[] => {
    try {
      const parsed = JSON.parse(
        savedForm?.fieldData.actionItems ?? "[]",
      ) as ActionItemRow[];
      if (parsed.length) return parsed;
    } catch {
      // ignore
    }
    return [{ action: "", owner: "", dueDate: "" }];
  };

  const [attendees, setAttendees] = useState<AttendeeRow[]>(parseAttendees);
  const [agendaItems, setAgendaItems] = useState<string[]>(
    parseList("agendaItems").length ? parseList("agendaItems") : [""],
  );
  const [decisions, setDecisions] = useState<string[]>(
    parseList("decisions").length ? parseList("decisions") : [""],
  );
  const [actionItems, setActionItems] = useState<ActionItemRow[]>(
    parseActionItems(),
  );
  const [generalNotes, setGeneralNotes] = useState(
    savedForm?.fieldData.generalNotes ?? "",
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: parse functions are stable
  useEffect(() => {
    setAttendees(parseAttendees());
    setAgendaItems(
      parseList("agendaItems").length ? parseList("agendaItems") : [""],
    );
    setDecisions(parseList("decisions").length ? parseList("decisions") : [""]);
    setActionItems(parseActionItems());
    setGeneralNotes(savedForm?.fieldData.generalNotes ?? "");
  }, [savedForm]);

  const buildData = (): Record<string, string> => ({
    attendees: JSON.stringify(attendees),
    agendaItems: JSON.stringify(agendaItems),
    decisions: JSON.stringify(decisions),
    actionItems: JSON.stringify(actionItems),
    generalNotes,
  });

  return (
    <div className="space-y-6">
      {/* Attendees */}
      <div className="form-section">
        <div className="form-section-header">Attendees</div>
        {attendees.map((a, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable IDs
            key={i}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Name"
              value={a.name}
              onChange={(e) => {
                const next = [...attendees];
                next[i] = { ...next[i], name: e.target.value };
                setAttendees(next);
              }}
              className="form-input flex-1"
              data-ocid={`meetingMinutes.attendee.${i + 1}.name.input`}
            />
            <Input
              placeholder="Role"
              value={a.role}
              onChange={(e) => {
                const next = [...attendees];
                next[i] = { ...next[i], role: e.target.value };
                setAttendees(next);
              }}
              className="form-input w-40"
              data-ocid={`meetingMinutes.attendee.${i + 1}.role.input`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setAttendees((prev) => prev.filter((_, idx) => idx !== i))
              }
              data-ocid={`meetingMinutes.attendee.${i + 1}.delete_button`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setAttendees((prev) => [...prev, { name: "", role: "" }])
          }
          data-ocid="meetingMinutes.add_attendee_button"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Attendee
        </Button>
      </div>

      {/* Agenda Items */}
      <div className="form-section">
        <div className="form-section-header">Agenda Items</div>
        {agendaItems.map((item, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable IDs
            key={i}
            className="flex items-start gap-2"
          >
            <Textarea
              value={item}
              onChange={(e) => {
                const next = [...agendaItems];
                next[i] = e.target.value;
                setAgendaItems(next);
              }}
              className="form-textarea min-h-[60px] flex-1"
              data-ocid={`meetingMinutes.agenda.${i + 1}.input`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-1"
              onClick={() =>
                setAgendaItems((prev) => prev.filter((_, idx) => idx !== i))
              }
              data-ocid={`meetingMinutes.agenda.${i + 1}.delete_button`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAgendaItems((prev) => [...prev, ""])}
          data-ocid="meetingMinutes.add_agenda_button"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Agenda Item
        </Button>
      </div>

      {/* Decisions */}
      <div className="form-section">
        <div className="form-section-header">Decisions Made</div>
        {decisions.map((d, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable IDs
            key={i}
            className="flex items-start gap-2"
          >
            <Textarea
              value={d}
              onChange={(e) => {
                const next = [...decisions];
                next[i] = e.target.value;
                setDecisions(next);
              }}
              className="form-textarea min-h-[60px] flex-1"
              data-ocid={`meetingMinutes.decision.${i + 1}.input`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-1"
              onClick={() =>
                setDecisions((prev) => prev.filter((_, idx) => idx !== i))
              }
              data-ocid={`meetingMinutes.decision.${i + 1}.delete_button`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDecisions((prev) => [...prev, ""])}
          data-ocid="meetingMinutes.add_decision_button"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Decision
        </Button>
      </div>

      {/* Action Items */}
      <div className="form-section">
        <div className="form-section-header">Action Items</div>
        {actionItems.map((a, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: list items have no stable IDs
            key={i}
            className="action-item grid gap-2 sm:grid-cols-[1fr,140px,140px,auto]"
          >
            <Input
              placeholder="Action description"
              value={a.action}
              onChange={(e) => {
                const next = [...actionItems];
                next[i] = { ...next[i], action: e.target.value };
                setActionItems(next);
              }}
              className="form-input"
              data-ocid={`meetingMinutes.action.${i + 1}.description.input`}
            />
            <Input
              placeholder="Owner"
              value={a.owner}
              onChange={(e) => {
                const next = [...actionItems];
                next[i] = { ...next[i], owner: e.target.value };
                setActionItems(next);
              }}
              className="form-input"
              data-ocid={`meetingMinutes.action.${i + 1}.owner.input`}
            />
            <Input
              type="date"
              value={a.dueDate}
              onChange={(e) => {
                const next = [...actionItems];
                next[i] = { ...next[i], dueDate: e.target.value };
                setActionItems(next);
              }}
              className="form-input"
              data-ocid={`meetingMinutes.action.${i + 1}.dueDate.input`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                setActionItems((prev) => prev.filter((_, idx) => idx !== i))
              }
              data-ocid={`meetingMinutes.action.${i + 1}.delete_button`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setActionItems((prev) => [
              ...prev,
              { action: "", owner: "", dueDate: "" },
            ])
          }
          data-ocid="meetingMinutes.add_action_button"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Action Item
        </Button>
      </div>

      {/* General Notes */}
      <div className="space-y-1.5">
        <Label className="form-label">General Notes</Label>
        <Textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          className="form-textarea min-h-[80px]"
          data-ocid="meetingMinutes.generalNotes.input"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        {savedForm ? (
          <>
            <Button
              type="button"
              onClick={() => onUpdate(savedForm.id, buildData())}
              data-ocid="meetingMinutes.update_button"
            >
              Update
            </Button>
            <span className="text-xs text-muted-foreground">
              Last saved: {new Date(savedForm.submittedAt).toLocaleString()}
            </span>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => onSave(buildData())}
            data-ocid="meetingMinutes.save_button"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Addendum (read-only) ───────────────────────────────────────────────────

const ADDENDUM_ROWS = [
  {
    form: "G701",
    name: "Change Order",
    description: "Documents a change in contract sum or time",
    useCase: "Contractor and Architect approval of scope changes",
  },
  {
    form: "G702",
    name: "Application and Certificate for Payment",
    description: "Monthly payment application form",
    useCase: "Contractor requests payment; Architect certifies",
  },
  {
    form: "G703",
    name: "Continuation Sheet",
    description: "Itemized breakdown of payment application",
    useCase: "Supplemental to G702, lists SOV line items",
  },
  {
    form: "G704",
    name: "Certificate of Substantial Completion",
    description: "Certifies project is substantially complete",
    useCase: "Sets date for warranty, final payment, and occupancy",
  },
  {
    form: "G706",
    name: "Contractor's Affidavit of Payment of Debts and Claims",
    description: "Confirms all debts paid",
    useCase: "Required before final payment",
  },
  {
    form: "G706A",
    name: "Contractor's Affidavit of Release of Liens",
    description: "Confirms lien releases obtained",
    useCase: "Required before final payment",
  },
  {
    form: "G707",
    name: "Consent of Surety to Final Payment",
    description: "Surety agrees to final payment release",
    useCase: "Required when bonded project",
  },
  {
    form: "G710",
    name: "Architect's Supplemental Instructions",
    description: "Clarifies or supplements contract documents",
    useCase: "Non-cost-impacting instructions from Architect",
  },
  {
    form: "G711",
    name: "Architect's Field Report",
    description: "Documents site visit observations",
    useCase: "Architect's on-site inspection record",
  },
  {
    form: "G714",
    name: "Construction Change Directive",
    description: "Authorizes work before Change Order is executed",
    useCase: "Urgent scope changes with disputed cost",
  },
  {
    form: "G715",
    name: "Supplemental Application for Payment",
    description: "Additional payment data",
    useCase: "Supplement to G702 for complex projects",
  },
  {
    form: "OAC Minutes",
    name: "OAC Meeting Minutes",
    description: "Custom template for Owner-Architect-Contractor meetings",
    useCase: "Records attendees, agenda, decisions, action items",
  },
];

function AddendumView({ sessionId }: { sessionId: string }) {
  const { data: allForms } = useGetAIAForms(sessionId);
  const updateForm = useUpdateAIAForm();
  const deleteReviewRequest = useDeleteReviewRequest();

  const addendumEntries = (allForms ?? []).filter(
    (f) => f.formType === "Addendum",
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("pending");

  const handleStartEdit = (entry: (typeof addendumEntries)[number]) => {
    setEditingId(entry.id);
    setEditNotes(entry.fieldData.notes ?? "");
    setEditStatus(entry.fieldData.status ?? "pending");
  };

  const handleSaveEdit = async (entry: (typeof addendumEntries)[number]) => {
    await updateForm.mutateAsync({
      formId: entry.id,
      sessionId,
      fieldData: { ...entry.fieldData, notes: editNotes, status: editStatus },
    });
    setEditingId(null);
  };

  const handleRemove = async (reviewRequestId: string) => {
    await deleteReviewRequest.mutateAsync(reviewRequestId);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic review request addendums */}
      {addendumEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Drawing Review Addendums</h3>
          {addendumEntries.map((entry) => {
            const isReviewAddendum = "reviewRequestId" in entry.fieldData;
            if (!isReviewAddendum) return null;
            const isEditing = editingId === entry.id;
            return (
              <div
                key={entry.id}
                className="rounded-lg border border-l-4 border-l-blue-500 bg-card p-4 space-y-3"
                data-ocid="oac.addendum.item"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs"
                    >
                      Drawing Review
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {entry.fieldData.status ?? "pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        isEditing ? setEditingId(null) : handleStartEdit(entry)
                      }
                      data-ocid="oac.addendum.edit_button"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() =>
                        handleRemove(entry.fieldData.reviewRequestId)
                      }
                      disabled={deleteReviewRequest.isPending}
                      data-ocid="oac.addendum.delete_button"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {entry.fieldData.drawingName ?? "Drawing"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested by {entry.fieldData.requestedBy ?? "Participant"}
                    {" · "}
                    {new Date(entry.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {entry.fieldData.notes && !isEditing && (
                    <p className="text-sm text-muted-foreground pt-1">
                      {entry.fieldData.notes}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-3 pt-1 border-t border-border">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={3}
                        placeholder="Add review notes..."
                        data-ocid="oac.addendum.notes.textarea"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        data-ocid="oac.addendum.status.select"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveEdit(entry)}
                      disabled={updateForm.isPending}
                      data-ocid="oac.addendum.save_button"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Static AIA reference table */}
      <h3 className="text-lg font-semibold">AIA Forms Reference Index</h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-3 py-2 font-semibold">Form Number</th>
              <th className="px-3 py-2 font-semibold">Form Name</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold">Use Case</th>
            </tr>
          </thead>
          <tbody>
            {ADDENDUM_ROWS.map((row) => (
              <tr key={row.form} className="border-b">
                <td className="px-3 py-2 font-medium">{row.form}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {row.description}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {row.useCase}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        All forms are fillable within the Project Build Plus app. Forms are
        saved to the project record and accessible from any device.
      </p>
    </div>
  );
}

// ─── Session Detail ───────────────────────────────────────────────────────────

function SessionDetail({
  sessionId,
  onBack,
}: {
  sessionId: string;
  onBack?: () => void;
}) {
  const { data: session } = useGetOACSession(sessionId);
  const { data: forms } = useGetAIAForms(sessionId);
  const { data: meetingPackage } = useMeetingPackage(sessionId);
  const { data: participants } = useParticipantsList();

  const generateZoom = useGenerateZoomMeeting();
  const setFixedLink = useSetFixedZoomLink();
  const saveForm = useSaveAIAForm();
  const updateForm = useUpdateAIAForm();

  const [activeTab, setActiveTab] = useState<FormTab>("G702");
  const [zoomResult, setZoomResult] = useState<{
    joinUrl: string;
    meetingId: string;
  } | null>(null);
  const [fixedZoomUrl, setFixedZoomUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailBannerDismissed, setEmailBannerDismissed] = useLocalStorageState(
    "oac_email_banner_dismissed",
    false,
  );

  const savedFormForTab = useMemo(() => {
    if (!forms) return null;
    const found = forms.find((f) => f.formType === activeTab);
    return found
      ? {
          id: found.id,
          fieldData: found.fieldData,
          submittedAt: found.submittedAt,
        }
      : null;
  }, [forms, activeTab]);

  const handleGenerateZoom = async () => {
    const res = await generateZoom.mutateAsync({
      sessionId,
      topic: `OAC Meeting — ${session?.sessionDate}`,
    });
    if (res.success && res.joinUrl) {
      setZoomResult({ joinUrl: res.joinUrl, meetingId: res.meetingId ?? "" });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMeetingInvite = async () => {
    if (!session) return;
    const link = zoomResult?.joinUrl ?? session.zoomLink ?? fixedZoomUrl ?? "";
    const participantLines = meetingPackage?.participants?.length
      ? meetingPackage.participants.map((p) => `• ${p}`).join("\n")
      : (participants
          ?.map(
            (p) => `• ${p.firstName} ${p.lastName} — ${p.contact?.email ?? ""}`,
          )
          .join("\n") ?? "");

    const text = `OAC Meeting\nDate: ${formatDateDisplay(session.sessionDate)}\nTime: ${formatTimeDisplay(session.sessionTime)}\nZoom Link: ${link}\nParticipants:\n${participantLines}`;
    await handleCopy(text);
  };

  const handleSaveForm = (data: Record<string, string>) => {
    saveForm.mutate({
      sessionId,
      formType: activeTab,
      fieldData: data,
      submittedByRole: "ProjectManager",
    });
  };

  const handleUpdateForm = (formId: string, data: Record<string, string>) => {
    updateForm.mutate({ formId, fieldData: data, sessionId });
  };

  const zoomLinkDisplay = zoomResult?.joinUrl ?? session?.zoomLink ?? "";

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="meeting-header text-2xl font-bold">
              {formatDateDisplay(session.sessionDate)}
            </h2>
            <p className="meeting-date-time text-lg text-muted-foreground">
              {formatTimeDisplay(session.sessionTime)}
            </p>
          </div>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="md:hidden"
              data-ocid="oac.back_button"
            >
              Back
            </Button>
          )}
        </div>

        {/* Zoom Section */}
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            {!zoomLinkDisplay ? (
              <Button
                type="button"
                onClick={handleGenerateZoom}
                disabled={generateZoom.isPending}
                data-ocid="oac.generate_zoom_button"
              >
                <Video className="mr-2 h-4 w-4" />
                {generateZoom.isPending
                  ? "Generating..."
                  : "Generate Zoom Meeting"}
              </Button>
            ) : (
              <div className="flex w-full items-center gap-2 rounded-md bg-green-500/10 px-3 py-2 text-green-400">
                <Check className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-sm">
                  {zoomLinkDisplay}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(zoomLinkDisplay)}
                  data-ocid="oac.copy_zoom_link_button"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Fixed Link */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Paste fixed Zoom room URL"
              value={fixedZoomUrl}
              onChange={(e) => setFixedZoomUrl(e.target.value)}
              className="form-input flex-1"
              data-ocid="oac.fixed_zoom_input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (fixedZoomUrl) {
                  setFixedLink.mutate({
                    roleId: "fixed",
                    zoomLink: fixedZoomUrl,
                  });
                }
              }}
              disabled={!fixedZoomUrl || setFixedLink.isPending}
              data-ocid="oac.save_fixed_zoom_button"
            >
              Save
            </Button>
          </div>

          {/* Meeting Package */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyMeetingInvite}
              data-ocid="oac.copy_meeting_invite_button"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Meeting Invite
            </Button>
            {copied && <span className="text-sm text-green-400">Copied!</span>}
          </div>
        </div>

        {/* Email Banner */}
        {!emailBannerDismissed && (
          <div className="flex items-start gap-3 rounded-md bg-blue-500/10 px-4 py-3 text-blue-300">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm">
              To send automatic email invites to participants, contact Caffeine
              support to re-enable email sending.
            </p>
            <button
              type="button"
              onClick={() => setEmailBannerDismissed(true)}
              className="shrink-0 text-blue-300 hover:text-blue-100"
              aria-label="Dismiss"
              data-ocid="oac.dismiss_email_banner_button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* AIA Forms Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FormTab)}>
        <TabsList className="flex-wrap">
          {FORM_TABS.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              data-ocid={`oac.tab.${t.key}`}
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="G702" className="mt-4">
          <G702Form
            sessionId={sessionId}
            savedForm={savedFormForTab}
            onSave={handleSaveForm}
            onUpdate={handleUpdateForm}
          />
        </TabsContent>

        <TabsContent value="G703" className="mt-4">
          <G703Form
            sessionId={sessionId}
            savedForm={savedFormForTab}
            onSave={handleSaveForm}
            onUpdate={handleUpdateForm}
          />
        </TabsContent>

        <TabsContent value="G701" className="mt-4">
          <G701Form
            sessionId={sessionId}
            savedForm={savedFormForTab}
            onSave={handleSaveForm}
            onUpdate={handleUpdateForm}
          />
        </TabsContent>

        <TabsContent value="MeetingMinutes" className="mt-4">
          <MeetingMinutesForm
            sessionId={sessionId}
            savedForm={savedFormForTab}
            onSave={handleSaveForm}
            onUpdate={handleUpdateForm}
            participants={
              participants?.map((p) => ({
                fullName: `${p.firstName} ${p.lastName}`,
                role: p.role,
              })) ?? []
            }
          />
        </TabsContent>

        <TabsContent value="Addendum" className="mt-4">
          <AddendumView sessionId={sessionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OACMeetingPage() {
  const isLocked = useIsFeatureLocked("oacMeetings");
  const { data: sessions, isLoading } = useOACSessions();
  const createSession = useCreateOACSession();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleCreate = async () => {
    if (!newDate || !newTime) return;
    const id = await createSession.mutateAsync({
      date: newDate,
      time: newTime,
    });
    setShowNewModal(false);
    setNewDate("");
    setNewTime("");
    setSelectedSessionId(id);
  };

  const _selectedSession = sessions?.find((s) => s.id === selectedSessionId);

  return (
    <>
      {isLocked && (
        <div className="bg-amber-900/30 border border-amber-500 text-amber-200 px-4 py-3 rounded mb-4 text-sm font-medium">
          This feature is currently locked by the controller.
        </div>
      )}
      <div
        className={isLocked ? "opacity-50 pointer-events-none select-none" : ""}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">OAC Meeting</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            {/* Left Panel — Session List */}
            <div className="space-y-4">
              <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className="w-full"
                    data-ocid="oac.new_session_button"
                  >
                    <Plus className="mr-2 h-4 w-4" /> New OAC Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New OAC Session</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        data-ocid="oac.new_session_date.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        data-ocid="oac.new_session_time.input"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleCreate}
                      disabled={!newDate || !newTime || createSession.isPending}
                      data-ocid="oac.create_session_button"
                    >
                      {createSession.isPending
                        ? "Creating..."
                        : "Create Session"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((s) => {
                    const hasZoom = !!(s.zoomLink || s.zoomMeetingId);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSessionId(s.id)}
                        className={cn(
                          "meeting-card w-full text-left transition-smooth",
                          selectedSessionId === s.id && "ring-2 ring-primary",
                        )}
                        data-ocid={`oac.session_card.${s.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="meeting-date-time font-semibold">
                              {formatDateDisplay(s.sessionDate)}
                            </p>
                            <p className="meeting-meta text-sm text-muted-foreground">
                              {formatTimeDisplay(s.sessionTime)}
                            </p>
                          </div>
                          <Badge
                            variant={hasZoom ? "default" : "secondary"}
                            className="shrink-0"
                          >
                            {hasZoom ? "Zoom Ready" : "No Zoom"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          <span>
                            {s.linkedCategoryId ? "1 form" : "0 forms"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                    <CalendarDays className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>
                      No sessions yet. Click New OAC Session to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Session Detail */}
            <div className="min-h-[400px] rounded-lg border bg-card p-4 sm:p-6">
              {selectedSessionId ? (
                <SessionDetail
                  sessionId={selectedSessionId}
                  onBack={() => setSelectedSessionId(null)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <CalendarDays className="mb-3 h-12 w-12 opacity-40" />
                  <p className="text-lg font-medium">
                    Select a session to view details
                  </p>
                  <p className="text-sm">
                    Choose an OAC session from the list to manage forms and Zoom
                    links.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
