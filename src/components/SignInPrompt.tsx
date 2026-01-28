import React from "react";
import { X, Smartphone, Watch, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (provider: "apple" | "google") => void;
}

export const SignInPrompt: React.FC<SignInPromptProps> = ({
  isOpen,
  onClose,
  onSignIn,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl animate-fade-scale-in"
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Cloud size={32} className="text-primary" />
        </div>

        {/* Content */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Save this across devices
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-6">
          Sign in to keep your captures safe, sync across devices, and enable watch capture.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Cloud size={16} className="text-secondary-foreground" />
            </div>
            <span className="text-secondary-foreground">Sync across all your devices</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Watch size={16} className="text-secondary-foreground" />
            </div>
            <span className="text-secondary-foreground">Capture from Apple Watch</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Smartphone size={16} className="text-secondary-foreground" />
            </div>
            <span className="text-secondary-foreground">Never lose your captures</span>
          </div>
        </div>

        {/* Sign-in buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onSignIn("apple")}
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
            Continue with Apple
          </Button>
          
          <Button
            onClick={() => onSignIn("google")}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={onClose}
          className="w-full py-3 mt-4 text-muted-foreground text-sm font-medium"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
