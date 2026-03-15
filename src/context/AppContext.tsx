import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Task, User, AppState, NudgeType, ActivationState, NudgeDismissState, Capture, CaptureStatus, GroceryList, GroceryItem, GroceryIntentResult, generateMockTask, sampleTranscriptions, detectGroceryIntent } from "@/types/task";

// Cooldown/suppression config (ms)
const NUDGE_CONFIG: Record<NudgeType, { cooldownMs: number; suppressionMs: number; maxDismissals: number }> = {
  "sign-in":    { cooldownMs: 7 * 24 * 60 * 60 * 1000, suppressionMs: 30 * 24 * 60 * 60 * 1000, maxDismissals: 2 },
  "watch-setup":{ cooldownMs: 3 * 24 * 60 * 60 * 1000, suppressionMs: 14 * 24 * 60 * 60 * 1000, maxDismissals: 2 },
  "watch-usage":{ cooldownMs: 3 * 24 * 60 * 60 * 1000, suppressionMs: 14 * 24 * 60 * 60 * 1000, maxDismissals: 1 },
};

const defaultDismissState = (): NudgeDismissState => ({ dismissCount: 0, lastDismissedAt: null, lastShownAt: null });

interface AppContextType extends AppState {
  addTask: (text: string, hasAudio?: boolean) => void;
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
  // Capture management
  addCapture: (durationSeconds: number, simulateOffline?: boolean) => void;
  deleteCapture: (captureId: string) => void;
  retryCapture: (captureId: string) => void;
  failCapture: (captureId: string) => void;
  goOnline: (captureId: string) => void;
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
  // Playback hint
  hasSeenPlaybackHint: boolean;
  markPlaybackHintSeen: () => void;
  // Helpers
  getTasksForCapture: (captureId: string) => Task[];
  // Grocery
  processTextIntent: (text: string, hasAudio?: boolean) => void;
  getGroceryList: (listId: string) => GroceryList | undefined;
  getActiveGroceryList: () => GroceryList | undefined;
  toggleGroceryItem: (listId: string, itemId: string) => void;
  addGroceryItem: (listId: string, name: string, quantity?: number) => void;
  removeGroceryItem: (listId: string, itemId: string) => void;
  updateGroceryItemQuantity: (listId: string, itemId: string, quantity: number | undefined) => void;
  addBackdatedGroceryItems: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [signInSource, setSignInSource] = useState<"nudge" | "organic" | null>(null);
  const [showPostSignInBridge, setShowPostSignInBridge] = useState(false);
  const [hasSeenPlaybackHint, setHasSeenPlaybackHint] = useState(false);

