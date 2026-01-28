import React, { useState } from "react";
import { X, Play, Pause, Check, Clock, Trash2, ExternalLink, Volume2 } from "lucide-react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow } from "date-fns";
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

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onSnooze: (id: string, duration: "15min" | "1hr" | "tomorrow") => void;
  onDelete: (id: string) => void;
}

const SnoozeOption: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium press-effect hover:bg-secondary/80 transition-colors"
  >
    {label}
  </button>
);

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
  onSnooze,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Simulated audio playback
  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset on close
  React.useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setPlaybackProgress(0);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const formatReminder = (): string => {
    if (task.reminder.type === "anytime") return "Anytime";
    if (task.reminder.type === "none") return "No reminder";
    
    const date = task.reminder.date;
    if (isToday(date)) return `Today at ${format(date, "h:mm a")}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, "h:mm a")}`;
    return format(date, "EEEE, MMM d 'at' h:mm a");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={cn(
        "relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-10 safe-area-bottom animate-slide-up",
        "shadow-2xl max-h-[85vh] overflow-y-auto"
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X size={24} className="text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="pt-4">
          {/* Full text */}
          <h2 className="text-xl font-semibold mb-4 pr-8">{task.fullText}</h2>
          
          {/* Reminder */}
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Clock size={16} />
            <span>{formatReminder()}</span>
          </div>

          {/* Audio playback */}
          {task.hasAudio && (
            <div className="bg-secondary rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center press-effect"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 size={14} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Voice memo</span>
                  </div>
                  <Progress value={playbackProgress} className="h-1.5" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.floor(playbackProgress / 20)}s
                </span>
              </div>
            </div>
          )}

          {/* Buy link */}
          {task.isBuyIntent && task.buyLink && (
            <a
              href={task.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-accent text-accent-foreground font-medium mb-6 press-effect hover:bg-accent/90 transition-colors"
            >
              <ExternalLink size={18} />
              Shop on Amazon
            </a>
          )}

          {/* Checklist */}
          {task.hasChecklist && task.checklistItems && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Checklist</h3>
              <div className="space-y-2">
                {task.checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    <span className="text-secondary-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary action */}
          <Button
            onClick={() => {
              onComplete(task.id);
              onClose();
            }}
            className="w-full h-14 rounded-xl text-lg font-medium mb-4"
          >
            <Check size={22} className="mr-2" />
            Mark as Done
          </Button>

          {/* Snooze options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Snooze</h3>
            <div className="flex gap-2">
              <SnoozeOption label="15 min" onClick={() => onSnooze(task.id, "15min")} />
              <SnoozeOption label="1 hour" onClick={() => onSnooze(task.id, "1hr")} />
              <SnoozeOption label="Tomorrow" onClick={() => onSnooze(task.id, "tomorrow")} />
            </div>
          </div>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 w-full py-3 text-destructive font-medium">
                <Trash2 size={18} />
                Delete task
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The task and its recording will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
