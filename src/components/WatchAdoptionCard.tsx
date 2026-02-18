import React from "react";
import { Watch, Zap, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

interface WatchAdoptionCardProps {
  onOpenSetup: () => void;
}

// Flow 2: shown for signed-in users without watch, after 3+ captures (proxy for D7)
export const WatchAdoptionCard: React.FC<WatchAdoptionCardProps> = ({ onOpenSetup }) => {
  const { user, captureCount, watchAdoptionDismissed, dismissWatchAdoption, firstCaptureDone } = useApp();

  const shouldShow =
    !!user &&
    !user.watchCaptureEnabled &&
    firstCaptureDone &&
    captureCount >= 3 &&
    !watchAdoptionDismissed;

  if (!shouldShow) return null;

  return (
    <div className="mx-5 mt-4 mb-1 bg-card border rounded-2xl overflow-hidden animate-fade-in">
      {/* Accent bar */}
      <div className="h-1 bg-primary w-full" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Watch size={16} className="text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Level up your capture
            </span>
          </div>
          <button
            onClick={dismissWatchAdoption}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -mr-1 -mt-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="font-semibold text-base mb-1 leading-snug">
          You've captured {captureCount} things — try your wrist next
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add the Handled complication to your Apple Watch and capture without even pulling out your phone.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-full">
            <Zap size={11} className="text-primary" />
            <span>Faster than phone</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-full">
            <Watch size={11} className="text-primary" />
            <span>Works offline</span>
          </div>
        </div>

        <Button
          onClick={onOpenSetup}
          className="w-full h-10 rounded-xl text-sm"
        >
          Set up Apple Watch
        </Button>
      </div>
    </div>
  );
};
