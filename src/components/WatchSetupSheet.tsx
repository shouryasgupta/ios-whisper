import React, { useState, useEffect, useCallback } from "react";
import { Watch, CheckCircle2, Circle, Loader2, Mic, Sparkles, ChevronRight, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

interface WatchSetupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

// Detection checklist item states
type CheckState = "pending" | "loading" | "done";

// ─── Step 1: Kickoff ───────────────────────────────────────────────────────────
const StepKickoff: React.FC<{ captureCount: number; onActivate: () => void; onDismiss: () => void }> = ({
  captureCount,
  onActivate,
  onDismiss,
}) => (
  <div className="flex flex-col items-center text-center px-2 py-4">
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <Watch size={36} className="text-primary" />
    </div>
    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
      Step 1 of 3
    </p>
    <h2 className="text-2xl font-bold mb-2 leading-tight">Activate hands-free capture</h2>
    <p className="text-muted-foreground text-sm mb-1">Takes about a minute</p>

    {captureCount > 0 && (
      <div className="mt-4 mb-2 bg-secondary rounded-2xl px-4 py-3 w-full text-left">
        <p className="text-sm text-muted-foreground">
          You've captured <span className="font-semibold text-foreground">{captureCount} things</span> — your wrist is the fastest way to capture your next one.
        </p>
      </div>
    )}

    <div className="w-full mt-6 space-y-3">
      <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={onActivate}>
        Activate
      </Button>
      <button
        onClick={onDismiss}
        className="w-full py-3 text-muted-foreground text-sm font-medium"
      >
        Not now
      </button>
    </div>
  </div>
);

// ─── Step 2: Auto-Detection ────────────────────────────────────────────────────
const StepDetection: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [states, setStates] = useState<[CheckState, CheckState]>(["loading", "pending"]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStates(["done", "loading"]);
    }, 1400);
    const t2 = setTimeout(() => {
      setStates(["done", "done"]);
    }, 2800);
    const t3 = setTimeout(() => {
      onComplete();
    }, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const items: { label: string; state: CheckState }[] = [
    { label: "Checking for watch", state: states[0] },
    { label: "Syncing to watch", state: states[1] },
  ];

  return (
    <div className="flex flex-col items-center text-center px-2 py-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Watch size={36} className="text-primary" />
      </div>
      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
        Step 2 of 3
      </p>
      <h2 className="text-2xl font-bold mb-2 leading-tight">Connecting to your watch</h2>
      <p className="text-muted-foreground text-sm mb-8">Hang tight — this only takes a moment</p>

      <div className="w-full space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4 bg-secondary rounded-2xl px-5 py-4">
            <div className="flex-shrink-0">
              {item.state === "done" ? (
                <CheckCircle2 size={22} className="text-primary animate-fade-scale-in" />
              ) : item.state === "loading" ? (
                <Loader2 size={22} className="text-primary animate-spin" />
              ) : (
                <Circle size={22} className="text-muted-foreground/30" />
              )}
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors duration-300",
              item.state === "done" ? "text-foreground" : item.state === "loading" ? "text-foreground" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Step 3: Add Shortcut ──────────────────────────────────────────────────────
const StepShortcut: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const instructionSteps = [
    "Press and hold your watch face",
    "Tap Customize",
    "Add Handled to any slot",
  ];

  return (
    <div className="flex flex-col px-2 py-4">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Watch size={36} className="text-primary" />
        </div>
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
          Step 3 of 3
        </p>
        <h2 className="text-2xl font-bold mb-2 leading-tight">Add one-tap access to your wrist</h2>
        <p className="text-muted-foreground text-sm">So you never need your phone</p>
      </div>

      <div className="space-y-3 mb-6">
        {instructionSteps.map((label, i) => (
          <div key={i} className="flex items-center gap-4 bg-secondary rounded-2xl px-5 py-4">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      <button
        className="flex items-center justify-center gap-2 text-sm text-primary font-medium mb-6 hover:opacity-80 transition-opacity"
        onClick={() => {/* would open Watch app */ }}
      >
        <ExternalLink size={14} />
        Open Watch Settings
      </button>

      <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={onNext}>
        I've added it
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

// ─── Step 4: First Capture ─────────────────────────────────────────────────────
const StepCapture: React.FC<{ onSuccess: () => void; onSkip: () => void }> = ({ onSuccess, onSkip }) => {
  const [phase, setPhase] = useState<"idle" | "listening" | "transcribing" | "done">("idle");
  const prompt = "Buy diapers tomorrow";

  const handleTry = useCallback(() => {
    setPhase("listening");
    setTimeout(() => setPhase("transcribing"), 2000);
    setTimeout(() => setPhase("done"), 3500);
    setTimeout(() => onSuccess(), 4200);
  }, [onSuccess]);

  return (
    <div className="flex flex-col items-center text-center px-2 py-4">
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500",
        phase === "listening" ? "bg-primary animate-recording-pulse" : "bg-primary/10"
      )}>
        <Mic size={36} className={cn("transition-colors duration-300", phase === "listening" ? "text-primary-foreground" : "text-primary")} />
      </div>

      <h2 className="text-2xl font-bold mb-2 leading-tight">Try it now</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Raise your wrist and say:
      </p>

      <div className="bg-secondary rounded-2xl px-6 py-4 mb-8 w-full">
        <p className="text-base font-semibold italic text-foreground">
          "{prompt}"
        </p>
      </div>

      {phase === "idle" && (
        <div className="w-full space-y-3">
          <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={handleTry}>
            Simulate capture
          </Button>
          <button onClick={onSkip} className="w-full py-3 text-muted-foreground text-sm font-medium">
            Skip for now
          </button>
        </div>
      )}

      {phase === "listening" && (
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary animate-waveform"
                style={{ animationDelay: `${i * 0.1}s`, height: "1.25rem" }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Listening…</p>
        </div>
      )}

      {phase === "transcribing" && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span>Processing…</span>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-2 animate-fade-scale-in">
          <CheckCircle2 size={32} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Captured!</p>
        </div>
      )}
    </div>
  );
};

// ─── Step 5: Completion ────────────────────────────────────────────────────────
const StepCompletion: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <div className="flex flex-col items-center text-center px-2 py-4">
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <Sparkles size={36} className="text-primary" />
    </div>
    <h2 className="text-2xl font-bold mb-2 leading-tight">You're all set</h2>
    <p className="text-muted-foreground text-sm mb-2">Next time, just raise your wrist</p>

    <div className="mt-4 mb-8 bg-secondary rounded-2xl px-4 py-3 w-full">
      <p className="text-sm text-muted-foreground">
        💡 Most users save <span className="font-semibold text-foreground">~5 minutes a day</span> with wrist capture
      </p>
    </div>

    <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={onDone}>
      Back to Home
    </Button>
  </div>
);

// ─── Progress indicator ────────────────────────────────────────────────────────
const ProgressDots: React.FC<{ step: Step }> = ({ step }) => {
  // Only show dots for steps 1–3 (the "setup" steps)
  if (step > 3) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-2 mb-4">
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={cn(
            "rounded-full transition-all duration-300",
            s === step ? "w-6 h-2 bg-primary" : s < step ? "w-2 h-2 bg-primary/40" : "w-2 h-2 bg-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const WatchSetupSheet: React.FC<WatchSetupSheetProps> = ({
  open,
  onOpenChange,
}) => {
  const { enableWatchCapture, captureCount } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [transitioning, setTransitioning] = useState(false);

  const goToStep = useCallback((next: Step) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
    }, 220);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => setStep(1), 400);
    }
  }, [open]);

  const handleDone = useCallback(() => {
    enableWatchCapture();
    onOpenChange(false);
  }, [enableWatchCapture, onOpenChange]);

  const handleDismiss = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-10 max-h-[92vh] overflow-y-auto">
        <SheetHeader className="mb-2">
          <SheetTitle className="text-center text-base font-semibold text-muted-foreground">
            Apple Watch Setup
          </SheetTitle>
        </SheetHeader>

        <ProgressDots step={step} />

        <div
          className="px-2 transition-all duration-220"
          style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(6px)" : "translateY(0)" }}
        >
          {step === 1 && (
            <StepKickoff
              captureCount={captureCount}
              onActivate={() => goToStep(2)}
              onDismiss={handleDismiss}
            />
          )}
          {step === 2 && (
            <StepDetection onComplete={() => goToStep(3)} />
          )}
          {step === 3 && (
            <StepShortcut onNext={() => goToStep(4)} />
          )}
          {step === 4 && (
            <StepCapture
              onSuccess={() => goToStep(5)}
              onSkip={() => goToStep(5)}
            />
          )}
          {step === 5 && (
            <StepCompletion onDone={handleDone} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
