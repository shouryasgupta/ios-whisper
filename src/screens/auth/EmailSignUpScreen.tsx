import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailSignUpScreenProps {
  onBack: () => void;
  onSignUp: (email: string, password: string) => void;
  onSwitchToLogin: () => void;
}

export const EmailSignUpScreen: React.FC<EmailSignUpScreenProps> = ({
  onBack,
  onSignUp,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.includes("@") && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onSignUp(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <div className="px-5 pt-4 safe-area-top">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      </div>

      <div className="flex-1 px-8 pt-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-8">Start capturing in seconds</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-secondary/50 border-0 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-0 text-[15px] pr-12 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full h-12 rounded-xl font-medium text-[15px] mt-2"
          >
            {isLoading ? "Creating account…" : "Get started"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">Already have an account? </span>
          <button onClick={onSwitchToLogin} className="text-sm text-primary font-medium">
            Sign in
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
