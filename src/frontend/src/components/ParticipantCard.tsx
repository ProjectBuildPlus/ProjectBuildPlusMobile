import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Participant,
  ParticipantRole,
  ParticipantStatus,
} from "@/hooks/useParticipants";
import { Building2, Mail, Phone, Smartphone } from "lucide-react";

const ROLE_LABELS: Record<ParticipantRole, string> = {
  Owner: "Owner",
  Architect: "Architect",
  Designer: "Designer",
  CivilEngineer: "Civil Engineer",
  MechanicalEngineer: "Mechanical Engineer",
  SpecialtyEngineer: "Specialty Engineer",
  ConstructionManager: "Construction Manager",
  Contractor: "Contractor",
};

const ROLE_COLORS: Record<ParticipantRole, string> = {
  Owner: "bg-red-600/20 text-red-400 border-red-600/40",
  Architect: "bg-primary/15 text-primary border-primary/30",
  Designer: "bg-accent/15 text-accent-foreground border-accent/30",
  CivilEngineer: "bg-blue-600/20 text-blue-400 border-blue-600/40",
  MechanicalEngineer: "bg-indigo-600/20 text-indigo-400 border-indigo-600/40",
  SpecialtyEngineer: "bg-violet-600/20 text-violet-400 border-violet-600/40",
  ConstructionManager: "bg-amber-600/20 text-amber-400 border-amber-600/40",
  Contractor: "bg-emerald-600/20 text-emerald-400 border-emerald-600/40",
};

const STATUS_STYLES: Record<ParticipantStatus, string> = {
  pending: "bg-amber-600/15 text-amber-400 border-amber-600/30",
  approved: "bg-emerald-600/15 text-emerald-400 border-emerald-600/30",
  rejected: "bg-red-600/15 text-red-400 border-red-600/30",
  active: "bg-primary/15 text-primary border-primary/30",
};

const STATUS_LABELS: Record<ParticipantStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  active: "Active",
};

interface ParticipantCardProps {
  participant: Participant;
  onViewDetails?: (participant: Participant) => void;
  compact?: boolean;
}

export function ParticipantCard({
  participant,
  onViewDetails,
  compact,
}: ParticipantCardProps) {
  const fullName = `${participant.firstName} ${participant.lastName}`;

  return (
    <Card className="border-border bg-card transition-smooth hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-display text-base font-semibold text-foreground truncate">
                {fullName}
              </h3>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                  ROLE_COLORS[participant.role]
                }`}
              >
                {ROLE_LABELS[participant.role]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {participant.company.name}
              </span>
              {participant.company.trade && (
                <span className="text-muted-foreground/50">·</span>
              )}
              {participant.company.trade && (
                <span className="text-xs text-muted-foreground/70 truncate">
                  {participant.company.trade}
                </span>
              )}
            </div>

            {!compact && (
              <div className="space-y-1">
                <a
                  href={`mailto:${participant.contact.email}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{participant.contact.email}</span>
                </a>
                {participant.contact.officePhone && (
                  <a
                    href={`tel:${participant.contact.officePhone}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{participant.contact.officePhone}</span>
                  </a>
                )}
                {participant.contact.mobilePhone && (
                  <a
                    href={`tel:${participant.contact.mobilePhone}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Smartphone className="h-3.5 w-3.5 shrink-0" />
                    <span>{participant.contact.mobilePhone}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge
              className={`border text-xs ${STATUS_STYLES[participant.status]}`}
              variant="outline"
            >
              {STATUS_LABELS[participant.status]}
            </Badge>
            {onViewDetails && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                onClick={() => onViewDetails(participant)}
                data-ocid="directory.view_details_button"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ROLE_LABELS, ROLE_COLORS, STATUS_LABELS, STATUS_STYLES };
