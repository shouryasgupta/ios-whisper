import React from "react";
import { Watch, Grid3X3, Smartphone, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface WatchSetupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    icon: <Smartphone size={22} className="text-primary" />,
    title: "Open Watch app on your iPhone",
    description: "Go to the Watch app, then tap My Watch → Complications.",
  },
  {
    icon: <Grid3X3 size={22} className="text-primary" />,
    title: "Choose a complication slot",
    description: "Pick any complication position on your watch face.",
  },
  {
    icon: <Watch size={22} className="text-primary" />,
    title: "Select Handled",
    description: "Scroll down and tap Handled. Tap to capture from your wrist.",
  },
];

export const WatchSetupSheet: React.FC<WatchSetupSheetProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-10">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Watch size={32} className="text-primary" />
            </div>
          </div>
          <SheetTitle className="text-center text-xl">
            Set up Apple Watch capture
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-center">
            Add the Handled complication to your watch face in 3 steps.
          </p>
        </SheetHeader>

        <ol className="space-y-5 mb-8">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {step.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium leading-snug">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="bg-secondary rounded-2xl px-4 py-3 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Once set up, tap the complication on your watch and speak. Your capture syncs automatically.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
