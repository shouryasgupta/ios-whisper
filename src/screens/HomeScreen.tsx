import React, { useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { InlineVoiceCapture } from "@/components/InlineVoiceCapture";
import { TaskCard } from "@/components/TaskCard";
import { CaptureProcessingCard } from "@/components/CaptureProcessingCard";
import { EmptyState } from "@/components/EmptyState";
import { NudgeCard } from "@/components/NudgeCard";
import { isToday, isFuture, isPast, addDays, isBefore } from "date-fns";
import { Cloud, Watch, ChevronDown, Bug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HomeScreenProps {
  onOpenWatchSetup?: () => void;
  onOpenSignIn?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenWatchSetup, onOpenSignIn }) => {
  const {
    tasks, captures, user, isRecording,
    addTask, completeTask, uncompleteTask, deleteTask,
    updateTaskReminder, deleteCapture, retryCapture,
    addCapture, failCapture, goOnline,
  } = useApp();
  const { toast } = useToast();
  const [showCompleted, setShowCompleted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

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

  const handleDeleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    deleteTask(id);
    toast({
      title: "Task deleted",
      description: task?.summary,
      duration: 5000,
    });
  }, [tasks, deleteTask, toast]);

  const handleDeleteCapture = useCallback((captureId: string) => {
    deleteCapture(captureId);
    toast({
      title: "Voice capture deleted",
      duration: 5000,
    });
  }, [deleteCapture, toast]);

  // Filter captures that should show as processing rows (not "done")
  const pendingCaptures = useMemo(() =>
    captures.filter(c => c.status !== "done"),
    [captures]
  );

  const { overdueTasks, todayTasks, upcomingTasks, savedTasks, completedTasks } = useMemo(() => {
    const now = new Date();
    const in7Days = addDays(now, 7);
    const incomplete = tasks.filter(t => !t.isCompleted);
    const completed = tasks.filter(t => t.isCompleted);

    const overdue = incomplete.filter(t => t.reminder.type === "specific" && isPast(t.reminder.date) && !isToday(t.reminder.date));
    const today = incomplete.filter(t => t.reminder.type === "anytime" || (t.reminder.type === "specific" && isToday(t.reminder.date)));
    const upcoming = incomplete.filter(t => t.reminder.type === "specific" && isFuture(t.reminder.date) && !isToday(t.reminder.date) && isBefore(t.reminder.date, in7Days));
    const saved = incomplete.filter(t => t.kind === "note" || t.kind === "draft");

    return {
      overdueTasks: overdue,
      todayTasks: today.filter(t => !overdue.includes(t)),
      upcomingTasks: upcoming,
      savedTasks: saved.filter(t => !today.includes(t) && !upcoming.includes(t) && !overdue.includes(t)),
      completedTasks: completed,
    };
  }, [tasks]);

  const hasNoActiveTasks = overdueTasks.length === 0 && todayTasks.length === 0 && upcomingTasks.length === 0 && savedTasks.length === 0 && pendingCaptures.length === 0;

  const renderSection = (title: string, sectionTasks: typeof todayTasks, isOverdue = false) => (
    <section>
      <h2 className={cn(
        "text-sm font-semibold uppercase tracking-wide mb-3",
        isOverdue ? "text-destructive" : "text-muted-foreground"
      )}>
        {title}
      </h2>
      <div className="space-y-3">
        {sectionTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleComplete}
            onDelete={handleDeleteTask}
            onUpdateReminder={updateTaskReminder}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen pb-24">
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
          <div className="flex items-center gap-2">
            {user && user.watchCaptureEnabled && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                <Watch size={12} />
                <span>Watch</span>
              </div>
            )}
            <button
              onClick={() => setShowDebug(prev => !prev)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                showDebug ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"
              )}
              aria-label="Debug panel"
            >
              <Bug size={14} />
            </button>
            {user && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Debug panel */}
        {showDebug && (
          <div className="px-5 py-3 border-b border-border bg-secondary/30">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Debug Tools</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  addCapture(Math.floor(10 + Math.random() * 50), true);
                  toast({ title: "Offline capture created", description: "Waiting for internet", duration: 2000 });
                }}
              >
                + Offline Capture
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  addCapture(Math.floor(10 + Math.random() * 50), false);
                  toast({ title: "Online capture created", description: "Processing…", duration: 2000 });
                }}
              >
                + Online Capture
              </Button>
              {captures.filter(c => c.status === "waiting" || c.status === "processing").map(c => (
                <Button
                  key={`fail-${c.id}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 text-destructive border-destructive/30"
                  onClick={() => failCapture(c.id)}
                >
                  Fail #{c.id.slice(0, 4)}
                </Button>
              ))}
              {captures.filter(c => c.status === "waiting").map(c => (
                <Button
                  key={`online-${c.id}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 text-primary border-primary/30"
                  onClick={() => goOnline(c.id)}
                >
                  Go Online #{c.id.slice(0, 4)}
                </Button>
              ))}
            </div>
          </div>
        )}

        <InlineVoiceCapture onCapture={addTask} />
      </header>

      <main className="px-5">
        {hasNoActiveTasks && completedTasks.length === 0 && !isRecording ? (
          <>
            <EmptyState type="no-tasks" />
            <NudgeCard
              onOpenSignIn={onOpenSignIn ?? (() => {})}
              onOpenWatchSetup={onOpenWatchSetup ?? (() => {})}
            />
          </>
        ) : hasNoActiveTasks && completedTasks.length > 0 ? (
          <>
            <EmptyState type="all-done" />
            <NudgeCard
              onOpenSignIn={onOpenSignIn ?? (() => {})}
              onOpenWatchSetup={onOpenWatchSetup ?? (() => {})}
            />
          </>
        ) : (
          <>
            <NudgeCard
              onOpenSignIn={onOpenSignIn ?? (() => {})}
              onOpenWatchSetup={onOpenWatchSetup ?? (() => {})}
            />
            <div className="space-y-6">
              {/* Processing rows at top of list — no section header */}
              {pendingCaptures.length > 0 && (
                <div className="space-y-3">
                  {pendingCaptures.map(capture => (
                    <CaptureProcessingCard
                      key={capture.id}
                      capture={capture}
                      onDelete={handleDeleteCapture}
                      onRetry={retryCapture}
                    />
                  ))}
                </div>
              )}

              {overdueTasks.length > 0 && renderSection("Overdue", overdueTasks, true)}
              {todayTasks.length > 0 && renderSection("Today", todayTasks)}
              {upcomingTasks.length > 0 && renderSection("Upcoming", upcomingTasks)}
              {savedTasks.length > 0 && renderSection("Saved", savedTasks)}
            </div>
          </>
        )}

        {completedTasks.length > 0 && (
          <section className="mt-8">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 hover:text-foreground transition-colors"
            >
              <ChevronDown size={14} className={cn("transition-transform duration-200", showCompleted && "rotate-180")} />
              Completed ({completedTasks.length})
            </button>
            {showCompleted && (
              <div className="space-y-3 animate-fade-in">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onUncomplete={uncompleteTask}
                    onDelete={handleDeleteTask}
                    onUpdateReminder={updateTaskReminder}
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
