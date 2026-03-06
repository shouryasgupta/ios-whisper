import React from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { NudgeType } from "@/types/task";

interface NudgeCardProps {
  onOpenSignIn: () => void;
  onOpenWatchSetup: () => void;
}

const nudgeContent: Record<NudgeType, {
  title: string;
  description: string;
  cta: string;
}> = {
  "sign-in": {
    title: "",
    description: "Keep your captures across devices. Capture hands-free from your watch.",
    cta: "Sign in",
  },
  "watch-setup": {
    title: "",
    description: "Set up your watch for faster, hands-free capture.",
    cta: "Set up Apple Watch",
  },
  "watch-usage": {
    title: "Your watch is ready",
    description: "Next time, just raise your wrist and tap to capture.",
    cta: "Got it",
  },
};

export const NudgeCard: React.FC<NudgeCardProps> = ({ onOpenSignIn, onOpenWatchSetup }) => {
  const { primaryNudge, dismissNudge } = useApp();

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
      <div className="h-0.5 bg-primary/60 w-full" />
      <div className="p-4">
        {content.title ? (
          <h3 className="font-semibold text-base mb-1 leading-snug">
            {content.title}
          </h3>
        ) : null}
        <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line leading-relaxed">
          {content.description}
        </p>

        <Button onClick={handleCta} className="w-full h-10 rounded-xl text-sm">
          {content.cta}
        </Button>

        <button
          onClick={() => dismissNudge(primaryNudge)}
          className="w-full py-2 mt-1 text-sm text-muted-foreground font-medium"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
