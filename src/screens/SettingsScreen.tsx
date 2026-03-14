import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  LogOut, 
  Trash2, 
  Volume2, 
  Shield, 
  Info,
  ChevronRight,
  LogIn,
  Moon,
  Watch,
  Cloud,
} from "lucide-react";
import { WatchSetupSheet } from "@/components/WatchSetupSheet";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsScreenProps {
  onSignIn: () => void;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: React.ReactNode;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  label, 
  value, 
  onClick,
  danger,
  trailing,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 press-effect ${
      danger ? "text-destructive" : "text-foreground"
    }`}
  >
    <span className={danger ? "text-destructive" : "text-muted-foreground"}>
      {icon}
    </span>
    <span className="flex-1 text-left font-medium">{label}</span>
    {value && <span className="text-muted-foreground text-sm">{value}</span>}
    {trailing}
    {!trailing && onClick && !danger && <ChevronRight size={18} className="text-muted-foreground" />}
  </button>
);

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ 
  title, 
  children 
}) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-4 mb-2">
      {title}
    </h3>
    <div className="bg-card rounded-2xl border divide-y">
      {children}
    </div>
  </div>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSignIn }) => {
  const { user, signOut, deleteAllRecordings, deleteAccount, tasks } = useApp();
  const recordingCount = tasks.filter(t => t.hasAudio).length;
  const [showWatchSetup, setShowWatchSetup] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg safe-area-top">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="px-5">
        {/* Account Section */}
        <SettingsSection title="Account">
          {user ? (
            <>
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <SettingsItem
                icon={<LogOut size={20} />}
                label="Sign out"
                onClick={signOut}
              />
            </>
          ) : (
            <SettingsItem
              icon={<LogIn size={20} />}
              label="Sign in"
              value="Sync across devices"
              onClick={onSignIn}
            />
          )}
        </SettingsSection>

        {/* Watch Section */}
        <SettingsSection title="Apple Watch">
          {!user ? (
            <SettingsItem
              icon={<Watch size={20} />}
              label="Watch capture"
              value="No watch connected"
            />
          ) : !user.watchCaptureEnabled ? (
            <SettingsItem
              icon={<Watch size={20} />}
              label="Watch capture"
              value="Setup required"
              onClick={() => setShowWatchSetup(true)}
            />
          ) : user.watchCaptures < 2 ? (
            <SettingsItem
              icon={<Watch size={20} />}
              label="Watch capture"
              value="Try watch capture"
              onClick={() => setShowWatchSetup(true)}
            />
          ) : (
            <div className="flex items-center gap-4 px-4 py-3">
              <span className="text-muted-foreground">
                <Watch size={20} />
              </span>
              <div className="flex-1">
                <p className="font-medium">Watch capture</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Cloud size={11} className="text-success" />
                  <span className="text-xs text-success">Active</span>
                </div>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsItem
            icon={<Moon size={20} />}
            label="Dark mode"
            trailing={
              <Switch
                checked={isDark}
                onCheckedChange={setIsDark}
                onClick={e => e.stopPropagation()}
              />
            }
          />
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection title="Privacy">
          <SettingsItem
            icon={<Volume2 size={20} />}
            label="Recordings"
            value={`${recordingCount} stored`}
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div>
                <SettingsItem
                  icon={<Trash2 size={20} />}
                  label="Delete all recordings"
                  onClick={() => {}}
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all recordings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all audio recordings. Your task text will be preserved. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAllRecordings}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete recordings
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div>
                <SettingsItem
                  icon={<Trash2 size={20} />}
                  label="Delete account & all data"
                  danger
                />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all tasks, and all recordings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsItem
            icon={<Shield size={20} />}
            label="Privacy policy"
          />
          <SettingsItem
            icon={<Info size={20} />}
            label="Version"
            value="1.0.0 (prototype)"
          />
        </SettingsSection>

        {/* Retention info */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Audio recordings are automatically deleted after 30 days.
          </p>
        </div>
      </main>

      <WatchSetupSheet
        open={showWatchSetup}
        onOpenChange={setShowWatchSetup}
      />
    </div>
  );
};
