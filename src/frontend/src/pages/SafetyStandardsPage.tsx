import { ComplianceChecklistsTab } from "@/components/safety/ComplianceChecklistsTab";
import { CriticalChangePlansTab } from "@/components/safety/CriticalChangePlansTab";
import { NCCERCertsTab } from "@/components/safety/NCCERCertsTab";
import { ReferenceLibraryTab } from "@/components/safety/ReferenceLibraryTab";
import {
  ALL_ROLES,
  COMPLIANCE_ACCESS_ROLES,
  EHS_ROLES,
} from "@/components/safety/safetyData";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useIsFeatureLocked } from "../context/FeatureLockContext";

export default function SafetyStandardsPage() {
  const isLocked = useIsFeatureLocked("compliance");
  const [currentRole, setCurrentRole] = useState<string>("Owner");

  const canAccessCompliance = COMPLIANCE_ACCESS_ROLES.includes(currentRole);
  const canManageCriticalPlans = EHS_ROLES.includes(currentRole);

  const tabList = [
    { value: "reference", label: "Reference Library" },
    ...(canAccessCompliance
      ? [
          { value: "compliance", label: "Compliance Checklists" },
          { value: "nccer", label: "NCCER Certifications" },
        ]
      : []),
    ...(canManageCriticalPlans
      ? [{ value: "critical", label: "Critical Change Plans" }]
      : []),
  ];

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
        <div className="space-y-6" data-ocid="safety.page">
          {/* Header */}
          <div className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-safety" />
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Safety Standards &amp; Compliance
                  </h1>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  OSHA, ANSI, IEEE, NCCER, and IBC standards with compliance
                  tracking and certification management
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Your Role:
                </span>
                <Select value={currentRole} onValueChange={setCurrentRole}>
                  <SelectTrigger
                    className="w-[180px]"
                    data-ocid="safety.role_selector"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Permission notice for locked tabs */}
          {!canAccessCompliance && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <Lock className="h-4 w-4 text-amber-400" />
              <p className="text-xs text-amber-400">
                Compliance Checklists and NCCER Certifications are hidden.
                Switch to a role with compliance access to view them.
              </p>
            </div>
          )}

          <Tabs defaultValue="reference" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto">
              {tabList.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="text-xs"
                  data-ocid={`safety.tab.${t.value}`}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="reference">
              <ReferenceLibraryTab />
            </TabsContent>

            {canAccessCompliance && (
              <>
                <TabsContent value="compliance">
                  <ComplianceChecklistsTab currentRole={currentRole} />
                </TabsContent>
                <TabsContent value="nccer">
                  <NCCERCertsTab />
                </TabsContent>
              </>
            )}

            {canManageCriticalPlans && (
              <TabsContent value="critical">
                <CriticalChangePlansTab currentRole={currentRole} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
}
