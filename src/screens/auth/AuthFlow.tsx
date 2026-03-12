import React, { useState } from "react";
import { AuthGateScreen } from "./AuthGateScreen";
import { EmailLoginScreen } from "./EmailLoginScreen";
import { EmailSignUpScreen } from "./EmailSignUpScreen";
import { PasswordlessScreen } from "./PasswordlessScreen";
import { AuthSuccessScreen } from "./AuthSuccessScreen";

type AuthScreen = "gate" | "login" | "signup" | "passwordless" | "success";

interface AuthFlowProps {
  onAuthenticated: (provider: "apple" | "google" | "email") => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthenticated }) => {
  const [screen, setScreen] = useState<AuthScreen>("gate");
  const [authProvider, setAuthProvider] = useState<"apple" | "google" | "email">("email");

  const handleMethodSelect = (method: "apple" | "google" | "email" | "passwordless") => {
    if (method === "apple" || method === "google") {
      setAuthProvider(method);
      setScreen("success");
    } else if (method === "passwordless") {
      setScreen("passwordless");
    } else {
      setScreen("login");
    }
  };

  const handleEmailAuth = (_email: string, _password: string) => {
    setAuthProvider("email");
    setScreen("success");
  };

  const handlePasswordlessVerified = (_email: string) => {
    setAuthProvider("email");
    setScreen("success");
  };

  const handleSuccessComplete = () => {
    onAuthenticated(authProvider);
  };

  switch (screen) {
    case "gate":
      return <AuthGateScreen onSelectMethod={handleMethodSelect} />;

    case "login":
      return (
        <EmailLoginScreen
          onBack={() => setScreen("gate")}
          onLogin={handleEmailAuth}
          onForgotPassword={() => {/* TODO */}}
          onSwitchToSignUp={() => setScreen("signup")}
          onSwitchToPasswordless={() => setScreen("passwordless")}
        />
      );

    case "signup":
      return (
        <EmailSignUpScreen
          onBack={() => setScreen("gate")}
          onSignUp={handleEmailAuth}
          onSwitchToLogin={() => setScreen("login")}
        />
      );

    case "passwordless":
      return (
        <PasswordlessScreen
          onBack={() => setScreen("gate")}
          onVerified={handlePasswordlessVerified}
        />
      );

    case "success":
      return <AuthSuccessScreen onComplete={handleSuccessComplete} />;

    default:
      return null;
  }
};
