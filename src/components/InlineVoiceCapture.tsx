import React, { useState, useEffect, useCallback } from "react";
import { X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicButton } from "@/components/MicButton";
import { sampleTranscriptions } from "@/types/task";
import { cn } from "@/lib/utils";

interface InlineVoiceCaptureProps {
  onCapture: (text: string) => void;
}

const WaveformBar: React.FC<{ delay: number }> = ({ delay }) => (
  <div
    className="w-1 bg-primary rounded-full animate-waveform"
    style={{ animationDelay: `${delay}ms` }}
  />
);

export const InlineVoiceCapture: React.FC<InlineVoiceCaptureProps> = ({
  onCapture,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [capturedText, setCapturedText] = useState("");

  // Timer countdown
  useEffect(() => {
    if (!isRecording || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleStopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeLeft(60);
    setShowConfirmation(false);
    setCapturedText("");
  };

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    
    // Simulate transcription with random sample
    const randomText = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
    setCapturedText(randomText);
    
    // Show confirmation after brief delay
    setTimeout(() => {
      setShowConfirmation(true);
      onCapture(randomText);
    }, 500);
  }, [onCapture]);

  const handleCancel = () => {
    setIsRecording(false);
    setShowConfirmation(false);
    setTimeLeft(60);
  };

  const handleDone = () => {
    setShowConfirmation(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Idle state - show mic button
  if (!isRecording && !showConfirmation) {
    return (
      <div className="flex flex-col items-center py-4">
        <MicButton onClick={handleStartRecording} size="large" />
        <p className="text-sm text-muted-foreground mt-3">
          Speak in your preferred language
        </p>
      </div>
    );
  }

  // Confirmation state
  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center py-4 px-4 animate-fade-in">
        {/* Checkmark */}
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
          <svg
            className="w-10 h-10 text-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeDasharray="100"
              className="animate-checkmark"
            />
          </svg>
        </div>
        
        <h2 className="text-lg font-semibold mb-1">Got it!</h2>
        <p className="text-sm text-muted-foreground mb-3">
          You don't need to remember this anymore.
        </p>
        
        <div className="w-full max-w-sm p-3 bg-secondary rounded-xl mb-4">
          <p className="text-sm text-secondary-foreground text-center">{capturedText}</p>
        </div>
        
        <Button onClick={handleDone} className="rounded-xl px-8">
          Done
        </Button>
      </div>
    );
  }

  // Recording state
  return (
    <div className="flex flex-col items-center py-4 animate-fade-in">
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-secondary transition-colors"
        aria-label="Cancel"
      >
        <X size={20} className="text-muted-foreground" />
      </button>
      
      <p className="text-lg font-medium mb-1">Listening...</p>
      <p className="text-sm text-muted-foreground mb-4">
        Tell me what you want handled
      </p>
      
      {/* Waveform animation */}
      <div className="flex items-center justify-center gap-1 h-12 mb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <WaveformBar key={i} delay={i * 50} />
        ))}
      </div>
      
      {/* Timer */}
      <div className="text-2xl font-light text-muted-foreground mb-4">
        {formatTime(timeLeft)}
      </div>
      
      {/* Stop button */}
      <Button
        onClick={handleStopRecording}
        size="lg"
        className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90"
      >
        <Square size={20} fill="currentColor" />
      </Button>
      <p className="text-xs text-muted-foreground mt-2">Tap to stop</p>
    </div>
  );
};
