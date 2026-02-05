import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { InlineVoiceCapture } from "@/components/InlineVoiceCapture";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { isToday, isFuture, addDays, isBefore } from "date-fns";
import { Cloud, Watch, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const HomeScreen: React.FC = () => {
  const { tasks, user, addTask, completeTask, uncompleteTask, deleteTask, updateTaskReminder, deleteRecording } = useApp();
  const { toast } = useToast();
  const [showCompleted, setShowCompleted] = useState(false);

  // Undo-aware complete handler
  const handleComplete = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    completeTask(id);
    toast({
      title: "Task completed",
      description: task?.summary,
      action: (
        <button
          onClick={() => uncompleteTask(id)}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
        >
          Undo
        </button>
      ),
      duration: 5000,
    });
  }, [tasks, completeTask, uncompleteTask, toast]);

  // Categorize tasks
  const { todayTasks, upcomingTasks, savedTasks, completedTasks } = useMemo(() => {
    const now = new Date();
    const in7Days = addDays(now, 7);

    const incomplete = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);

    const today = incomplete.filter(t => {
      if (t.reminder.type === "anytime") return true;
      if (t.reminder.type === "specific") return isToday(t.reminder.date);
      return false;
    });

    const upcoming = incomplete.filter(t => {
      if (t.reminder.type === "specific") {
        const date = t.reminder.date;
        return isFuture(date) && !isToday(date) && isBefore(date, in7Days);
      }
      return false;
    });

    const saved = incomplete.filter(t => t.kind === "note" || t.kind === "draft");

    return {
      todayTasks: today,
      upcomingTasks: upcoming,
      savedTasks: saved.filter(t => !today.includes(t) && !upcoming.includes(t)),
      completedTasks: completed,
    };
  }, [tasks]);

  const hasNoActiveTasks = todayTasks.length === 0 && upcomingTasks.length === 0 && savedTasks.length === 0;
  const allDone = hasNoActiveTasks && completedTasks.length > 0;

  const renderSection = (title: string, sectionTasks: typeof todayTasks) => (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h2>
      <div className="space-y-3">
        {sectionTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleComplete}
            onDelete={deleteTask}
            onUpdateReminder={updateTaskReminder}
            onDeleteRecording={deleteRecording}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg safe-area-top">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h1 className="text-xl font-bold">Handled</h1>
            {user && (
              <div className="flex items-center gap-2 mt-0.5">
                <Cloud size={10} className="text-success" />
                <span className="text-xs text-success">Synced</span>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3">
              {user.watchCaptureEnabled && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  <Watch size={12} />
                  <span>Watch</span>
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{user.name.charAt(0)}</span>
              </div>
            </div>
          )}
        </div>
        <InlineVoiceCapture onCapture={addTask} />
      </header>

      {/* Content */}
      <main className="px-5">
        {hasNoActiveTasks && completedTasks.length === 0 ? (
          <EmptyState type="no-tasks" />
        ) : hasNoActiveTasks && completedTasks.length > 0 ? (
          <EmptyState type="all-done" />
        ) : (
          <div className="space-y-6">
            {todayTasks.length > 0 && renderSection("Today", todayTasks)}
            {upcomingTasks.length > 0 && renderSection("Upcoming", upcomingTasks)}
            {savedTasks.length > 0 && renderSection("Saved", savedTasks)}
          </div>
        )}

        {/* Completed section */}
        {completedTasks.length > 0 && (
          <section className="mt-8">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 hover:text-foreground transition-colors"
            >
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  showCompleted && "rotate-180"
                )}
              />
              Completed ({completedTasks.length})
            </button>
            {showCompleted && (
              <div className="space-y-3 animate-fade-in">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onDelete={deleteTask}
                    onUpdateReminder={updateTaskReminder}
                    onDeleteRecording={deleteRecording}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
