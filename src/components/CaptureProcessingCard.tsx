import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, Trash2, Volume2, RotateCcw } from "lucide-react";
import { Capture } from "@/types/task";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CaptureProcessingCardProps {
  capture: Capture;
  onDelete: (captureId: string) => void;
  onRetry: (captureId: string) => void;
}

const statusSubtitle: Record<string, string> = {
  waiting: "Waiting for internet",
  processing: "Processing…",
  failed: "Couldn't process yet",
  zero_tasks: "No tasks detected",
};

export const CaptureProcessingCard: React.FC<CaptureProcessingCardProps> = ({
  capture,
  onDelete,
  onRetry,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  // Simulated playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      setIsPlaying(false);
      setPlayProgress(0);
    } else {
      setIsPlaying(true);
      setPlayProgress(0);
    }
  }, [isPlaying]);

  const subtitle = statusSubtitle[capture.status] || "";
  const isFailed = capture.status === "failed";
  const isProcessing = capture.status === "processing";
  const timeLabel = format(capture.capturedAt, "h:mm a");

  return (
    <div className="w-full text-left p-4 bg-card rounded-2xl border shadow-sm transition-all duration-500">
      {/* Top row: icon + title */}
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Volume2 size={20} className="text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-card-foreground leading-snug">
            Voice capture · {timeLabel}
          </p>
          <span
            className={cn(
              "text-xs mt-1 block",
              isFailed ? "text-destructive" : "text-muted-foreground",
              isProcessing && "animate-pulse"
            )}
          >
            {subtitle}
          </span>
        </div>
      </div>

      {/* Audio progress bar */}
      {isPlaying && (
        <div className="mt-3 px-8">
          <Progress value={playProgress} className="h-1" />
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center mt-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause recording" : "Play recording"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>

          {isFailed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onRetry(capture.id)}
              aria-label="Retry processing"
            >
              <RotateCcw size={16} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(capture.id)}
            aria-label="Delete voice capture"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
