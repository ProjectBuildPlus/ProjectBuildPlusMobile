import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  useSaveZoomSettings,
  useSetFixedZoomLink,
  useZoomSettings,
} from "@/hooks/useOACMeeting";
import {
  useAppSettings,
  useRSMeansSettings,
  useSaveAppSettings,
  useSaveRSMeansSettings,
  useTestRSMeansConnection,
} from "@/hooks/useParticipants";
import type { AppSettings, RSMeansSettings } from "@/hooks/useParticipants";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Key,
  Loader2,
  Settings,
  Shield,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function RSMeansSection() {
  const { data: settings } = useRSMeansSettings();
  const saveSettings = useSaveRSMeansSettings();
  const testConnection = useTestRSMeansConnection();

  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.rsmeans.com/v1");
  const [locationFactor, setLocationFactor] = useState("1.0");
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey);
      setBaseUrl(settings.baseUrl);
      setLocationFactor(settings.locationFactor.toString());
      setLiveEnabled(settings.enabled && settings.mode === "live_api");
    }
  }, [settings]);

  function handleSave() {
    const updated: RSMeansSettings = {
      apiKey,
      mode: liveEnabled ? "live_api" : "manual",
      baseUrl,
      locationFactor: Number.parseFloat(locationFactor) || 1.0,
      enabled: liveEnabled,
    };
    saveSettings.mutate(updated, {
      onSuccess: () => toast.success("RSMeans settings saved."),
    });
  }

  function handleTest() {
    setTestResult(null);
    const cfg: RSMeansSettings = {
      apiKey,
      mode: liveEnabled ? "live_api" : "manual",
      baseUrl,
      locationFactor: Number.parseFloat(locationFactor) || 1.0,
      enabled: liveEnabled,
    };
    testConnection.mutate(cfg, {
      onSuccess: (r) => setTestResult(r),
      onError: (e) => setTestResult({ success: false, message: e.message }),
    });
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Key className="h-5 w-5 text-accent" />
          RSMeans API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* API Key */}
        <div className="space-y-1.5">
          <Label htmlFor="api-key">Enterprise API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your RSMeans enterprise API key"
              className="pr-10"
              data-ocid="settings.rsmeans_key_input"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Provide your Gordian/RSMeans enterprise key to enable live cost
            data.
          </p>
        </div>

        {/* Base URL */}
        <div className="space-y-1.5">
          <Label htmlFor="base-url">API Base URL</Label>
          <Input
            id="base-url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.rsmeans.com/v1"
            data-ocid="settings.rsmeans_baseurl_input"
          />
        </div>

        {/* Location Factor */}
        <div className="space-y-1.5">
          <Label htmlFor="location-factor">Location Factor</Label>
          <Input
            id="location-factor"
            type="number"
            step="0.01"
            min="0.1"
            max="3.0"
            value={locationFactor}
            onChange={(e) => setLocationFactor(e.target.value)}
            className="w-32"
            data-ocid="settings.location_factor_input"
          />
          <p className="text-xs text-muted-foreground">
            National cost multiplier for your region (1.0 = national average).
          </p>
        </div>

        {/* Live API Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Enable Live API Mode
            </p>
            <p className="text-xs text-muted-foreground">
              Fetch real-time RSMeans benchmarks per division
            </p>
          </div>
          <Switch
            checked={liveEnabled}
            onCheckedChange={setLiveEnabled}
            data-ocid="settings.live_api_toggle"
          />
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              testResult.success
                ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-400"
                : "border-red-600/30 bg-red-600/10 text-red-400"
            }`}
            data-ocid="settings.test_result"
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <p>{testResult.message}</p>
              {testResult.latencyMs && (
                <p className="text-xs opacity-70">{testResult.latencyMs}ms</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testConnection.isPending}
            data-ocid="settings.test_connection_button"
          >
            {testConnection.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Test Connection
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveSettings.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="settings.rsmeans_save_button"
          >
            Save RSMeans Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccessControlSection() {
  const { data: appSettings } = useAppSettings();
  const saveApp = useSaveAppSettings();
  const [requireApproval, setRequireApproval] = useState(true);
  const [pmEmail, setPmEmail] = useState("");

  useEffect(() => {
    if (appSettings) {
      setRequireApproval(appSettings.requireApproval);
      setPmEmail(appSettings.ownerEmail ?? "");
    }
  }, [appSettings]);

  function handleSave() {
    if (!appSettings) return;
    const updated: AppSettings = {
      ...appSettings,
      requireApproval,
      ownerEmail: requireApproval ? appSettings.ownerEmail : pmEmail,
    };
    saveApp.mutate(updated, {
      onSuccess: () => toast.success("Access control settings saved."),
    });
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Shield className="h-5 w-5 text-red-400" />
          Access Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Role-gated option */}
        <label
          htmlFor="radio-role-gated"
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
            requireApproval
              ? "border-primary/40 bg-primary/8"
              : "border-border hover:border-primary/20"
          }`}
          data-ocid="settings.role_gated_radio"
        >
          <input
            id="radio-role-gated"
            type="radio"
            name="access-mode"
            checked={requireApproval}
            onChange={() => setRequireApproval(true)}
            className="sr-only"
          />
          <div
            className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
              requireApproval ? "border-primary bg-primary" : "border-border"
            }`}
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              Role-Gated (Owner / Designer Approve)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Owner and Designer must approve each new participant before they
              receive access and a passcode. All editing access is governed by
              assigned role permissions.
            </p>
          </div>
        </label>

        {/* PM-only option */}
        <label
          htmlFor="radio-pm-only"
          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
            !requireApproval
              ? "border-primary/40 bg-primary/8"
              : "border-border hover:border-primary/20"
          }`}
          data-ocid="settings.pm_only_radio"
        >
          <input
            id="radio-pm-only"
            type="radio"
            name="access-mode"
            checked={!requireApproval}
            onChange={() => setRequireApproval(false)}
            className="sr-only"
          />
          <div
            className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
              !requireApproval ? "border-primary bg-primary" : "border-border"
            }`}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Project Manager Only
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Project Manager has sole edit access. All other participants can
              view.
            </p>
            {!requireApproval && (
              <div className="mt-3 space-y-1">
                <Label htmlFor="pm-email" className="text-xs">
                  Project Manager Email
                </Label>
                <Input
                  id="pm-email"
                  type="email"
                  value={pmEmail}
                  onChange={(e) => setPmEmail(e.target.value)}
                  placeholder="pm@example.com"
                  className="h-8 text-sm"
                  data-ocid="settings.pm_email_input"
                />
              </div>
            )}
          </div>
        </label>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saveApp.isPending}
          className="bg-red-600 text-white hover:bg-red-700"
          data-ocid="settings.access_save_button"
        >
          Save Access Settings
        </Button>
      </CardContent>
    </Card>
  );
}

