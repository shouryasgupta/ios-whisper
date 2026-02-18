import React from "react";
import { Watch, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface WatchNudgeBannerProps {
  onOpenSetup: () => void;
}

export const WatchNudgeBanner: React.FC<WatchNudgeBannerProps> = ({ onOpenSetup }) => {
  const { firstCaptureDone, watchNudgeDismissCount, dismissWatchNudge, user } = useApp();

  // Flow 1: only for non-signed-in users; signed-in users get WatchAdoptionCard (Flow 2)
  const shouldShow =
    firstCaptureDone &&
    watchNudgeDismissCount < 2 &&
    !user;

  if (!shouldShow) return null;

  return (
    <div className="mx-5 mt-3 mb-1 flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Watch size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">Capture from your wrist</p>
        <button
          onClick={onOpenSetup}
          className="text-xs text-primary font-medium mt-0.5 hover:opacity-80 transition-opacity"
        >
          Set up Apple Watch →
        </button>
      </div>
      <button
        onClick={dismissWatchNudge}
        className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};
