import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Task, User, AppState, generateMockTask } from "@/types/task";

interface AppContextType extends AppState {
  addTask: (text: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  snoozeTask: (id: string, duration: "15min" | "1hr" | "tomorrow") => void;
  updateTaskReminder: (id: string, date: Date) => void;
  deleteRecording: (id: string) => void;
  signIn: (provider: "apple" | "google") => void;
  signOut: () => void;
  dismissSignInPrompt: () => void;
  deleteAllRecordings: () => void;
  deleteAccount: () => void;
  // Watch nudge
  firstCaptureDone: boolean;
  watchNudgeDismissCount: number;
  dismissWatchNudge: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock tasks for demo
const initialTasks: Task[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [user, setUser] = useState<User | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [watchNudgeDismissCount, setWatchNudgeDismissCount] = useState(0);

  const firstCaptureDone = captureCount >= 1;
  // Show watch nudge after first capture, suppressed after 2 dismissals or when watch is active
  const dismissWatchNudge = useCallback(() => {
    setWatchNudgeDismissCount(c => c + 1);
  }, []);

  const addTask = useCallback((text: string) => {
    const newTask = generateMockTask(text);
    setTasks(prev => [newTask, ...prev]);
    
    const newCount = captureCount + 1;
    setCaptureCount(newCount);
    
    // Show sign-in prompt after 2 captures if not signed in
    if (newCount === 2 && !user) {
      setTimeout(() => setShowSignInPrompt(true), 1500);
    }
  }, [captureCount, user]);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, isCompleted: true, completedAt: new Date() }
        : task
    ));
  }, []);

  const uncompleteTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, isCompleted: false, completedAt: undefined }
        : task
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
        case "15min":
          newDate = new Date(now.getTime() + 15 * 60 * 1000);
          break;
        case "1hr":
          newDate = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case "tomorrow":
          newDate = new Date(now);
          newDate.setDate(newDate.getDate() + 1);
          newDate.setHours(9, 0, 0, 0);
          break;
      }
      
      return { ...task, reminder: { type: "specific", date: newDate } };
    }));
  }, []);

  const updateTaskReminder = useCallback((id: string, date: Date) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, reminder: { type: "specific", date } } : task
    ));
  }, []);

  const deleteRecording = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, hasAudio: false } : task
    ));
  }, []);

  const signIn = useCallback((provider: "apple" | "google") => {
    // Simulated sign-in
    setUser({
      id: "user-1",
      name: provider === "apple" ? "Jane Doe" : "Jane Doe",
      email: provider === "apple" ? "jane@icloud.com" : "jane@gmail.com",
      isSignedIn: true,
      watchCaptureEnabled: true,
    });
    setShowSignInPrompt(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const dismissSignInPrompt = useCallback(() => {
    setShowSignInPrompt(false);
  }, []);

  const deleteAllRecordings = useCallback(() => {
    setTasks(prev => prev.map(task => ({ ...task, hasAudio: false })));
  }, []);

  const deleteAccount = useCallback(() => {
    setTasks([]);
    setUser(null);
    setCaptureCount(0);
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        firstCaptureDone,
        watchNudgeDismissCount,
        dismissWatchNudge,
        user,
        captureCount,
        showSignInPrompt,
        addTask,
        completeTask,
        uncompleteTask,
        deleteTask,
        snoozeTask,
        updateTaskReminder,
        deleteRecording,
        signIn,
        signOut,
        dismissSignInPrompt,
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
