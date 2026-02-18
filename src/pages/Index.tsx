import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { BottomNav, TabType } from "@/components/BottomNav";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ReminderNotification } from "@/components/ReminderNotification";
import { HomeScreen } from "@/screens/HomeScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { WatchSetupSheet } from "@/components/WatchSetupSheet";
import { Task } from "@/types/task";

const AppContent: React.FC = () => {
  const { 
    tasks,
    user,
    showSignInPrompt, 
    signIn, 
    dismissSignInPrompt,
    completeTask,
    snoozeTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [reminderTask, setReminderTask] = useState<Task | null>(null);
  const [showWatchSetup, setShowWatchSetup] = useState(false);
  const [pendingWatchSetup, setPendingWatchSetup] = useState(false);

  // Simulate reminder notification
  useEffect(() => {
    const upcomingTask = tasks.find(t => {
      if (t.isCompleted) return false;
      if (t.reminder.type !== "specific") return false;
      const timeUntil = t.reminder.date.getTime() - Date.now();
      return timeUntil > 0 && timeUntil < 5000; // Within 5 seconds
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

  // Demo: Show a reminder notification after 10 seconds
  useEffect(() => {
    if (tasks.length > 0 && !reminderTask) {
      const timer = setTimeout(() => {
        const taskToRemind = tasks.find(t => !t.isCompleted);
        if (taskToRemind) {
          setReminderTask(taskToRemind);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [tasks, reminderTask]);

  const handleSignIn = (provider: "apple" | "google") => {
    signIn(provider);
    setShowSignInModal(false);
    // If sign-in was triggered by a watch setup attempt, open the sheet now
    if (pendingWatchSetup) {
      setPendingWatchSetup(false);
      setTimeout(() => setShowWatchSetup(true), 400);
    }
  };

  // Auth-gated entry to watch setup
  const handleOpenWatchSetup = () => {
    if (!user) {
      setPendingWatchSetup(true);
      setShowSignInModal(true);
    } else {
      setShowWatchSetup(true);
    }
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
      {/* Reminder notification */}
      {reminderTask && (
        <ReminderNotification
          task={reminderTask}
          isVisible={!!reminderTask}
          onDone={handleReminderDone}
          onSnooze={handleReminderSnooze}
          onDismiss={() => setReminderTask(null)}
        />
      )}

      {/* Main content */}
      {activeTab === "home" && <HomeScreen onOpenWatchSetup={handleOpenWatchSetup} />}
      {activeTab === "settings" && (
        <SettingsScreen onSignIn={() => setShowSignInModal(true)} />
      )}

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Watch setup sheet (triggered from nudge banner or Settings) */}
      <WatchSetupSheet open={showWatchSetup} onOpenChange={setShowWatchSetup} />

      {/* Sign-in prompt (auto-triggered) */}
      <SignInPrompt
        isOpen={showSignInPrompt}
        onClose={dismissSignInPrompt}
        onSignIn={handleSignIn}
      />

      {/* Sign-in modal (manual trigger) */}
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
