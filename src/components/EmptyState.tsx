import React from "react";
import { CheckCircle2, ArrowUp } from "lucide-react";

interface EmptyStateProps {
  type: "no-tasks" | "all-done";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  if (type === "all-done") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <h3 className="text-xl font-semibold mb-2">All done!</h3>
        <p className="text-muted-foreground">
          You've handled everything. Take a moment to relax.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <ArrowUp
        size={28}
        className="text-primary/50 animate-bounce mb-3"
      />
      <p className="text-sm text-muted-foreground">
        Tap the mic to capture your first task
      </p>
    </div>
  );
};
