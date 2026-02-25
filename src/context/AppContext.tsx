import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Task, User, AppState, NudgeType, ActivationState, NudgeDismissState, generateMockTask } from "@/types/task";

// Cooldown/suppression config (ms)
const NUDGE_CONFIG: Record<NudgeType, { cooldownMs: number; suppressionMs: number; maxDismissals: number }> = {
  "sign-in":    { cooldownMs: 7 * 24 * 60 * 60 * 1000, suppressionMs: 30 * 24 * 60 * 60 * 1000, maxDismissals: 2 },
  "watch-setup":{ cooldownMs: 3 * 24 * 60 * 60 * 1000, suppressionMs: 14 * 24 * 60 * 60 * 1000, maxDismissals: 2 },
  "watch-usage":{ cooldownMs: 3 * 24 * 60 * 60 * 1000, suppressionMs: 14 * 24 * 60 * 60 * 1000, maxDismissals: 1 },
  "power":      { cooldownMs: 14 * 24 * 60 * 60 * 1000, suppressionMs: Infinity, maxDismissals: 1 },
};

const defaultDismissState = (): NudgeDismissState => ({ dismissCount: 0, lastDismissedAt: null, lastShownAt: null });

interface AppContextType extends AppState {
  addTask: (text: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  snoozeTask: (id: string, duration: "15min" | "1hr" | "tomorrow") => void;
  updateTaskReminder: (id: string, date: Date) => void;
  deleteRecording: (id: string) => void;
  signIn: (provider: "apple" | "google", source?: "nudge" | "organic") => void;
  signOut: () => void;
  deleteAllRecordings: () => void;
  deleteAccount: () => void;
  // Nudge engine
  primaryNudge: NudgeType | null;
  activationState: ActivationState;
  dismissNudge: (type: NudgeType) => void;
  enableWatchCapture: () => void;
  // Recording guard
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
  // Sign-in source tracking
  signInSource: "nudge" | "organic" | null;
  showPostSignInBridge: boolean;
  dismissPostSignInBridge: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [signInSource, setSignInSource] = useState<"nudge" | "organic" | null>(null);
  const [showPostSignInBridge, setShowPostSignInBridge] = useState(false);

  // Nudge dismiss states
  const [nudgeDismiss, setNudgeDismiss] = useState<Record<NudgeType, NudgeDismissState>>({
    "sign-in": defaultDismissState(),
    "watch-setup": defaultDismissState(),
    "watch-usage": defaultDismissState(),
    "power": defaultDismissState(),
  });

  // Derive activation state
  const activationState = useMemo((): ActivationState => {
    if (!user && captureCount === 0) return "new_no_capture";
    if (!user && captureCount > 0) return "anonymous_active";
    if (user && !user.watchCaptureEnabled) return "signed_in_no_watch";
    if (user && user.watchCaptureEnabled && user.watchCaptures < 2) return "watch_enabled_inactive";
    if (user && user.watchCaptureEnabled && user.watchCaptures >= 2) return "watch_active";
    return "new_no_capture";
  }, [user, captureCount]);

  // Check if a nudge is suppressed by cooldown/dismissal rules
  const isNudgeSuppressed = useCallback((type: NudgeType): boolean => {
    const config = NUDGE_CONFIG[type];
    const state = nudgeDismiss[type];
    const now = Date.now();

    // Max dismissals reached → suppressed for suppressionMs
    if (state.dismissCount >= config.maxDismissals) {
      if (!state.lastDismissedAt) return true;
      return now - state.lastDismissedAt < config.suppressionMs;
    }

    // Cooldown after last dismissal
    if (state.lastDismissedAt && now - state.lastDismissedAt < config.cooldownMs) {
      return true;
    }

    return false;
  }, [nudgeDismiss]);

  // Priority-based nudge selection
  const primaryNudge = useMemo((): NudgeType | null => {
    if (isRecording) return null;

    // Sign-In: anonymous with 3+ captures
    if (!user && captureCount >= 3 && !isNudgeSuppressed("sign-in")) {
      return "sign-in";
    }

    // Watch Setup: signed in, no watch
    if (user && !user.watchCaptureEnabled && !isNudgeSuppressed("watch-setup")) {
      return "watch-setup";
    }

    // Watch Usage: watch enabled but < 2 watch captures
    if (user && user.watchCaptureEnabled && user.watchCaptures < 2 && !isNudgeSuppressed("watch-usage")) {
      return "watch-usage";
    }

    return null;
  }, [user, captureCount, isRecording, isNudgeSuppressed]);

  const dismissNudge = useCallback((type: NudgeType) => {
    setNudgeDismiss(prev => ({
      ...prev,
      [type]: {
        dismissCount: prev[type].dismissCount + 1,
        lastDismissedAt: Date.now(),
        lastShownAt: prev[type].lastShownAt,
      },
    }));
  }, []);

  const enableWatchCapture = useCallback(() => {
    setUser(prev => prev ? { ...prev, watchCaptureEnabled: true } : prev);
  }, []);

  const addTask = useCallback((text: string) => {
    const newTask = generateMockTask(text);
    setTasks(prev => [newTask, ...prev]);
    setCaptureCount(prev => prev + 1);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, isCompleted: true, completedAt: new Date() } : task
    ));
  }, []);

  const uncompleteTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, isCompleted: false, completedAt: undefined } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const snoozeTask = useCallback((id: string, duration: "15min" | "1hr" | "tomorrow") => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      const now = new Date();
      let newDate: Date;
      switch (duration) {
        case "15min": newDate = new Date(now.getTime() + 15 * 60 * 1000); break;
        case "1hr": newDate = new Date(now.getTime() + 60 * 60 * 1000); break;
        case "tomorrow":
          newDate = new Date(now);
          newDate.setDate(newDate.getDate() + 1);
          newDate.setHours(9, 0, 0, 0);
          break;
      }
      return { ...task, reminder: { type: "specific" as const, date: newDate } };
    }));
  }, []);

  const updateTaskReminder = useCallback((id: string, date: Date) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, reminder: { type: "specific" as const, date } } : task
    ));
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, hasAudio: false } : task
    ));
  }, []);

  const signIn = useCallback((provider: "apple" | "google", source: "nudge" | "organic" = "organic") => {
    setSignInSource(source);
    setUser({
      id: "user-1",
      name: "Jane Doe",
      email: provider === "apple" ? "jane@icloud.com" : "jane@gmail.com",
      isSignedIn: true,
      watchCaptureEnabled: false,
      watchCaptures: 0,
    });
    if (source === "nudge") {
      setShowPostSignInBridge(true);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setSignInSource(null);
    setShowPostSignInBridge(false);
  }, []);

  const dismissPostSignInBridge = useCallback(() => {
    setShowPostSignInBridge(false);
    setSignInSource(null);
  }, []);

  const deleteAllRecordings = useCallback(() => {
    setTasks(prev => prev.map(task => ({ ...task, hasAudio: false })));
  }, []);

  const deleteAccount = useCallback(() => {
    setTasks([]);
    setUser(null);
    setCaptureCount(0);
    setSignInSource(null);
    setShowPostSignInBridge(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        user,
        captureCount,
        showSignInPrompt: false, // no longer auto-triggered; nudge engine handles it
        primaryNudge,
        activationState,
        dismissNudge,
        enableWatchCapture,
        isRecording,
        setIsRecording,
        signInSource,
        showPostSignInBridge,
        dismissPostSignInBridge,
        addTask,
        completeTask,
        uncompleteTask,
        deleteTask,
        snoozeTask,
        updateTaskReminder,
        deleteRecording,
        signIn,
        signOut,
        deleteAllRecordings,
        deleteAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
