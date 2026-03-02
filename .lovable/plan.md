

## Remove X Dismiss Button from Sign-In and Watch-Setup Nudges

The sign-in and watch-setup nudges already have a "Not now" button that dismisses them, making the X button in the top-right redundant. Removing it will declutter the card and reinforce the calm, minimal tone.

**Change in `src/components/NudgeCard.tsx`:**

- Hide the X dismiss button when the nudge is `sign-in` or `watch-setup` (since those already show "Not now")
- Keep the X button for other nudge types (`watch-usage`, `power`) that don't have a "Not now" option
- Remove the now-unnecessary header row (`flex justify-between` wrapper) for those nudges, since there's no label or X to display -- this eliminates the empty space at the top of the card
- The top accent line and padding remain intact

The result: the sign-in and watch-setup cards will just show description text, the CTA button, and "Not now" -- nothing else. Clean and confident.

