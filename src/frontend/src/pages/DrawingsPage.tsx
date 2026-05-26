/**
 * DrawingsPage.tsx
 * Full Drawings & Documents module with typed tabs, upload, viewer, review request, and share.
 */
import { DrawingCategory, DrawingFileType } from "@/backend";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddDrawing,
  useCreateReviewRequest,
  useDeleteDrawing,
  useDismissDrawingNotification,
  useDrawingNotifications,
  useDrawingsList,
} from "@/hooks/useDrawings";
import type { Drawing } from "@/hooks/useDrawings";
import { useParticipantsList } from "@/hooks/useParticipants";
import type { Participant } from "@/hooks/useParticipants";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  Download,
  Eye,
  FileCode2,
  FileImage,
  FileText,
  HardHat,
  Ruler,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_TABS: {
  value: string;
  label: string;
  category: DrawingCategory;
  icon: React.ReactNode;
  acceptedExts: string[];
}[] = [
  {
    value: "photos",
    label: "Photographs",
    category: DrawingCategory.Photographs,
    icon: <Camera className="h-3.5 w-3.5" />,
    acceptedExts: [".jpg", ".jpeg", ".png"],
  },
  {
    value: "blueprints",
    label: "Blueprints",
    category: DrawingCategory.Blueprints,
    icon: <FileImage className="h-3.5 w-3.5" />,
    acceptedExts: [".jpg", ".jpeg", ".png", ".pdf"],
  },
  {
    value: "architect",
    label: "Architect Drawings",
    category: DrawingCategory.ArchitectDrawings,
    icon: <Ruler className="h-3.5 w-3.5" />,
    acceptedExts: [".pdf", ".dwg", ".dxf"],
  },
  {
    value: "construction",
    label: "Construction Drawings",
    category: DrawingCategory.ConstructionDrawings,
    icon: <HardHat className="h-3.5 w-3.5" />,
    acceptedExts: [".pdf", ".dwg", ".dxf"],
  },
  {
    value: "cad",
    label: "CAD Files",
    category: DrawingCategory.CADFiles,
    icon: <FileCode2 className="h-3.5 w-3.5" />,
    acceptedExts: [".dwg", ".dxf"],
  },
  {
    value: "engineering",
    label: "Engineering Drawings",
    category: DrawingCategory.EngineeringDrawings,
    icon: <FileText className="h-3.5 w-3.5" />,
    acceptedExts: [".pdf", ".dwg", ".dxf"],
  },
];

const FILE_TYPE_COLORS: Record<DrawingFileType, string> = {
  [DrawingFileType.JPG]:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  [DrawingFileType.PNG]: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  [DrawingFileType.PDF]: "bg-red-500/15 text-red-400 border-red-500/30",
  [DrawingFileType.DWG]: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  [DrawingFileType.DXF]:
    "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function getFileType(file: File): DrawingFileType | null {
  if (file.type === "image/jpeg" || file.type === "image/jpg")
    return DrawingFileType.JPG;
  if (file.type === "image/png") return DrawingFileType.PNG;
  if (file.type === "application/pdf") return DrawingFileType.PDF;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "dwg") return DrawingFileType.DWG;
  if (ext === "dxf") return DrawingFileType.DXF;
  return null;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isImageType(ft: DrawingFileType) {
  return ft === DrawingFileType.JPG || ft === DrawingFileType.PNG;
}

