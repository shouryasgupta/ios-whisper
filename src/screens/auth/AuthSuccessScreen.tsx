import React, { useEffect } from "react";
import { Check } from "lucide-react";

interface AuthSuccessScreenProps {
  onComplete: () => void;
}

export const AuthSuccessScreen: React.FC<AuthSuccessScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center max-w-lg mx-auto px-8 animate-fade-in">
      {/* Animated checkmark circle */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
          <Check size={28} className="text-primary-foreground" strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-xl font-semibold text-foreground mb-2">You're all set</h1>
      <p className="text-sm text-muted-foreground text-center">
        Your captures are safe and synced
      </p>
    </div>
  );
};
