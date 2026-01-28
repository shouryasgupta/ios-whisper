import React from "react";
import { useApp } from "@/context/AppContext";
import { Watch, Mic, Cloud, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WatchScreenProps {
  onSignIn: () => void;
}

export const WatchScreen: React.FC<WatchScreenProps> = ({ onSignIn }) => {
  const { user } = useApp();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center pb-20">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-8">
          <Watch size={48} className="text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">Capture from your wrist</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to enable Apple Watch capture. Record tasks directly from your watch, even without your phone nearby.
        </p>

        <div className="space-y-4 w-full max-w-xs mb-8">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mic size={20} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Tap and speak on your watch</p>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Cloud size={20} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Syncs automatically to your phone</p>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Works offline - syncs when connected</p>
          </div>
        </div>

        <Button onClick={onSignIn} className="w-full max-w-xs h-12 rounded-xl">
          Sign in to enable
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg safe-area-top">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold">Watch</h1>
        </div>
      </header>

      <main className="px-5">
        {/* Watch Status */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <Watch size={28} className="text-success" />
            </div>
            <div>
              <h2 className="font-semibold">Watch Capture Enabled</h2>
              <p className="text-sm text-success">Connected and syncing</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            You can now capture tasks directly from your Apple Watch. Just tap the Handled complication and speak.
          </p>
        </div>

        {/* Outbox simulation */}
        <div className="bg-secondary rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud size={20} className="text-muted-foreground" />
              <span className="text-sm font-medium">Outbox</span>
            </div>
            <span className="text-sm text-muted-foreground">All synced ✓</span>
          </div>
        </div>

        {/* Watch mockup */}
        <div className="flex flex-col items-center py-8">
          <div className="relative w-40 h-48 bg-foreground rounded-[2.5rem] p-2 shadow-xl">
            <div className="w-full h-full bg-card rounded-[2rem] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary mb-3 flex items-center justify-center">
                <Mic size={24} className="text-primary-foreground" />
              </div>
              <p className="text-xs font-medium">Tap to capture</p>
            </div>
            {/* Crown */}
            <div className="absolute right-[-6px] top-[30%] w-2 h-6 bg-foreground rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Apple Watch preview
          </p>
        </div>
      </main>
    </div>
  );
};