function ZoomIntegrationSection() {
  const { data: zoomSettings } = useZoomSettings();
  const saveZoom = useSaveZoomSettings();
  const fixedLinkMutation = useSetFixedZoomLink();

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [fixedLink, setFixedLink] = useState("");
  const [dismissEmailInfo, setDismissEmailInfo] = useState(false);

  useEffect(() => {
    if (zoomSettings) {
      setClientId(zoomSettings.clientId);
      setClientSecret(zoomSettings.clientSecret);
    }
  }, [zoomSettings]);

  function handleSaveZoom() {
    const updated = {
      clientId,
      clientSecret,
      fixedZoomLinks: zoomSettings?.fixedZoomLinks ?? [],
    };
    saveZoom.mutate(updated, {
      onSuccess: () => toast.success("Zoom settings saved."),
      onError: (e) => toast.error(e.message),
    });
  }

  function handleSaveFixedLink() {
    if (!fixedLink.trim()) return;
    fixedLinkMutation.mutate(
      { roleId: "owner", zoomLink: fixedLink.trim() },
      {
        onSuccess: () => {
          toast.success("Fixed Zoom link saved.");
          setFixedLink("");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Video className="h-5 w-5 text-accent" />
          Zoom Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Client ID */}
        <div className="space-y-1.5">
          <Label htmlFor="zoom-client-id">Zoom Client ID</Label>
          <Input
            id="zoom-client-id"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your Zoom Server-to-Server OAuth Client ID"
            data-ocid="settings.zoom_client_id_input"
          />
        </div>

        {/* Client Secret */}
        <div className="space-y-1.5">
          <Label htmlFor="zoom-client-secret">Zoom Client Secret</Label>
          <div className="relative">
            <Input
              id="zoom-client-secret"
              type={showSecret ? "text" : "password"}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter your Zoom Client Secret"
              className="pr-10"
              data-ocid="settings.zoom_client_secret_input"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSecret(!showSecret)}
              aria-label={showSecret ? "Hide secret" : "Show secret"}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Enter your Zoom server-to-server OAuth credentials. The app will use
          these to generate a unique Zoom meeting link for each OAC session.
        </p>

        <Button
          type="button"
          onClick={handleSaveZoom}
          disabled={saveZoom.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="settings.zoom_save_button"
        >
          {saveZoom.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Zoom Settings
        </Button>

        <Separator />

        {/* Fixed Meeting Link */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Fixed Meeting Link (Optional)
          </p>
          <p className="text-xs text-muted-foreground">
            Paste a standing Zoom room URL for quick use when you do not want to
            generate a new meeting each time.
          </p>
          <div className="flex gap-3">
            <Input
              type="url"
              value={fixedLink}
              onChange={(e) => setFixedLink(e.target.value)}
              placeholder="https://zoom.us/j/xxxxxxxxxx"
              className="flex-1"
              data-ocid="settings.zoom_fixed_link_input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveFixedLink}
              disabled={fixedLinkMutation.isPending || !fixedLink.trim()}
              data-ocid="settings.zoom_fixed_link_save_button"
            >
              {fixedLinkMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Fixed Link
            </Button>
          </div>
        </div>

        <Separator />

        {/* Email info banner */}
        {!dismissEmailInfo && (
          <div className="flex items-start gap-3 rounded-lg border border-blue-600/20 bg-blue-600/5 p-4">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-blue-400 font-medium">
                Automatic email meeting invites are not yet enabled.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                To enable, contact Caffeine support.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissEmailInfo(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8" data-ocid="settings.page">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure RSMeans API, access control, and Zoom integration
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RSMeansSection />
        <div className="space-y-6">
          <AccessControlSection />
          <ZoomIntegrationSection />
          <Separator />
          <div className="rounded-lg border border-blue-600/20 bg-blue-600/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              Passcode Delivery
            </p>
            <p className="text-sm text-muted-foreground">
              When a participant is approved, a 6-digit passcode is generated.
              Email delivery requires the platform email extension to be enabled
              by an administrator. Until then, passcodes are displayed on-screen
              after approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
