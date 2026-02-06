import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicButton } from "@/components/MicButton";
import { sampleTranscriptions } from "@/types/task";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InlineVoiceCaptureProps {
  onCapture: (text: string) => void;
}

type RecordingState = "idle" | "recording" | "paused";

const suggestions = [
  "Buy diapers tomorrow",
  "Call mom on Tuesday",
  "Book dentist appointment",
  "Pick up dry cleaning after work",
  "Email landlord about lease renewal",
  "Order birthday gift for Sarah",
  "Schedule car service this weekend",
];

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
}) => {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
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

  // Revolving suggestion text
  useEffect(() => {
    if (state !== "idle") return;
    const timer = setInterval(() => {
      setSuggestionIndex(prev => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [state]);

  const handleStartRecording = () => {
    setState("recording");
    setElapsed(0);
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
        {/* Revolving suggestion text */}
        <p className="text-sm text-muted-foreground mt-3 h-5 overflow-hidden">
          <span key={suggestionIndex} className="inline-block animate-fade-in">
            "{suggestions[suggestionIndex]}"
          </span>
        </p>
      </div>
    );
  }

  // ─── Recording / Paused state ───
  return (
    <div className="flex flex-col items-center py-4 animate-fade-in">
      {/* Status text */}
      <p className="text-lg font-medium mb-1">
        {state === "recording" ? "Listening..." : "Paused"}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        {state === "recording"
          ? "Speak in your preferred language"
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

      {/* Controls row: Cancel + Stop + Pause/Resume */}
      <div className="flex items-center gap-3">
        {/* Cancel */}
        <Button
          onClick={handleCancel}
          variant="ghost"
          className="w-12 h-12 rounded-full p-0"
          aria-label="Cancel recording"
        >
          <X size={20} />
        </Button>

        {/* Stop / Done — center, largest */}
        <Button
          onClick={handleStop}
          size="lg"
          className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 p-0"
          aria-label="Stop and save recording"
        >
          <Square size={20} fill="currentColor" />
        </Button>

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
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {state === "recording" ? "Pause or stop when done" : "Resume or stop to save"}
      </p>
    </div>
  );
};
