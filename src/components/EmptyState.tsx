import React from "react";
import { Mic, CheckCircle2 } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Mic size={36} className="text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Your mind is clear</h3>
      <p className="text-muted-foreground mb-1">
        Tap the mic to capture something you want handled.
      </p>
      <p className="text-sm text-muted-foreground/70">
        We'll remember it so you don't have to.
      </p>
    </div>
  );
};
