import React from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthMethod = "apple" | "google" | "email" | "passwordless";

interface AuthGateScreenProps {
  onSelectMethod: (method: AuthMethod) => void;
}

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({ onSelectMethod }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Top section with breathing room */}
      <div className="flex-1 flex flex-col justify-end px-8 pb-8">
        {/* Subtle mic motif */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Mic size={24} className="text-primary" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight mb-3">
          Your captures,{"\n"}always safe
        </h1>

        {/* Benefit statements */}
        <div className="space-y-2.5 mb-2">
          <BenefitRow text="Synced across all your devices" />
          <BenefitRow text="Capture from your Apple Watch" />
          <BenefitRow text="Never lose a thought" />
        </div>
      </div>

      {/* Bottom section with auth options */}
      <div className="px-8 pb-10 safe-area-bottom space-y-3">
        {/* Apple */}
        <Button
          onClick={() => onSelectMethod("apple")}
          className="w-full h-[52px] rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-medium text-[15px] gap-2.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          Continue with Apple
        </Button>

        {/* Google */}
        <Button
          onClick={() => onSelectMethod("google")}
          variant="outline"
          className="w-full h-[52px] rounded-2xl font-medium text-[15px] gap-2.5 border-border"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        {/* Email divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email */}
        <Button
          onClick={() => onSelectMethod("email")}
          variant="ghost"
          className="w-full h-11 rounded-2xl text-[14px] text-muted-foreground hover:text-foreground"
        >
          Continue with email
        </Button>

        {/* Legal */}
        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed pt-1">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

const BenefitRow: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
    <span className="text-[15px] text-muted-foreground">{text}</span>
  </div>
);
