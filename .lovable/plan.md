

## Remove Line Break from Sign-In Nudge

Remove the `\n` line break from the sign-in nudge description so the two sentences flow naturally as a single paragraph:

**Change in `src/components/NudgeCard.tsx`:**
- Current: `"Keep your captures across devices.\nCapture hands-free from your watch."`
- New: `"Keep your captures across devices. Capture hands-free from your watch."`

The two sentences will wrap naturally based on card width, feeling more like calm body copy rather than a list.

