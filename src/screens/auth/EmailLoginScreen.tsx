import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailLoginScreenProps {
  onBack: () => void;
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onSwitchToSignUp: () => void;
  onSwitchToPasswordless: () => void;
}

export const EmailLoginScreen: React.FC<EmailLoginScreenProps> = ({
  onBack,
  onLogin,
  onForgotPassword,
  onSwitchToSignUp,
  onSwitchToPasswordless,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.includes("@") && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    onLogin(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-8">Sign in to access your captures</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</label>
            <Input
              id="login-email"
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
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-primary font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-0 text-[15px] pr-12 placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
                autoComplete="current-password"
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
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full h-12 rounded-xl font-medium text-[15px] mt-2"
          >
            {isLoading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">Don't have an account? </span>
          <button onClick={onSwitchToSignUp} className="text-sm text-primary font-medium">
            Create one
          </button>
        </div>

        <button
          onClick={onSwitchToPasswordless}
          className="w-full mt-4 text-xs text-muted-foreground/70 text-center"
        >
          Sign in with a code instead
        </button>
      </div>
    </div>
  );
};
