import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  FileText,
  FolderOpen,
  Layers,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────

type AutodeskCategory =
  | "autodesk-files"
  | "drawings-specs"
  | "mechanical"
  | "civil"
  | "communications"
  | "cloud";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  category: AutodeskCategory;
  url: string;
}

const ACCEPTED_TYPES = [
  ".pdf",
  ".dwg",
  ".dxf",
  ".rvt",
  ".ifc",
  ".step",
  ".iges",
  ".jpg",
  ".jpeg",
  ".png",
];
const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
];

const TABS: { id: AutodeskCategory; label: string; icon: React.ReactNode }[] = [
  {
    id: "autodesk-files",
    label: "AutoDesk Files",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  {
    id: "drawings-specs",
    label: "Drawings & Specs",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "mechanical",
    label: "Mechanical Engineering",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: "civil",
    label: "Civil Engineering",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: "communications",
    label: "Communications",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "cloud",
    label: "Autodesk Cloud",
    icon: <ExternalLink className="h-4 w-4" />,
  },
];

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-500/20 text-red-400 border-red-500/30",
  dwg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  dxf: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  rvt: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ifc: "bg-green-500/20 text-green-400 border-green-500/30",
  step: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  iges: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  jpg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  jpeg: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  png: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

function getExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Upload zone ─────────────────────────────────────────────────────────

interface UploadZoneProps {
  category: AutodeskCategory;
  onFiles: (files: File[], category: AutodeskCategory) => void;
  progress: number | null;
}

function UploadZone({ category, onFiles, progress }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const arr = Array.from(files);
      const valid = arr.filter((f) => {
        const ext = `.${getExt(f.name)}`;
        return (
          ACCEPTED_TYPES.includes(ext) ||
          ACCEPTED_MIME.includes(f.type) ||
          ext === ".iges"
        );
      });
      if (valid.length) onFiles(valid, category);
    },
    [category, onFiles],
  );

  return (
    <div className="mb-5">
      <button
        type="button"
        aria-label="Upload files by dragging or clicking"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          dragging
            ? "border-[#0ea5e9] bg-[#0ea5e9]/10"
            : "border-white/15 bg-[#0f172a] hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5"
        }`}
        data-ocid="autodesk.dropzone"
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-[#0ea5e9]/60" />
        <p className="text-sm font-medium text-white">
          Drop files here or{" "}
          <span className="text-[#38bdf8] underline underline-offset-2">
            browse
          </span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PDF · DWG · DXF · RVT · IFC · STEP · IGES · JPG · PNG
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handle(e.target.files)}
          data-ocid="autodesk.upload_button"
        />
      </button>

      {progress !== null && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#0ea5e9] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── File list ───────────────────────────────────────────────────────────

interface FileListProps {
  files: UploadedFile[];
  onDelete: (id: string) => void;
}

function FileList({ files, onDelete }: FileListProps) {
  if (files.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0f172a] py-12 text-center"
        data-ocid="autodesk.empty_state"
      >
        <FolderOpen className="mb-3 h-10 w-10 text-[#0ea5e9]/30" />
        <p className="text-sm text-gray-500">No files uploaded yet</p>
        <p className="mt-1 text-xs text-gray-600">
          Upload files using the zone above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-ocid="autodesk.file_list">
      {files.map((file, idx) => {
        const ext = getExt(file.name);
        const colorClass =
          FILE_TYPE_COLORS[ext] ??
          "bg-gray-500/20 text-gray-400 border-gray-500/30";
        return (
          <div
            key={file.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 hover:bg-white/5 transition-colors"
            data-ocid={`autodesk.file_list.item.${idx + 1}`}
          >
            <FileText className="h-5 w-5 shrink-0 text-[#0ea5e9]/70" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {fmtSize(file.size)} · Uploaded {file.uploadedAt}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 text-[10px] uppercase tracking-wider border ${colorClass}`}
            >
              {ext}
            </Badge>
            <button
              type="button"
              onClick={() => {
                const a = document.createElement("a");
                a.href = file.url;
                a.download = file.name;
                a.click();
              }}
              className="shrink-0 rounded-md bg-[#0ea5e9]/10 px-2.5 py-1 text-xs text-[#38bdf8] hover:bg-[#0ea5e9]/20 transition-colors"
              data-ocid={`autodesk.file_list.item.${idx + 1}.download_button`}
            >
              Download
            </button>
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="shrink-0 rounded-md p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              aria-label={`Delete ${file.name}`}
              data-ocid={`autodesk.file_list.item.${idx + 1}.delete_button`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Cloud Gateway ───────────────────────────────────────────────────────

function CloudGateway() {
  return (
    <div className="space-y-6" data-ocid="autodesk.cloud_gateway">
      {/* Header */}
      <div className="rounded-xl border border-[#0ea5e9]/30 bg-gradient-to-r from-[#0f172a] to-[#0f2a3f] px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Autodesk Cloud Services
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Access the full suite of Autodesk cloud tools including AutoCAD
              Web, Revit, Civil 3D, and BIM 360 — all connected to your project
              data.
            </p>
          </div>
          <div
            className="h-14 w-14 shrink-0 rounded-xl bg-[#0ea5e9]/15 flex items-center justify-center"
            aria-hidden="true"
          >
            <ExternalLink className="h-7 w-7 text-[#38bdf8]" />
          </div>
        </div>
      </div>

      {/* Service tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "AutoCAD Web",
            desc: "Design, draft, and annotate from your browser",
            tag: "CAD",
          },
          {
            title: "Revit",
            desc: "BIM modelling for buildings and infrastructure",
            tag: "BIM",
          },
          {
            title: "Civil 3D",
            desc: "Civil engineering design and documentation",
            tag: "Civil",
          },
          {
            title: "BIM 360",
            desc: "Centralized project management and collaboration",
            tag: "Collab",
          },
          {
            title: "Inventor",
            desc: "3D mechanical design and simulation tools",
            tag: "Mechanical",
          },
          {
            title: "Fusion 360",
            desc: "Integrated CAD/CAM/CAE cloud platform",
            tag: "Cloud",
          },
        ].map((svc) => (
          <div
            key={svc.title}
            className="rounded-xl border border-white/10 bg-[#1e293b] px-5 py-4 hover:border-[#0ea5e9]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-white text-sm">{svc.title}</h3>
              <Badge
                variant="outline"
                className="text-[10px] border-[#0ea5e9]/30 text-[#38bdf8] shrink-0"
              >
                {svc.tag}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">{svc.desc}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-white/10 bg-[#1e293b] px-6 py-5">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">
            Ready to connect your project to Autodesk?
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Visit Autodesk.com to explore products or start a subscription.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="border-[#0ea5e9]/40 text-[#38bdf8] hover:bg-[#0ea5e9]/10"
            onClick={() => window.open("https://www.autodesk.com", "_blank")}
            data-ocid="autodesk.visit_autodesk_button"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Visit Autodesk
          </Button>
          <Button
            type="button"
            className="bg-[#0ea5e9] text-white hover:bg-[#0284c7]"
            onClick={() =>
              window.open("https://www.autodesk.com/products", "_blank")
            }
            data-ocid="autodesk.subscribe_button"
          >
            Subscribe to Autodesk
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────

export default function AutodeskPage() {
  const [activeTab, setActiveTab] =
    useState<AutodeskCategory>("autodesk-files");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Record<AutodeskCategory, number | null>
  >({
    "autodesk-files": null,
    "drawings-specs": null,
    mechanical: null,
    civil: null,
    communications: null,
    cloud: null,
  });

  const handleFiles = useCallback(
    (newFiles: File[], category: AutodeskCategory) => {
      setUploadProgress((p) => ({ ...p, [category]: 0 }));
      let pct = 0;
      const interval = setInterval(() => {
        pct += Math.floor(Math.random() * 18) + 8;
        if (pct >= 100) {
          pct = 100;
          clearInterval(interval);
          const now = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          setFiles((prev) => [
            ...prev,
            ...newFiles.map((f) => ({
              id: `${Date.now()}-${f.name}`,
              name: f.name,
              type: f.type,
              size: f.size,
              uploadedAt: now,
              category,
              url: URL.createObjectURL(f),
            })),
          ]);
          setUploadProgress((p) => ({ ...p, [category]: null }));
        } else {
          setUploadProgress((p) => ({ ...p, [category]: pct }));
        }
      }, 150);
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const tabFiles = files.filter((f) => f.category === activeTab);

  return (
    <div className="space-y-6" data-ocid="autodesk.page">
      {/* Header */}
      <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-[#1e293b] px-6 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0ea5e9]/15">
          <FolderOpen className="h-6 w-6 text-[#0ea5e9]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-white">
            AutoDesk Document Hub
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Upload and manage AutoDesk files, engineering drawings,
            specifications, and project communications. Access Autodesk Cloud
            services directly.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex flex-wrap gap-2"
        data-ocid="autodesk.tab_bar"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#0ea5e9] text-white shadow-md"
                : "border border-white/15 bg-[#1e293b] text-gray-300 hover:bg-white/10"
            }`}
            data-ocid={`autodesk.tab.${tab.id}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-white/10 bg-[#1e293b] px-6 py-5">
        {activeTab === "cloud" ? (
          <CloudGateway />
        ) : (
          <>
            <UploadZone
              category={activeTab}
              onFiles={handleFiles}
              progress={uploadProgress[activeTab]}
            />
            <FileList files={tabFiles} onDelete={handleDelete} />
          </>
        )}
      </div>
    </div>
  );
}
