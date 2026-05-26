import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Apple, Check, Clipboard, Smartphone, Watch } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { SiAndroid, SiGoogle, SiMotorola } from "react-icons/si";
import { toast } from "sonner";

const APP_URL = typeof window !== "undefined" ? window.location.origin : "";

interface PlatformButton {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const PLATFORM_BUTTONS: PlatformButton[] = [
  {
    label: "iPhone (App Store)",
    href: "https://apps.apple.com/search?term=project+build+plus",
    icon: <Apple className="h-4 w-4" />,
    color: "text-foreground",
  },
  {
    label: "Apple Watch",
    href: "https://apps.apple.com/search?term=project+build+plus",
    icon: <Watch className="h-4 w-4" />,
    color: "text-foreground",
  },
  {
    label: "Android",
    href: "https://play.google.com/store/search?q=project+build+plus&c=apps",
    icon: <SiAndroid className="h-4 w-4" />,
    color: "text-green-400",
  },
  {
    label: "Google Play",
    href: "https://play.google.com/store/search?q=project+build+plus&c=apps",
    icon: <SiGoogle className="h-4 w-4" />,
    color: "text-blue-400",
  },
  {
    label: "Motorola",
    href: "https://play.google.com/store/search?q=project+build+plus&c=apps",
    icon: <SiMotorola className="h-4 w-4" />,
    color: "text-red-400",
  },
  {
    label: "Verizon Support",
    href: "https://www.verizon.com/support/",
    icon: <Smartphone className="h-4 w-4" />,
    color: "text-[oklch(0.65_0.18_250)]",
  },
  {
    label: "T-Mobile Support",
    href: "https://www.t-mobile.com/support",
    icon: <Smartphone className="h-4 w-4" />,
    color: "text-pink-400",
  },
];

const OAC_URL =
  typeof window !== "undefined" ? `${window.location.origin}/oac-meeting` : "";

export function MobileAccessPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oacCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const [oacQrReady, setOacQrReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [oacCopied, setOacCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, APP_URL || "https://caffeine.ai", {
      width: 220,
      margin: 2,
      color: { dark: "#0d1117", light: "#f0f9ff" },
      errorCorrectionLevel: "H",
    })
      .then(() => setQrReady(true))
      .catch(() => setQrReady(true));
  }, []);

  useEffect(() => {
    if (!oacCanvasRef.current) return;
    QRCode.toCanvas(oacCanvasRef.current, OAC_URL || "https://caffeine.ai", {
      width: 220,
      margin: 2,
      color: { dark: "#0d1117", light: "#f0fff4" },
      errorCorrectionLevel: "H",
    })
      .then(() => setOacQrReady(true))
      .catch(() => setOacQrReady(true));
  }, []);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      toast.success("App link copied!", {
        description: APP_URL,
        duration: 4000,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  async function handleCopyOacLink() {
    try {
      await navigator.clipboard.writeText(OAC_URL);
      setOacCopied(true);
      toast.success("OAC Meeting link copied!", {
        description: OAC_URL,
        duration: 4000,
      });
      setTimeout(() => setOacCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div
      className="rounded-xl border border-primary/30 bg-card overflow-hidden"
      data-ocid="dashboard.mobile_access.card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border-b border-primary/20">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Smartphone className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-foreground">
            Mobile App Access
          </h2>
          <p className="text-xs text-muted-foreground">
            Available on all devices &amp; carriers
          </p>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div
              className="relative rounded-xl border-2 border-primary/30 p-2
                bg-[oklch(0.97_0.01_220)] shadow-md"
              data-ocid="dashboard.mobile_access.qr_code"
            >
              {!qrReady && (
                <Skeleton className="h-[220px] w-[220px] rounded-lg" />
              )}
              <canvas
                ref={canvasRef}
                className={`rounded-lg transition-opacity duration-300 ${
                  qrReady ? "opacity-100" : "opacity-0 absolute"
                }`}
                aria-label="QR code to open Project Build Plus on mobile"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground max-w-[220px] leading-snug">
              Scan to open Project Build Plus on any mobile device
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="w-full max-w-[220px] gap-1.5 transition-colors duration-200"
              data-ocid="dashboard.mobile_access.copy_link_button"
              type="button"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy App Link
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <Separator
            orientation="vertical"
            className="hidden sm:block h-auto self-stretch"
          />
          <Separator className="block sm:hidden w-full" />

          {/* OAC Meeting QR Code */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="text-center mb-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                OAC Meeting Quick Access
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scan to open the OAC Meeting tab directly
              </p>
            </div>
            <div
              className="relative rounded-xl border-2 border-teal-500/40 p-2
                bg-[oklch(0.97_0.03_180)] shadow-md"
              data-ocid="dashboard.mobile_access.oac_qr_code"
            >
              {!oacQrReady && (
                <Skeleton className="h-[220px] w-[220px] rounded-lg" />
              )}
              <canvas
                ref={oacCanvasRef}
                className={`rounded-lg transition-opacity duration-300 ${
                  oacQrReady ? "opacity-100" : "opacity-0 absolute"
                }`}
                aria-label="QR code to open OAC Meeting tab"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground max-w-[220px] leading-snug">
              Opens the Owner-Architect-Contractor meeting room
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyOacLink}
              className="w-full max-w-[220px] gap-1.5 transition-colors duration-200
                border-teal-500/40 hover:border-teal-500/70 hover:text-teal-400"
              data-ocid="dashboard.mobile_access.copy_oac_link_button"
              type="button"
            >
              {oacCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-teal-400">Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy OAC Link
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <Separator
            orientation="vertical"
            className="hidden sm:block h-auto self-stretch"
          />
          <Separator className="block sm:hidden w-full" />

          {/* Platform Buttons */}
          <div className="flex-1 w-full">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Download &amp; Access on Your Device
            </p>
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
              {PLATFORM_BUTTONS.map((btn, idx) => (
                <a
                  key={btn.label}
                  href={btn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={`dashboard.mobile_access.platform_button.${idx + 1}`}
                  className="flex items-center gap-2.5 rounded-lg border border-border
                    bg-background px-3 py-2.5 text-sm font-medium
                    hover:bg-muted/60 hover:border-primary/40
                    transition-all duration-200 group min-w-0"
                >
                  <span
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      btn.color
                    }`}
                  >
                    {btn.icon}
                  </span>
                  <span className="truncate text-foreground">{btn.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
