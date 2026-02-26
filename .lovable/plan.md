
## Refine Sign-In Nudge Copy

Update the sign-in nudge description in `NudgeCard.tsx` to use two balanced sentences instead of the current single sentence with a line break.

**Change in `src/components/NudgeCard.tsx`:**
- Current: `"Sign in to keep your captures across devices\nand capture hands-free from your watch."`
- New: `"Keep your captures across devices.\nCapture hands-free from your watch."`

This removes the redundant "Sign in" from the body (since the CTA button already says "Sign in") and creates two clean, balanced benefit statements. The existing `whitespace-pre-line` class will handle the line break naturally.
