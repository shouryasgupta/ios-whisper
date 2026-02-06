import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicButton } from "@/components/MicButton";
import { sampleTranscriptions } from "@/types/task";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InlineVoiceCaptureProps {
  onCapture: (text: string) => void;
  showCoachMark?: boolean;
}

type RecordingState = "idle" | "recording" | "paused";

const WaveformBar: React.FC<{ delay: number; paused: boolean }> = ({ delay, paused }) => (
  <div
    className={cn(
      "w-1 rounded-full transition-all duration-300",
      paused ? "bg-muted-foreground/40 h-2" : "bg-primary animate-waveform"
    )}
    style={!paused ? { animationDelay: `${delay}ms` } : undefined}
  />
);

export const InlineVoiceCapture: React.FC<InlineVoiceCaptureProps> = ({
  onCapture,
  showCoachMark = false,
}) => {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [coachVisible, setCoachVisible] = useState(showCoachMark);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer: count up while recording (not paused)
  useEffect(() => {
    if (state === "recording") {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= 59) {
            handleStop();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  // Dismiss coach mark on first tap
  const handleStartRecording = () => {
    setState("recording");
    setElapsed(0);
    if (coachVisible) setCoachVisible(false);
  };

  const handlePause = () => {
    setState("paused");
  };

  const handleResume = () => {
    setState("recording");
  };

  const handleStop = useCallback(() => {
    setState("idle");
    setElapsed(0);

    const randomText =
      sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
    onCapture(randomText);

    toast({
      title: "Got it!",
      description: "You don't need to remember this anymore.",
    });
  }, [onCapture]);

  const handleCancel = () => {
    setState("idle");
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ─── Idle state ───
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center py-4 relative">
        <MicButton onClick={handleStartRecording} size="large" />
        <p className="text-sm text-muted-foreground mt-3">
          Speak in your preferred language
        </p>

        {/* Subtle coach mark for first-time users */}
        {coachVisible && (
          <div className="absolute -bottom-10 animate-fade-in">
            <div className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <span>Tap the mic to get started</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCoachVisible(false);
                }}
                className="ml-1 opacity-70 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
            {/* Arrow pointing up */}
            <div className="flex justify-center -mt-px">
              <div className="w-2.5 h-2.5 bg-primary rotate-45 -translate-y-1.5" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Recording / Paused state ───
  return (
    <div className="flex flex-col items-center py-4 animate-fade-in relative">
      {/* Cancel button — top right */}
      <button
        onClick={handleCancel}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-secondary transition-colors"
        aria-label="Cancel recording"
      >
        <X size={20} className="text-muted-foreground" />
      </button>

      {/* Status text */}
      <p className="text-lg font-medium mb-1">
        {state === "recording" ? "Listening..." : "Paused"}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        {state === "recording"
          ? "Tell me what you want handled"
          : "Tap resume to continue"}
      </p>

      {/* Waveform animation — freezes when paused */}
      <div className="flex items-center justify-center gap-1 h-12 mb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <WaveformBar key={i} delay={i * 50} paused={state === "paused"} />
        ))}
      </div>

      {/* Timer */}
      <div className="text-2xl font-light text-muted-foreground mb-5 tabular-nums">
        {formatTime(elapsed)}
      </div>

      {/* Controls row: Pause/Resume + Stop */}
      <div className="flex items-center gap-4">
        {/* Pause / Resume */}
        {state === "recording" ? (
          <Button
            onClick={handlePause}
            variant="secondary"
            className="w-12 h-12 rounded-full p-0"
            aria-label="Pause recording"
          >
            <Pause size={20} />
          </Button>
        ) : (
          <Button
            onClick={handleResume}
            variant="secondary"
            className="w-12 h-12 rounded-full p-0 animate-scale-in"
            aria-label="Resume recording"
          >
            <Play size={20} className="ml-0.5" />
          </Button>
        )}

        {/* Stop / Done */}
        <Button
          onClick={handleStop}
          size="lg"
          className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 p-0"
          aria-label="Stop and save recording"
        >
          <Square size={20} fill="currentColor" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {state === "recording" ? "Pause or stop when done" : "Resume or stop to save"}
      </p>
    </div>
  );
};
