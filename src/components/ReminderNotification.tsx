import React from "react";
import { Bell, Check, Clock } from "lucide-react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface ReminderNotificationProps {
  task: Task;
  isVisible: boolean;
  onDone: () => void;
  onSnooze: (duration: "15min" | "1hr" | "tomorrow") => void;
  onDismiss: () => void;
}

export const ReminderNotification: React.FC<ReminderNotificationProps> = ({
  task,
  isVisible,
  onDone,
  onSnooze,
  onDismiss,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto animate-slide-up">
      <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-primary/5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-muted-foreground">Reminder</p>
            <p className="font-semibold truncate">{task.summary}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex border-t">
          <button
            onClick={onDone}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-success font-medium border-r press-effect hover:bg-success/5 transition-colors"
          >
            <Check size={18} />
            Done
          </button>
          <div className="flex-1 flex">
            <button
              onClick={() => onSnooze("15min")}
              className="flex-1 flex items-center justify-center gap-1 py-3 text-muted-foreground font-medium press-effect hover:bg-secondary/50 transition-colors border-r"
            >
              <Clock size={14} />
              <span className="text-sm">15m</span>
            </button>
            <button
              onClick={() => onSnooze("1hr")}
              className="flex-1 flex items-center justify-center gap-1 py-3 text-muted-foreground font-medium press-effect hover:bg-secondary/50 transition-colors border-r"
            >
              <span className="text-sm">1hr</span>
            </button>
            <button
              onClick={() => onSnooze("tomorrow")}
              className="flex-1 flex items-center justify-center gap-1 py-3 text-muted-foreground font-medium press-effect hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm">Tom.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
