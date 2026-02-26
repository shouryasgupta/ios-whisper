import React from "react";
import { CheckCircle2 } from "lucide-react";

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
        <h3 className="text-xl font-semibold mb-2">All done</h3>
        <p className="text-muted-foreground">
          You've handled everything. Take a moment to relax.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-6 pb-12 px-8 text-center">
      <p className="text-sm text-foreground font-medium mb-1">
        Just say it naturally
      </p>
      <p className="text-xs text-muted-foreground">
        Works in 30+ languages
      </p>
    </div>
  );
};
