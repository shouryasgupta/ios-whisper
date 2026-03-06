export type TaskKind = "action" | "note" | "draft";

export type NudgeType = "sign-in" | "watch-setup" | "watch-usage";

export type ActivationState =
  | "new_no_capture"
  | "anonymous_active"
  | "signed_in_no_watch"
  | "watch_enabled_inactive"
  | "watch_active";

export interface NudgeDismissState {
  dismissCount: number;
  lastDismissedAt: number | null;
}

export type ReminderTime = 
  | { type: "specific"; date: Date }
  | { type: "anytime" };

export type CaptureStatus = "waiting" | "processing" | "failed" | "done";

export interface Capture {
  id: string;
  capturedAt: Date;
  durationSeconds: number;
  status: CaptureStatus;
}

export interface Task {
  id: string;
  summary: string;
  fullText: string;
  kind: TaskKind;
  reminder: ReminderTime;
  hasAudio: boolean;
  captureId?: string;
  createdAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isSignedIn: boolean;
  watchCaptureEnabled: boolean;
  watchEnabledAt: number | null;
  watchCaptures: number;
}

export interface AppState {
  tasks: Task[];
  captures: Capture[];
  user: User | null;
  captureCount: number;
}

// Sample transcriptions for simulated voice capture
export const sampleTranscriptions = [
  "Pick up groceries on the way home - milk, eggs, and bread",
  "Call mom to wish her happy birthday tomorrow at 2pm",
  "Remember to send the quarterly report to Sarah by Friday",
  "Buy birthday present for Jake's party next Saturday",
  "Schedule dentist appointment for next week",
  "Don't forget to water the plants when I get home",
  "Meeting with the design team at 10am tomorrow",
  "Order new running shoes - need them for the marathon",
  "Take the car for oil change on Thursday morning",
  "Remind me to pay the electricity bill by the 15th",
];

export const generateMockTask = (text: string, hasAudio: boolean = true, captureId?: string): Task => {
  const hasTime = text.toLowerCase().includes("tomorrow") || 
                  text.toLowerCase().includes("am") || 
                  text.toLowerCase().includes("pm") ||
                  text.match(/\d{1,2}(:\d{2})?/);
  
  const now = new Date();
  let reminder: ReminderTime = { type: "anytime" };
  
  if (hasTime) {
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() + 1);
    reminderDate.setHours(14, 0, 0, 0);
    reminder = { type: "specific", date: reminderDate };
  }

  return {
    id: crypto.randomUUID(),
    summary: text.length > 60 ? text.slice(0, 57) + "..." : text,
    fullText: text,
    kind: "action",
    reminder,
    hasAudio,
    captureId,
    createdAt: now,
    isCompleted: false,
  };
};
