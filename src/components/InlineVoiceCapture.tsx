import React, { useState, useEffect, useCallback } from "react";
import { X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicButton } from "@/components/MicButton";
import { sampleTranscriptions } from "@/types/task";
import { toast } from "@/hooks/use-toast";

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
  };

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    setTimeLeft(60);
    
    // Simulate transcription with random sample
    const randomText = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
    
    // Capture the task
    onCapture(randomText);
    
    // Show toast notification
    toast({
      title: "Got it!",
      description: "You don't need to remember this anymore.",
    });
  }, [onCapture]);

  const handleCancel = () => {
    setIsRecording(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Idle state - show mic button
  if (!isRecording) {
    return (
      <div className="flex flex-col items-center py-4">
        <MicButton onClick={handleStartRecording} size="large" />
        <p className="text-sm text-muted-foreground mt-3">
          Speak in your preferred language
        </p>
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
