

## Switch post-capture toast from Radix Toast to Sonner

The current "Got it!" confirmation after saving a recording uses the Radix `toast()` from `use-toast`, which renders as a large notification-style banner sliding in from the top of the screen. The user wants a lighter, simpler in-app toast.

### Change

In `src/components/InlineVoiceCapture.tsx`:
- Replace `import { toast } from "@/hooks/use-toast"` with `import { toast } from "sonner"`
- Update the `handleStop` call from `toast({ title: "Got it!", description: "..." })` to `toast("Got it!", { description: "You don't need to remember this anymore." })`

This is a one-line import swap and one-line call change. Sonner is already mounted in `App.tsx` and provides the subtle bottom-positioned toast style the user expects.

No other files need to change.

