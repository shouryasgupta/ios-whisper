import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { MicButton } from "@/components/MicButton";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailSheet } from "@/components/TaskDetailSheet";
import { VoiceCaptureSheet } from "@/components/VoiceCaptureSheet";
import { EmptyState } from "@/components/EmptyState";
import { Task } from "@/types/task";
import { isToday, isFuture, addDays, isBefore } from "date-fns";
import { Cloud, Watch } from "lucide-react";

interface HomeScreenProps {
  onOpenCapture: () => void;
  isCaptureOpen: boolean;
  onCloseCapture: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCapture,
  isCaptureOpen,
  onCloseCapture,
}) => {
  const { tasks, user, addTask, completeTask, deleteTask, snoozeTask } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Categorize tasks
  const { todayTasks, upcomingTasks, savedTasks, completedCount } = useMemo(() => {
    const now = new Date();
    const in7Days = addDays(now, 7);
    
    const incomplete = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);
    
    const today = incomplete.filter(t => {
      if (t.reminder.type === "anytime") return true;
      if (t.reminder.type === "specific") {
        return isToday(t.reminder.date);
      }
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
      completedCount: completed.length,
    };
  }, [tasks]);

  const hasNoTasks = todayTasks.length === 0 && upcomingTasks.length === 0 && savedTasks.length === 0;
  const allDone = hasNoTasks && completedCount > 0;

  const handleCapture = (text: string) => {
    addTask(text);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Fixed Header with Mic Button */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg safe-area-top">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h1 className="text-2xl font-bold">Handled</h1>
            {user && (
              <div className="flex items-center gap-2 mt-1">
                <Cloud size={12} className="text-success" />
                <span className="text-xs text-success">Synced</span>
              </div>
            )}
          </div>
          
          {/* Primary CTA - Mic Button */}
          <div className="flex items-center gap-3">
            <MicButton onClick={onOpenCapture} />
            
            {user && (
              <>
                {user.watchCaptureEnabled && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    <Watch size={12} />
                    <span>Watch</span>
                  </div>
                )}
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-5">
        {hasNoTasks ? (
          <EmptyState type={allDone ? "all-done" : "no-tasks"} />
        ) : (
          <div className="space-y-6">
            {/* Today */}
            {todayTasks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Today
                </h2>
                <div className="space-y-3">
                  {todayTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcomingTasks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Upcoming
                </h2>
                <div className="space-y-3">
                  {upcomingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Saved */}
            {savedTasks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Saved
                </h2>
                <div className="space-y-3">
                  {savedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>


      {/* Voice capture sheet */}
      <VoiceCaptureSheet
        isOpen={isCaptureOpen}
        onClose={onCloseCapture}
        onCapture={handleCapture}
      />

      {/* Task detail sheet */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onComplete={completeTask}
        onSnooze={snoozeTask}
        onDelete={deleteTask}
      />
    </div>
  );
};
