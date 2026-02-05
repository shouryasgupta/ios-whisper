import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, CalendarIcon, Trash2, Circle, Volume2, CheckCircle2 } from "lucide-react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onUncomplete?: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateReminder: (id: string, date: Date) => void;
  onDeleteRecording: (id: string) => void;
}

const formatReminder = (reminder: Task["reminder"]): string => {
  if (reminder.type === "anytime") return "Anytime";
  if (reminder.type === "none") return "";

  const date = reminder.date;
  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "h:mm a")}`;
  }
  return format(date, "EEE, MMM d");
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onUncomplete,
  onDelete,
  onUpdateReminder,
  onDeleteRecording,
}) => {
  const reminderText = formatReminder(task.reminder);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = useCallback(() => {
    if (task.isCompleted || justCompleted) return;
    setJustCompleted(true);
    setTimeout(() => onComplete(task.id), 600);
  }, [task.id, task.isCompleted, justCompleted, onComplete]);

  // Simulated 5-second audio playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      setIsPlaying(false);
      setPlayProgress(0);
    } else {
      setIsPlaying(true);
      setPlayProgress(0);
    }
  }, [isPlaying]);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onUpdateReminder(task.id, date);
        setCalendarOpen(false);
      }
    },
    [task.id, onUpdateReminder]
  );

  const handleQuickReminder = useCallback(
    (option: "tomorrow" | "next-week") => {
      const now = new Date();
      const d = option === "tomorrow" ? addDays(now, 1) : addDays(now, 7);
      d.setHours(9, 0, 0, 0);
      onUpdateReminder(task.id, d);
      setCalendarOpen(false);
    },
    [task.id, onUpdateReminder]
  );

  const isStriking = justCompleted || task.isCompleted;

  return (
    <div
      className={cn(
        "w-full text-left p-4 bg-card rounded-2xl border shadow-sm",
        "transition-all duration-500",
        isStriking && "opacity-50"
      )}
    >
      {/* Top row: completion circle + summary */}
      <div className="flex items-start gap-3">
        <button
          onClick={handleComplete}
          className={cn(
            "mt-0.5 shrink-0 transition-all duration-300",
            isStriking && "animate-[bounce_0.4s_ease-out]"
          )}
          aria-label="Mark complete"
        >
          {isStriking ? (
            <CheckCircle2 size={20} className="text-primary animate-scale-in" />
          ) : (
            <Circle size={20} className="text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0 relative">
          <p
            className={cn(
              "font-medium text-card-foreground leading-snug transition-all duration-500",
              isStriking && "text-muted-foreground"
            )}
          >
            <span className="relative inline">
              {task.summary}
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-[1.5px] bg-muted-foreground/60 transition-all duration-500 ease-out",
                  isStriking ? "w-full" : "w-0"
                )}
              />
            </span>
          </p>
          {reminderText && (
            <span className={cn(
              "text-xs text-muted-foreground mt-1 block transition-opacity duration-500",
              isStriking && "opacity-50"
            )}>
              {reminderText}
            </span>
          )}
        </div>
      </div>

      {/* Audio progress bar */}
      {isPlaying && (
        <div className="mt-3 px-8">
          <Progress value={playProgress} className="h-1" />
        </div>
      )}

      {/* Action row */}
      {!isStriking ? (
        <div className="flex items-center mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            {task.hasAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause recording" : "Play recording"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            )}

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  aria-label="Set reminder"
                >
                  <CalendarIcon size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="top">
                <div className="flex gap-1 p-2 border-b border-border">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleQuickReminder("tomorrow")}>
                    Tomorrow
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleQuickReminder("next-week")}>
                    Next Week
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={task.reminder.type === "specific" ? task.reminder.date : undefined}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Delete options"
                >
                  <Trash2 size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top">
                {task.hasAudio && (
                  <DropdownMenuItem onClick={() => onDeleteRecording(task.id)} className="text-sm">
                    <Volume2 size={14} className="mr-2" />
                    Delete Recording
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-sm text-destructive focus:text-destructive">
                  <Trash2 size={14} className="mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : task.isCompleted && onUncomplete ? (
        <div className="flex items-center mt-3 pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-primary"
            onClick={() => onUncomplete(task.id)}
          >
            Undo
          </Button>
        </div>
      ) : null}
    </div>
  );
};
