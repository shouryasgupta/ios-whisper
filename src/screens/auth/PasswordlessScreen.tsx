import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "email" | "code";

interface PasswordlessScreenProps {
  onBack: () => void;
  onVerified: (email: string) => void;
}

export const PasswordlessScreen: React.FC<PasswordlessScreenProps> = ({
  onBack,
  onVerified,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isEmailValid = email.includes("@");

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isEmailValid) return;
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSending(false);
    setStep("code");
    setResendCooldown(30);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 800));
    onVerified(email);
    setIsVerifying(false);
  };

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isVerifying) {
      handleVerify();
    }
  }, [code]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsSending(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSending(false);
    setResendCooldown(30);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <div className="px-5 pt-4 safe-area-top">
        <button
          onClick={step === "code" ? () => { setStep("email"); setCode(""); } : onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      </div>

      <div className="flex-1 px-8 pt-8">
        {step === "email" ? (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Sign in with a code</h1>
            <p className="text-sm text-muted-foreground mb-8">
              We'll send a verification code to your email
            </p>

            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="pl-email" className="text-sm font-medium text-foreground">Email</label>
                <Input
                  id="pl-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/50 border-0 text-[15px] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={!isEmailValid || isSending}
                className="w-full h-12 rounded-xl font-medium text-[15px]"
              >
                {isSending ? "Sending…" : "Send code"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-1">Check your email</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Enter the 6-digit code sent to <span className="text-foreground font-medium">{email}</span>
            </p>

            <div className="flex justify-center mb-8">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-14 rounded-xl border-border bg-secondary/50 text-lg font-semibold"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {isVerifying && (
              <p className="text-sm text-muted-foreground text-center mb-4">Verifying…</p>
            )}

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Didn't get a code? </span>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-sm text-primary font-medium disabled:text-muted-foreground/50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
