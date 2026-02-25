import React from "react";
import { Watch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PostSignInBridgeProps {
  open: boolean;
  onSetupWatch: () => void;
  onLater: () => void;
}

export const PostSignInBridge: React.FC<PostSignInBridgeProps> = ({
  open,
  onSetupWatch,
  onLater,
}) => {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onLater()}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-8">
        <SheetHeader className="items-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Watch size={28} className="text-primary" />
          </div>
          <SheetTitle className="text-lg text-center">
            You're signed in — want to go hands-free?
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Set up Apple Watch capture and never pull out your phone to remember something.
          </p>
        </SheetHeader>

        <div className="space-y-3 mt-4">
          <Button onClick={onSetupWatch} className="w-full h-12 rounded-xl text-sm gap-2">
            Set Up Now
            <ArrowRight size={16} />
          </Button>
          <Button
            onClick={onLater}
            variant="ghost"
            className="w-full h-10 rounded-xl text-sm text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
