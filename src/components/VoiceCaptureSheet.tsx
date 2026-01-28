import React, { useState, useEffect, useCallback } from "react";
import { X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sampleTranscriptions } from "@/types/task";

interface VoiceCaptureSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (text: string) => void;
}

const WaveformBar: React.FC<{ delay: number }> = ({ delay }) => (
  <div
    className="w-1 bg-primary rounded-full animate-waveform"
    style={{ animationDelay: `${delay}ms` }}
  />
);

export const VoiceCaptureSheet: React.FC<VoiceCaptureSheetProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [capturedText, setCapturedText] = useState("");

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setIsRecording(true);
      setTimeLeft(60);
      setShowConfirmation(false);
      setCapturedText("");
    }
  }, [isOpen]);

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
    onClose();
  };

  const handleDone = () => {
    setShowConfirmation(false);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Sheet */}
      <div className={cn(
        "relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-10 safe-area-bottom animate-slide-up",
        "shadow-2xl"
      )}>
        {showConfirmation ? (
          /* Confirmation State */
          <div className="flex flex-col items-center text-center animate-fade-scale-in">
            {/* Checkmark */}
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-success"
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
            
            <h2 className="text-2xl font-semibold mb-2">Got it!</h2>
            <p className="text-muted-foreground mb-6">
              You don't need to remember this anymore.
            </p>
            
            <div className="w-full p-4 bg-secondary rounded-xl mb-6">
              <p className="text-sm text-secondary-foreground">{capturedText}</p>
            </div>
            
            <Button onClick={handleDone} className="w-full rounded-xl h-12">
              Done
            </Button>
          </div>
        ) : (
          /* Recording State */
          <div className="flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Cancel"
            >
              <X size={24} className="text-muted-foreground" />
            </button>
            
            <h2 className="text-xl font-medium mb-2">Listening...</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Tell me what you want handled
            </p>
            
            {/* Waveform animation */}
            <div className="flex items-center justify-center gap-1 h-16 mb-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <WaveformBar key={i} delay={i * 50} />
              ))}
            </div>
            
            {/* Timer */}
            <div className="text-3xl font-light text-muted-foreground mb-8">
              {formatTime(timeLeft)}
            </div>
            
            {/* Stop button */}
            <Button
              onClick={handleStopRecording}
              size="lg"
              className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90"
            >
              <Square size={24} fill="currentColor" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">Tap to stop</p>
          </div>
        )}
      </div>
    </div>
  );
};
