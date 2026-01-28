import React from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicButtonProps {
  onClick: () => void;
  isRecording?: boolean;
  size?: "default" | "large";
  className?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  onClick,
  isRecording = false,
  size = "default",
  className,
}) => {
  const sizeClasses = size === "large" 
    ? "w-24 h-24" 
    : "w-16 h-16";

  const iconSize = size === "large" ? 40 : 28;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 press-effect",
        sizeClasses,
        isRecording && "animate-recording-pulse",
        className
      )}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {/* Pulse ring animation when recording */}
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        </>
      )}
      
      <Mic size={iconSize} className="relative z-10" />
    </button>
  );
};
