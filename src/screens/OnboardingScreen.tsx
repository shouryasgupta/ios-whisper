import React from "react";
import { MicButton } from "@/components/MicButton";

interface OnboardingScreenProps {
  onStartCapture: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStartCapture }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-background safe-area-top safe-area-bottom">
      {/* Logo/Brand */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-primary">Handled</h1>
      </div>

      {/* Main content */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 leading-tight">
          What do you want<br />handled?
        </h2>
        <p className="text-lg text-muted-foreground">
          Say it once. Don't think about it again.
        </p>
      </div>

      {/* Mic button */}
      <div className="mb-8">
        <MicButton onClick={onStartCapture} size="large" />
      </div>

      {/* Helper text */}
      <p className="text-sm text-muted-foreground text-center">
        Tap the mic and tell us what's on your mind
      </p>

      {/* Sign-in hint */}
      <p className="text-xs text-muted-foreground/60 mt-auto mb-8">
        Sign in later to sync across devices
      </p>
    </div>
  );
};
