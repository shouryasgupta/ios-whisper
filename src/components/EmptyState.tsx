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
        <h3 className="text-xl font-semibold mb-2">All done!</h3>
        <p className="text-muted-foreground">
          You've handled everything. Take a moment to relax.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-4 pb-12 px-8 text-center">
      {/* Animated dashed line + arrowhead pointing up toward the mic */}
      <svg
        width="24"
        height="64"
        viewBox="0 0 24 64"
        fill="none"
        className="mb-3"
        aria-hidden="true"
      >
        {/* Arrowhead at top */}
        <path
          d="M12 2 L6 10 M12 2 L18 10"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        {/* Animated dashed vertical line */}
        <line
          x1="12"
          y1="10"
          x2="12"
          y2="64"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 5"
          strokeOpacity="0.4"
          style={{
            strokeDashoffset: 0,
            animation: "dash-flow 1.2s linear infinite",
          }}
        />
      </svg>

      <p className="text-sm text-muted-foreground">
        Tap the mic to capture your first task
      </p>

      <style>{`
        @keyframes dash-flow {
          from { stroke-dashoffset: 18; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};
