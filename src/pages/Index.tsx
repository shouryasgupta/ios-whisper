import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { BottomNav, TabType } from "@/components/BottomNav";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ReminderNotification } from "@/components/ReminderNotification";
import { HomeScreen } from "@/screens/HomeScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { WatchSetupSheet } from "@/components/WatchSetupSheet";
import { PostSignInBridge } from "@/components/PostSignInBridge";
import { Task } from "@/types/task";

const AppContent: React.FC = () => {
  const {
    tasks,
    user,
    signIn,
    completeTask,
    snoozeTask,
    showPostSignInBridge,
    dismissPostSignInBridge,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [reminderTask, setReminderTask] = useState<Task | null>(null);
  const [showWatchSetup, setShowWatchSetup] = useState(false);
  const [signInTrigger, setSignInTrigger] = useState<"nudge" | "organic">("organic");

  // Simulate reminder notification
  useEffect(() => {
    const upcomingTask = tasks.find(t => {
      if (t.isCompleted) return false;
      if (t.reminder.type !== "specific") return false;
      const timeUntil = t.reminder.date.getTime() - Date.now();
      return timeUntil > 0 && timeUntil < 5000;
    });

    if (upcomingTask) {
      const timeout = setTimeout(() => {
        setReminderTask(upcomingTask);
      }, upcomingTask.reminder.type === "specific"
        ? upcomingTask.reminder.date.getTime() - Date.now()
        : 3000
      );
      return () => clearTimeout(timeout);
    }
  }, [tasks]);

  // Demo reminder after 10s
  useEffect(() => {
    if (tasks.length > 0 && !reminderTask) {
      const timer = setTimeout(() => {
        const taskToRemind = tasks.find(t => !t.isCompleted);
        if (taskToRemind) setReminderTask(taskToRemind);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [tasks, reminderTask]);

  const handleSignIn = (provider: "apple" | "google") => {
    signIn(provider, signInTrigger);
    setShowSignInModal(false);
  };

  // Nudge-triggered sign-in
  const handleNudgeSignIn = () => {
    setSignInTrigger("nudge");
    setShowSignInModal(true);
  };

  // Organic sign-in (from Settings)
  const handleOrganicSignIn = () => {
    setSignInTrigger("organic");
    setShowSignInModal(true);
  };

  // Auth-gated watch setup
  const handleOpenWatchSetup = () => {
    if (!user) {
      handleNudgeSignIn();
    } else {
      setShowWatchSetup(true);
    }
  };

  // Post-sign-in bridge actions
  const handleBridgeSetup = () => {
    dismissPostSignInBridge();
    setTimeout(() => setShowWatchSetup(true), 300);
  };

  const handleReminderDone = () => {
    if (reminderTask) {
      completeTask(reminderTask.id);
      setReminderTask(null);
    }
  };

  const handleReminderSnooze = (duration: "15min" | "1hr" | "tomorrow") => {
    if (reminderTask) {
      snoozeTask(reminderTask.id, duration);
      setReminderTask(null);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {reminderTask && (
        <ReminderNotification
          task={reminderTask}
          isVisible={!!reminderTask}
          onDone={handleReminderDone}
          onSnooze={handleReminderSnooze}
          onDismiss={() => setReminderTask(null)}
        />
      )}

      {activeTab === "home" && (
        <HomeScreen
          onOpenWatchSetup={handleOpenWatchSetup}
          onOpenSignIn={handleNudgeSignIn}
        />
      )}
      {activeTab === "settings" && (
        <SettingsScreen onSignIn={handleOrganicSignIn} />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <WatchSetupSheet open={showWatchSetup} onOpenChange={setShowWatchSetup} />

      {/* Post-sign-in bridge (only for nudge-triggered sign-ins) */}
      <PostSignInBridge
        open={showPostSignInBridge}
        onSetupWatch={handleBridgeSetup}
        onLater={dismissPostSignInBridge}
      />

      {/* Sign-in modal */}
      <SignInPrompt
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={handleSignIn}
      />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
