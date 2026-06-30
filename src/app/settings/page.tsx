"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Bell,
  Brush,
  Camera,
  CheckCircle2,
  Delete,
  Film,
  HardDrive,
  Mail,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DriveStatus } from "@/components/drive/drive-status";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRecordingsStore } from "@/stores/recordings-store";
import { useDriveStore } from "@/stores/drive-store";
import { useSettingsStore } from "@/stores/settings-store";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground mb-3">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            Settings
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account, preferences, and connections.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full flex h-auto flex-wrap gap-1 bg-muted/40 rounded-xl p-1">
            <TabsTrigger value="profile" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Connections</span>
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Recording</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Bell className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Delete className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <ProfileTab />
          <ConnectionsTab />
          <RecordingTab />
          <AppearanceTab />
          <NotificationsTab />
          <AccountTab />
        </Tabs>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Profile Tab                                                        */
/* ------------------------------------------------------------------ */

function ProfileTab() {
  const { user, status } = useCurrentUser();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";
  const profileRows = [
    { label: "Name", value: user?.name || "Not signed in", icon: User },
    { label: "Email", value: user?.email || "—", icon: Mail },
    {
      label: "Account status",
      value: status === "authenticated" ? "Connected with Google" : "Not connected",
      icon: Shield,
    },
  ];

  return (
    <TabsContent value="profile" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details. These are synced with your Google account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-muted/20 p-4 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 border-2 border-border">
                {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{user?.name || "Not signed in"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || "—"}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" />
                  Read-only Google profile
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {profileRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-border/40 bg-card/40 p-3"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <row.icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {row.label}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm font-semibold">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TabsContent>
  );
}

/* ------------------------------------------------------------------ */
/* Connections Tab                                                    */
/* ------------------------------------------------------------------ */

function ConnectionsTab() {
  const { user } = useCurrentUser();
  const { isConnected: driveConnected } = useDriveStore();
  const isAuthenticated = !!user;

  return (
    <TabsContent value="connections" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Google Account */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              Google Account
            </CardTitle>
            <CardDescription>
              Your Google account is used for sign-in and identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">Google</p>
                    {isAuthenticated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                        <XCircle className="h-3 w-3" />
                        Not connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isAuthenticated ? user?.email : "Sign in to connect your Google account"}
                  </p>
                </div>
              </div>
              {!isAuthenticated && (
                <Button asChild size="sm" className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <a href="/signin">Sign In</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google Drive */}
        <DriveStatus />
      </motion.div>
    </TabsContent>
  );
}

/* ------------------------------------------------------------------ */
/* Recording Tab                                                      */
/* ------------------------------------------------------------------ */

function RecordingTab() {
  const { defaultQuality, defaultSource, setDefaultQuality, setDefaultSource } = useSettingsStore();

  return (
    <TabsContent value="recording" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Default Quality */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Film className="h-4 w-4 text-purple-500" />
              Default Recording Quality
            </CardTitle>
            <CardDescription>
              Set the default quality for new recordings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={defaultQuality} onValueChange={(v) => setDefaultQuality(v as typeof defaultQuality)}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p HD</SelectItem>
                <SelectItem value="1080p">1080p Full HD</SelectItem>
                <SelectItem value="1440p">1440p QHD</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Default Source */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4 text-purple-500" />
              Default Recording Source
            </CardTitle>
            <CardDescription>
              Set the default capture source for new recordings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={defaultSource} onValueChange={(v) => setDefaultSource(v as typeof defaultSource)}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="screen">Entire Screen</SelectItem>
                <SelectItem value="window">Application Window</SelectItem>
                <SelectItem value="tab">Browser Tab</SelectItem>
                <SelectItem value="webcam">Webcam Only</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>
    </TabsContent>
  );
}

/* ------------------------------------------------------------------ */
/* Appearance Tab                                                      */
/* ------------------------------------------------------------------ */

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <TabsContent value="appearance" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brush className="h-4 w-4 text-purple-500" />
              Theme
            </CardTitle>
            <CardDescription>
              Choose between light, dark, or system theme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = mounted && theme === option.value;

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "h-12 justify-start gap-2 rounded-2xl",
                      isActive &&
                        "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Pick a fixed theme, or follow your device setting with System.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </TabsContent>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications Tab                                                  */
/* ------------------------------------------------------------------ */

function NotificationsTab() {
  const { notifications, setNotifications } = useSettingsStore();

  const toggleItems = [
    {
      key: "publishSuccess" as const,
      icon: CheckCircle2,
      title: "Publish Success",
      description: "Show a notification when a recording is published successfully.",
    },
    {
      key: "uploadErrors" as const,
      icon: XCircle,
      title: "Upload Errors",
      description: "Get notified when an upload to Google Drive fails.",
    },
    {
      key: "recordingReminders" as const,
      icon: Bell,
      title: "Recording Reminders",
      description: "Show tips and reminders during recording sessions.",
    },
  ];

  return (
    <TabsContent value="notifications" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-500" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control which notifications you see.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {toggleItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) => setNotifications({ [item.key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </TabsContent>
  );
}

/* ------------------------------------------------------------------ */
/* Account Tab                                                         */
/* ------------------------------------------------------------------ */

function AccountTab() {
  const { recordings, clearRecordings } = useRecordingsStore();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const totalSize = useMemo(
    () => recordings.reduce((sum, r) => sum + r.size, 0),
    [recordings]
  );

  return (
    <TabsContent value="account" className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Storage */}
        <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-500" />
              Local Storage
            </CardTitle>
            <CardDescription>
              Recordings are stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{recordings.length}</p>
                <p className="text-xs text-muted-foreground">
                  recording{recordings.length !== 1 ? "s" : ""} • {formatBytes(totalSize)} used
                </p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted">
                <Film className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions. Please be careful.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
              <div>
                <p className="text-sm font-medium">Clear All Recordings</p>
                <p className="text-xs text-muted-foreground">
                  Delete all {recordings.length} recording{recordings.length !== 1 ? "s" : ""} from local storage.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => setShowClearDialog(true)}
                disabled={recordings.length === 0}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
              <div>
                <p className="text-sm font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">
                  Sign out of your Google account.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clear All Confirmation */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Clear All Recordings
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all {recordings.length} recording{recordings.length !== 1 ? "s" : ""} from your local storage. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearRecordings();
                setShowClearDialog(false);
              }}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}