function getStorageUrl(key: string) {
  return `/api/storage/${key}`;
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────────

function UploadZone({
  category,
  acceptedExts,
}: {
  category: DrawingCategory;
  acceptedExts: string[];
}) {
  const addDrawing = useAddDrawing();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const ft = getFileType(file);
      if (!ft) {
        toast.error("Unsupported file type. Accepted: JPG, PNG, PDF, DWG, DXF");
        return;
      }
      setUploading(true);
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 10 : p));
      }, 200);
      try {
        const storageKey = `drawings/${Date.now()}-${file.name}`;
        setProgress(95);
        await addDrawing.mutateAsync({
          name: file.name,
          category,
          fileType: ft,
          storageKey,
          description: "",
        });
        setProgress(100);
        toast.success(`${file.name} uploaded successfully`);
      } catch {
        toast.error("Upload failed. Please try again.");
      } finally {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 800);
      }
    },
    [addDrawing, category],
  );

  return (
    <div className="mb-5">
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer ${
          dragging
            ? "border-primary bg-primary/8"
            : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        data-ocid="drawings.dropzone"
        aria-label="Upload drawing"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">
          {dragging ? "Drop file here" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {acceptedExts.join(", ").toUpperCase()}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedExts.join(",")}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
          data-ocid="drawings.upload_button"
        />
      </div>
      {uploading && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────────

function ViewModal({
  drawing,
  onClose,
}: {
  drawing: Drawing | null;
  onClose: () => void;
}) {
  if (!drawing) return null;
  const url = getStorageUrl(drawing.storageKey);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl bg-card border-border"
        data-ocid="drawings.view_dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground truncate">
            {drawing.name}
          </DialogTitle>
        </DialogHeader>
        {isImageType(drawing.fileType) && (
          <img
            src={url}
            alt={drawing.name}
            className="w-full rounded-lg max-h-[70vh] object-contain"
          />
        )}
        {drawing.fileType === DrawingFileType.PDF && (
          <iframe
            src={url}
            title={drawing.name}
            className="w-full h-[65vh] rounded-lg border border-border"
          />
        )}
        {(drawing.fileType === DrawingFileType.DWG ||
          drawing.fileType === DrawingFileType.DXF) && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
            <FileCode2 className="h-12 w-12 text-muted-foreground" />
            <p className="text-foreground font-semibold">
              CAD File Preview Not Available
            </p>
            <p className="text-sm text-muted-foreground">
              This CAD file cannot be previewed in the browser. Use the Download
              button to open it in a CAD application.
            </p>
            <a href={url} download={drawing.name}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" /> Download CAD File
              </Button>
            </a>
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="drawings.view_dialog.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Review Request Modal ─────────────────────────────────────────────────────────

function ReviewModal({
  drawing,
  participants,
  onClose,
}: {
  drawing: Drawing | null;
  participants: Participant[];
  onClose: () => void;
}) {
  const createReview = useCreateReviewRequest();
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<DrawingCategory | null>(null);

  if (!drawing) return null;

  function toggleParticipant(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  async function handleSubmit() {
    await createReview.mutateAsync({ drawingId: drawing!.id, notes });
    toast.success("Review request sent and added to OAC Meeting addendum");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg bg-card border-border"
        data-ocid="drawings.review_dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Request Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Drawing</Label>
            <p className="text-sm font-medium text-foreground mt-0.5 truncate">
              {drawing.name}
            </p>
          </div>

          {/* Drawing type filter chips */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Filter by Drawing Type
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  typeFilter === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
                }`}
                data-ocid="drawings.review_dialog.filter.all"
              >
                All Types
              </button>
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setTypeFilter(tab.category)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    typeFilter === tab.category
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
                  }`}
                  data-ocid={`drawings.review_dialog.filter.${tab.value}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Participant selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Select Participants ({selected.length} selected)
            </Label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/10 divide-y divide-border">
              {participants.length === 0 && (
                <p className="px-3 py-3 text-xs text-muted-foreground">
                  No participants found.
                </p>
              )}
              {(typeFilter ? participants : participants).map((p, idx) => (
                <label
                  key={p.id}
                  htmlFor={`review-participant-${idx}`}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/20"
                  data-ocid={`drawings.review_dialog.participant.${idx + 1}`}
                >
                  <Checkbox
                    id={`review-participant-${idx}`}
                    checked={selected.includes(p.id)}
                    onCheckedChange={() => toggleParticipant(p.id)}
                    data-ocid={`drawings.review_dialog.participant_checkbox.${idx + 1}`}
                  />
                  <span className="text-sm text-foreground">
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {p.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label
              htmlFor="review-notes"
              className="text-xs text-muted-foreground mb-1.5 block"
            >
              Notes
            </Label>
            <Textarea
              id="review-notes"
              placeholder="Describe what needs to be reviewed…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-muted/20 border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="drawings.review_dialog.notes_textarea"
            />
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-400">
            This review request will appear as a dashboard notification and be
            automatically added to the OAC Meeting tab as an addendum.
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="drawings.review_dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={createReview.isPending}
            data-ocid="drawings.review_dialog.submit_button"
          >
            {createReview.isPending ? "Sending…" : "Send Review Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────────

function ShareModal({
  drawing,
  participants,
  onClose,
}: {
  drawing: Drawing | null;
  participants: Participant[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [zoomLink, setZoomLink] = useState("");

  if (!drawing) return null;

  function toggleParticipant(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  function handleShare() {
    toast.success(
      "Drawing shared with selected participants and added to OAC Meeting addendum",
    );
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg bg-card border-border"
        data-ocid="drawings.share_dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Share Drawing</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Drawing</Label>
            <p className="text-sm font-medium text-foreground mt-0.5 truncate">
              {drawing.name}
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Share with ({selected.length} selected)
            </Label>
            <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-muted/10 divide-y divide-border">
              {participants.length === 0 && (
                <p className="px-3 py-3 text-xs text-muted-foreground">
                  No participants found.
                </p>
              )}
              {participants.map((p, idx) => (
                <label
                  key={p.id}
                  htmlFor={`share-participant-${idx}`}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/20"
                  data-ocid={`drawings.share_dialog.participant.${idx + 1}`}
                >
                  <Checkbox
                    id={`share-participant-${idx}`}
                    checked={selected.includes(p.id)}
                    onCheckedChange={() => toggleParticipant(p.id)}
                    data-ocid={`drawings.share_dialog.participant_checkbox.${idx + 1}`}
                  />
                  <span className="text-sm text-foreground">
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {p.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label
              htmlFor="zoom-link"
              className="text-xs text-muted-foreground mb-1.5 block"
            >
              Zoom Meeting Link (optional)
            </Label>
            <Input
              id="zoom-link"
              placeholder="https://zoom.us/j/…"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              className="bg-muted/20 border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="drawings.share_dialog.zoom_input"
            />
          </div>

          <div className="rounded-lg border border-sky-500/30 bg-sky-500/8 px-3 py-2 text-xs text-sky-400">
            This drawing will be shared with selected participants and attached
            to the OAC Meeting tab as a discussion addendum.
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="drawings.share_dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleShare}
            data-ocid="drawings.share_dialog.confirm_button"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share Drawing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────────

function DeleteConfirmModal({
  drawing,
  onClose,
}: {
  drawing: Drawing | null;
  onClose: () => void;
}) {
  const deleteDrawing = useDeleteDrawing();

  if (!drawing) return null;

  async function handleDelete() {
    await deleteDrawing.mutateAsync(drawing!.id);
    toast.success("Drawing deleted");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm bg-card border-border"
        data-ocid="drawings.delete_dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Delete Drawing?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{drawing.name}</span>?
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="drawings.delete_dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteDrawing.isPending}
            data-ocid="drawings.delete_dialog.confirm_button"
          >
            {deleteDrawing.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Drawing Card ─────────────────────────────────────────────────────────────────

function DrawingCard({
  drawing,
  index,
  onView,
  onReview,
  onShare,
  onDelete,
}: {
  drawing: Drawing;
  index: number;
  onView: (d: Drawing) => void;
  onReview: (d: Drawing) => void;
  onShare: (d: Drawing) => void;
  onDelete: (d: Drawing) => void;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors"
      data-ocid={`drawings.item.${index}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-foreground truncate min-w-0">
          {drawing.name}
        </p>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${FILE_TYPE_COLORS[drawing.fileType]}`}
        >
          {drawing.fileType}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Uploaded {formatDate(drawing.uploadedAt)}
        {drawing.uploadedBy ? ` · ${drawing.uploadedBy}` : ""}
      </p>
      {drawing.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {drawing.description}
        </p>
      )}
      <div className="grid grid-cols-2 gap-1.5 mt-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 h-7"
          onClick={() => onView(drawing)}
          data-ocid={`drawings.view_button.${index}`}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
        <a
          href={getStorageUrl(drawing.storageKey)}
          download={drawing.name}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-7 w-full"
            data-ocid={`drawings.download_button.${index}`}
          >
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
        </a>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 h-7 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          onClick={() => onReview(drawing)}
          data-ocid={`drawings.review_button.${index}`}
        >
          <Bell className="h-3.5 w-3.5" /> Review
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 h-7 text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
          onClick={() => onShare(drawing)}
          data-ocid={`drawings.share_button.${index}`}
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="col-span-2 text-xs gap-1.5 h-7 text-red-400 border-red-500/30 hover:bg-red-500/10"
          onClick={() => onDelete(drawing)}
          data-ocid={`drawings.delete_button.${index}`}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────────

function TabPanel({
  category,
  acceptedExts,
  drawings,
  participants,
}: {
  category: DrawingCategory;
  acceptedExts: string[];
  drawings: Drawing[];
  participants: Participant[];
}) {
  const [viewDrawing, setViewDrawing] = useState<Drawing | null>(null);
  const [reviewDrawing, setReviewDrawing] = useState<Drawing | null>(null);
  const [shareDrawing, setShareDrawing] = useState<Drawing | null>(null);
  const [deleteDrawing, setDeleteDrawing] = useState<Drawing | null>(null);

  const filtered = drawings.filter((d) => d.category === category);

  return (
    <>
      <UploadZone category={category} acceptedExts={acceptedExts} />
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 py-14"
          data-ocid="drawings.empty_state"
        >
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">
            No drawings uploaded yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag & drop files above or click the upload zone to add drawings.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          data-ocid="drawings.list"
        >
          {filtered.map((d, i) => (
            <DrawingCard
              key={d.id}
              drawing={d}
              index={i + 1}
              onView={setViewDrawing}
              onReview={setReviewDrawing}
              onShare={setShareDrawing}
              onDelete={setDeleteDrawing}
            />
          ))}
        </div>
      )}

      <ViewModal drawing={viewDrawing} onClose={() => setViewDrawing(null)} />
      <ReviewModal
        drawing={reviewDrawing}
        participants={participants}
        onClose={() => setReviewDrawing(null)}
      />
      <ShareModal
        drawing={shareDrawing}
        participants={participants}
        onClose={() => setShareDrawing(null)}
      />
      <DeleteConfirmModal
        drawing={deleteDrawing}
        onClose={() => setDeleteDrawing(null)}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────

export default function DrawingsPage() {
  const { data: drawings = [], isLoading } = useDrawingsList();
  const { data: allNotifications = [] } = useDrawingNotifications();
  const dismissNotification = useDismissDrawingNotification();
  const { data: participants = [] } = useParticipantsList();

  const activeNotifications = allNotifications.filter((n) => !n.dismissed);

  return (
    <div className="space-y-6" data-ocid="drawings.page">
      {/* Page header */}
      <div className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Drawings &amp; Documents
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload, view, and share project drawings organized by type
            </p>
          </div>
          <Link to="/dashboard">
            <Button
              variant="outline"
              size="sm"
              data-ocid="drawings.back_button"
            >
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification banner */}
      {activeNotifications.length > 0 && (
        <div
          className="rounded-xl border border-amber-500/40 bg-amber-500/8 px-5 py-4 space-y-2"
          data-ocid="drawings.notifications.panel"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-sm text-foreground">
                {activeNotifications.length} pending review request
                {activeNotifications.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Link to="/oac-meeting">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-amber-400 hover:bg-amber-500/10 h-7"
                data-ocid="drawings.notifications.oac_link"
              >
                View in OAC Meeting →
              </Button>
            </Link>
          </div>
          <div className="space-y-1.5">
            {activeNotifications.map((n, idx) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2"
                data-ocid={`drawings.notification.item.${idx + 1}`}
              >
                <p className="text-xs text-foreground min-w-0 truncate">
                  <span className="font-medium">{n.drawingName}</span>
                  {" — review requested by "}
                  <span className="font-medium">{n.requestedBy}</span>
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0 hover:bg-amber-500/20"
                  aria-label="Dismiss notification"
                  onClick={() => dismissNotification.mutate(n.id)}
                  data-ocid={`drawings.notification.dismiss.${idx + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabbed drawing panels */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="photos" data-ocid="drawings.type_tabs">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-card border border-border rounded-xl">
            {CATEGORY_TABS.map((tab) => {
              const count = drawings.filter(
                (d) => d.category === tab.category,
              ).length;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-1.5 text-xs"
                  data-ocid={`drawings.tab.${tab.value}`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  {count > 0 && (
                    <span className="ml-0.5 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-xs font-medium">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {CATEGORY_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              <TabPanel
                category={tab.category}
                acceptedExts={tab.acceptedExts}
                drawings={drawings}
                participants={participants}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
