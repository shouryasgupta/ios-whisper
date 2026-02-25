import React from "react";
import { Watch, LogIn, Zap, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { NudgeType } from "@/types/task";

interface NudgeCardProps {
  onOpenSignIn: () => void;
  onOpenWatchSetup: () => void;
}

const nudgeContent: Record<NudgeType, {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  cta: string;
  variant: "sign-in" | "watch";
}> = {
  "sign-in": {
    icon: <LogIn size={16} className="text-primary" />,
    label: "Unlock sync",
    title: "Save across devices",
    description: "Sign in to sync your captures and unlock hands-free watch capture.",
    cta: "Sign in",
    variant: "sign-in",
  },
  "watch-setup": {
    icon: <Watch size={16} className="text-primary" />,
    label: "Level up your capture",
    title: "Capture without your phone",
    description: "Add the Handled complication to your Apple Watch and capture from your wrist.",
    cta: "Set up Apple Watch",
    variant: "watch",
  },
  "watch-usage": {
    icon: <Watch size={16} className="text-primary" />,
    label: "Try your wrist",
    title: "Your watch is ready — give it a try",
    description: "Raise your wrist and tap the Handled complication to capture hands-free.",
    cta: "Show me how",
    variant: "watch",
  },
  "power": {
    icon: <Zap size={16} className="text-primary" />,
    label: "Power feature",
    title: "You're a pro",
    description: "Explore advanced features to get even more done.",
    cta: "Learn more",
    variant: "watch",
  },
};

export const NudgeCard: React.FC<NudgeCardProps> = ({ onOpenSignIn, onOpenWatchSetup }) => {
  const { primaryNudge, dismissNudge, captureCount } = useApp();

  if (!primaryNudge) return null;

  const content = nudgeContent[primaryNudge];

  const handleCta = () => {
    if (primaryNudge === "sign-in") {
      onOpenSignIn();
    } else {
      onOpenWatchSetup();
    }
  };

  return (
    <div className="mx-5 mt-4 mb-1 bg-card border rounded-2xl overflow-hidden animate-fade-in">
      <div className="h-1 bg-primary w-full" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {content.icon}
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {content.label}
            </span>
          </div>
          <button
            onClick={() => dismissNudge(primaryNudge)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -mr-1 -mt-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="font-semibold text-base mb-1 leading-snug">
          {primaryNudge === "watch-setup" && captureCount >= 3
            ? `You've captured ${captureCount} things — try your wrist next`
            : content.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {content.description}
        </p>

        {primaryNudge !== "watch-usage" && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-full">
              <Zap size={11} className="text-primary" />
              <span>{primaryNudge === "sign-in" ? "Sync everywhere" : "Faster than phone"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-full">
              <Watch size={11} className="text-primary" />
              <span>{primaryNudge === "sign-in" ? "Unlock Watch" : "Works offline"}</span>
            </div>
          </div>
        )}

        <Button onClick={handleCta} className="w-full h-10 rounded-xl text-sm">
          {content.cta}
        </Button>
      </div>
    </div>
  );
};
