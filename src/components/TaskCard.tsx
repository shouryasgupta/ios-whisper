import React from "react";
import { Volume2, CheckSquare, ExternalLink, Clock, Calendar } from "lucide-react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
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

const getKindColor = (kind: Task["kind"]) => {
  switch (kind) {
    case "action":
      return "bg-primary/10 text-primary border-primary/20";
    case "note":
      return "bg-accent/10 text-accent border-accent/20";
    case "draft":
      return "bg-muted text-muted-foreground border-muted";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const reminderText = formatReminder(task.reminder);
  const isUpcoming = task.reminder.type === "specific" && 
    new Date(task.reminder.date).getTime() - Date.now() < 2 * 60 * 60 * 1000;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 bg-card rounded-2xl border shadow-sm",
        "transition-all duration-200 press-effect",
        "hover:shadow-md hover:border-primary/20",
        task.isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Summary */}
          <p className={cn(
            "font-medium text-card-foreground mb-2 leading-snug",
            task.isCompleted && "line-through"
          )}>
            {task.summary}
          </p>
          
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Reminder time */}
            {reminderText && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs",
                isUpcoming ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {isUpcoming ? <Clock size={12} /> : <Calendar size={12} />}
                {reminderText}
              </span>
            )}
            
            {/* Kind badge */}
            <Badge 
              variant="outline" 
              className={cn("text-xs capitalize", getKindColor(task.kind))}
            >
              {task.kind}
            </Badge>
          </div>
        </div>
        
        {/* Icons */}
        <div className="flex flex-col items-end gap-2">
          {task.hasAudio && (
            <Volume2 size={16} className="text-muted-foreground" />
          )}
          {task.hasChecklist && (
            <CheckSquare size={16} className="text-muted-foreground" />
          )}
          {task.isBuyIntent && (
            <ExternalLink size={16} className="text-accent" />
          )}
        </div>
      </div>
    </button>
  );
};
