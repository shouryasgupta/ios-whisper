import React, { useState, useEffect, useCallback } from "react";
import { Watch, Grid3X3, Smartphone, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";


interface WatchSetupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    icon: Smartphone,
    title: "Open Watch app on your iPhone",
    description: "Go to the Watch app, then tap My Watch → Complications.",
  },
  {
    icon: Grid3X3,
    title: "Choose a complication slot",
    description: "Pick any complication position on your watch face.",
  },
  {
    icon: Watch,
    title: "Select Handled",
    description: "Scroll down and tap Handled. Tap to capture from your wrist.",
  },
];

const STEP_DURATION = 2800;

export const WatchSetupSheet: React.FC<WatchSetupSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const goToStep = useCallback((index: number) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveStep(index);
      setAnimating(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + (100 / (STEP_DURATION / 50));
      });
    }, 50);

    const stepTimer = setTimeout(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % steps.length;
        setProgress(0);
        return next;
      });
      setAnimating(false);
    }, STEP_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimer);
    };
  }, [open, activeStep]);

  const step = steps[activeStep];
  const Icon = step.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-center text-xl">
            Set up Apple Watch capture
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-center">
            Add the Handled complication to your watch face in 3 steps.
          </p>
        </SheetHeader>

        {/* Animated step display */}
        <div className="relative mb-8">
          {/* Big animated icon */}
          <div
            className="flex flex-col items-center text-center px-6 py-8 rounded-3xl bg-secondary transition-all duration-300"
            style={{ opacity: animating ? 0 : 1, transform: animating ? "scale(0.95)" : "scale(1)" }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Icon size={36} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
              Step {activeStep + 1} of {steps.length}
            </p>
            <h3 className="text-lg font-semibold mb-2 leading-snug">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeStep
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="bg-secondary rounded-2xl px-4 py-3 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Once set up, tap the complication on your watch and speak. Your capture syncs automatically.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