  // Nudge dismiss states
  const [nudgeDismiss, setNudgeDismiss] = useState<Record<NudgeType, NudgeDismissState>>({
    "sign-in": defaultDismissState(),
    "watch-setup": defaultDismissState(),
    "watch-usage": defaultDismissState(),
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

  const isNudgeSuppressed = useCallback((type: NudgeType): boolean => {
    const config = NUDGE_CONFIG[type];
    const state = nudgeDismiss[type];
    const now = Date.now();
    if (state.dismissCount >= config.maxDismissals) {
      if (!state.lastDismissedAt) return true;
      return now - state.lastDismissedAt < config.suppressionMs;
    }
    if (state.lastDismissedAt && now - state.lastDismissedAt < config.cooldownMs) {
      return true;
    }
    return false;
  }, [nudgeDismiss]);

  const primaryNudge = useMemo((): NudgeType | null => {
    if (isRecording) return null;
    if (!user && captureCount >= 3 && !isNudgeSuppressed("sign-in")) return "sign-in";
    if (user && !user.watchCaptureEnabled && !isNudgeSuppressed("watch-setup")) return "watch-setup";
    if (
      user && user.watchCaptureEnabled && user.watchEnabledAt &&
      Date.now() - user.watchEnabledAt >= 48 * 60 * 60 * 1000 &&
      captureCount > 0 && user.watchCaptures === 0 && !isNudgeSuppressed("watch-usage")
    ) return "watch-usage";
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
    setUser(prev => prev ? { ...prev, watchCaptureEnabled: true, watchEnabledAt: Date.now() } : prev);
  }, []);

  // Simulate processing: after a delay, transition capture to done and create tasks
  const simulateProcessing = useCallback((captureId: string) => {
    // Move to processing after 1s
    setTimeout(() => {
      setCaptures(prev => prev.map(c =>
        c.id === captureId && (c.status === "waiting" || c.status === "failed")
          ? { ...c, status: "processing" as CaptureStatus }
          : c
      ));

      // Complete processing after 2-4s
      const delay = 2000 + Math.random() * 2000;
      setTimeout(() => {
        // Randomly pick 1-3 sample transcriptions
        const numTasks = 1 + Math.floor(Math.random() * 3);
        const shuffled = [...sampleTranscriptions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, numTasks);

        const newTasks = selected.map(text => generateMockTask(text, true, captureId));

        setCaptures(prev => prev.map(c =>
          c.id === captureId ? { ...c, status: "done" as CaptureStatus } : c
        ));
        setTasks(prev => [...newTasks, ...prev]);
      }, delay);
    }, 1000);
  }, []);

  const addCapture = useCallback((durationSeconds: number, simulateOffline: boolean = false) => {
    const captureId = crypto.randomUUID();
    const newCapture: Capture = {
      id: captureId,
      capturedAt: new Date(),
      durationSeconds,
      status: simulateOffline ? "waiting" : "processing",
    };
    setCaptures(prev => [newCapture, ...prev]);
    setCaptureCount(prev => prev + 1);

    if (!simulateOffline) {
      simulateProcessing(captureId);
    }
  }, [simulateProcessing]);

  const deleteCapture = useCallback((captureId: string) => {
    setCaptures(prev => prev.filter(c => c.id !== captureId));
    // Also remove any tasks tied to this capture
    setTasks(prev => prev.filter(t => t.captureId !== captureId));
  }, []);

  const retryCapture = useCallback((captureId: string) => {
    setCaptures(prev => prev.map(c =>
      c.id === captureId ? { ...c, status: "waiting" as CaptureStatus } : c
    ));
    simulateProcessing(captureId);
  }, [simulateProcessing]);

  const failCapture = useCallback((captureId: string) => {
    setCaptures(prev => prev.map(c =>
      c.id === captureId ? { ...c, status: "failed" as CaptureStatus } : c
    ));
  }, []);

  const goOnline = useCallback((captureId: string) => {
    // Process the specified capture and also retry all failed/waiting ones
    setCaptures(prev => {
      const toRetry = prev.filter(c =>
        (c.id === captureId || c.status === "failed" || c.status === "waiting") && c.status !== "processing" && c.status !== "done"
      );
      toRetry.forEach(c => simulateProcessing(c.id));
      return prev;
    });
  }, [simulateProcessing]);

  const addTask = useCallback((text: string, hasAudio: boolean = true) => {
    const newTask = generateMockTask(text, hasAudio);
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
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      const remaining = prev.filter(t => t.id !== id);

      // If this was the last task referencing a capture, clean up the capture
      if (task?.captureId) {
        const siblingsRemaining = remaining.filter(t => t.captureId === task.captureId).length;
        if (siblingsRemaining === 0) {
          setCaptures(caps => caps.filter(c => c.id !== task.captureId));
        }
      }

      return remaining;
    });
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
      task.id === id ? { ...task, hasAudio: false, captureId: undefined } : task
    ));
  }, []);

  const getTasksForCapture = useCallback((captureId: string): Task[] => {
    return tasks.filter(t => t.captureId === captureId);
  }, [tasks]);

  // ─── Grocery Logic ───

  const STALENESS_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

  const getActiveGroceryList = useCallback((): GroceryList | undefined => {
    // Find grocery list attached to an incomplete grocery task
    const groceryTasks = tasks.filter(t => t.kind === "grocery" && !t.isCompleted && t.groceryListId);
    if (groceryTasks.length === 0) return undefined;
    const taskListId = groceryTasks[0].groceryListId;
    return groceryLists.find(gl => gl.listId === taskListId);
  }, [tasks, groceryLists]);

  const getGroceryList = useCallback((listId: string): GroceryList | undefined => {
    return groceryLists.find(gl => gl.listId === listId);
  }, [groceryLists]);

  const createGroceryListAndTask = useCallback((items: { name: string; quantity?: number }[], hasAudio: boolean = false): void => {
    const listId = crypto.randomUUID();
    const taskId = crypto.randomUUID();
    const now = new Date();

    const groceryItems: GroceryItem[] = items.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      quantity: item.quantity,
      status: "active" as const,
      addedAt: now,
      updatedAt: now,
    }));

    const newList: GroceryList = {
      listId,
      taskId,
      createdAt: now,
      lastModifiedAt: now,
      items: groceryItems,
    };

    const newTask: Task = {
      id: taskId,
      summary: "Buy groceries",
      fullText: `Buy groceries: ${items.map(i => i.name).join(", ")}`,
      kind: "grocery",
      reminder: { type: "anytime" },
      hasAudio,
      hasChecklist: false,
      isBuyIntent: true,
      createdAt: now,
      isCompleted: false,
      groceryListId: listId,
    };

    setGroceryLists(prev => [newList, ...prev]);
    setTasks(prev => [newTask, ...prev]);
    setCaptureCount(prev => prev + 1);
  }, []);

  const addItemsToGroceryList = useCallback((listId: string, items: { name: string; quantity?: number }[]): void => {
    const now = new Date();
    setGroceryLists(prev => prev.map(gl => {
      if (gl.listId !== listId) return gl;
      const newItems: GroceryItem[] = items.map(item => {
        // Check if item already exists (case-insensitive)
        const existing = gl.items.find(i => i.name.toLowerCase() === item.name.toLowerCase() && i.status === "active");
        if (existing) return null as any; // skip dupes
        return {
          id: crypto.randomUUID(),
          name: item.name,
          quantity: item.quantity,
          status: "active" as const,
          addedAt: now,
          updatedAt: now,
        };
      }).filter(Boolean);
      return { ...gl, items: [...gl.items, ...newItems], lastModifiedAt: now };
    }));
  }, []);

  const processTextIntent = useCallback((text: string, hasAudio: boolean = false) => {
    const intent = detectGroceryIntent(text);

    if (intent.type === "not_grocery") {
      // Create a normal task
      const newTask = generateMockTask(text, hasAudio);
      setTasks(prev => [newTask, ...prev]);
      setCaptureCount(prev => prev + 1);
      return;
    }

    if (intent.type === "view_grocery") {
      // Handled by UI — no state change needed
      return;
    }

    const activeList = getActiveGroceryList();

    if (intent.type === "remove_grocery") {
      if (!activeList) return; // no list to remove from
      const itemName = intent.items[0]?.name?.toLowerCase();
      setGroceryLists(prev => prev.map(gl => {
        if (gl.listId !== activeList.listId) return gl;
        const filtered = gl.items.filter(i => i.name.toLowerCase() !== itemName);
        return { ...gl, items: filtered, lastModifiedAt: new Date() };
      }));
      return;
    }

    if (intent.type === "update_grocery") {
      if (!activeList) return;
      const { name, quantity } = intent.items[0] || {};
      setGroceryLists(prev => prev.map(gl => {
        if (gl.listId !== activeList.listId) return gl;
        const updatedItems = gl.items.map(i =>
          i.name.toLowerCase() === name?.toLowerCase()
            ? { ...i, quantity, updatedAt: new Date() }
            : i
        );
        return { ...gl, items: updatedItems, lastModifiedAt: new Date() };
      }));
      return;
    }

    // add_grocery
    if (activeList) {
      const isStale = Date.now() - activeList.lastModifiedAt.getTime() > STALENESS_MS;
      if (intent.isExplicit || !isStale) {
        addItemsToGroceryList(activeList.listId, intent.items);
      } else {
        // Stale — create new
        createGroceryListAndTask(intent.items, hasAudio);
      }
    } else {
      createGroceryListAndTask(intent.items, hasAudio);
    }
  }, [getActiveGroceryList, addItemsToGroceryList, createGroceryListAndTask]);

  const toggleGroceryItem = useCallback((listId: string, itemId: string) => {
    setGroceryLists(prev => prev.map(gl => {
      if (gl.listId !== listId) return gl;
      const items = gl.items.map(i =>
        i.id === itemId
          ? { ...i, status: (i.status === "active" ? "completed" : "active") as GroceryItem["status"], updatedAt: new Date() }
          : i
      );
      return { ...gl, items, lastModifiedAt: new Date() };
    }));
  }, []);

  const addGroceryItem = useCallback((listId: string, name: string, quantity?: number) => {
    const now = new Date();
    setGroceryLists(prev => prev.map(gl => {
      if (gl.listId !== listId) return gl;
      const newItem: GroceryItem = {
        id: crypto.randomUUID(),
        name,
        quantity,
        status: "active",
        addedAt: now,
        updatedAt: now,
      };
      return { ...gl, items: [...gl.items, newItem], lastModifiedAt: now };
    }));
  }, []);

  const removeGroceryItem = useCallback((listId: string, itemId: string) => {
    setGroceryLists(prev => prev.map(gl => {
      if (gl.listId !== listId) return gl;
      return { ...gl, items: gl.items.filter(i => i.id !== itemId), lastModifiedAt: new Date() };
    }));
  }, []);

  const updateGroceryItemQuantity = useCallback((listId: string, itemId: string, quantity: number | undefined) => {
    setGroceryLists(prev => prev.map(gl => {
      if (gl.listId !== listId) return gl;
      const items = gl.items.map(i =>
        i.id === itemId ? { ...i, quantity, updatedAt: new Date() } : i
      );
      return { ...gl, items, lastModifiedAt: new Date() };
    }));
  }, []);

  const markPlaybackHintSeen = useCallback(() => {
    setHasSeenPlaybackHint(true);
  }, []);

  const signIn = useCallback((provider: "apple" | "google", source: "nudge" | "organic" = "organic") => {
    setSignInSource(source);
    setUser({
      id: "user-1",
      name: "Jane Doe",
      email: provider === "apple" ? "jane@icloud.com" : "jane@gmail.com",
      isSignedIn: true,
      watchCaptureEnabled: false,
      watchEnabledAt: null,
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
    setTasks(prev => prev.map(task => ({ ...task, hasAudio: false, captureId: undefined })));
    setCaptures([]);
  }, []);

  const deleteAccount = useCallback(() => {
    setTasks([]);
    setCaptures([]);
    setGroceryLists([]);
    setUser(null);
    setCaptureCount(0);
    setSignInSource(null);
    setShowPostSignInBridge(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        tasks,
        captures,
        groceryLists,
        user,
        captureCount,
        showSignInPrompt: false,
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
        addCapture,
        deleteCapture,
        retryCapture,
        failCapture,
        goOnline,
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
        hasSeenPlaybackHint,
        markPlaybackHintSeen,
        getTasksForCapture,
        processTextIntent,
        getGroceryList,
        getActiveGroceryList,
        toggleGroceryItem,
        addGroceryItem,
        removeGroceryItem,
        updateGroceryItemQuantity,
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
