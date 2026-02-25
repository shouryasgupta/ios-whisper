

## Nudge and Activation System Overhaul

This plan aligns the codebase with the PRD's unified nudge system: priority-based, cooldown-aware, single-nudge-at-a-time logic replacing the current dual-component approach.

---

### What Changes

**1. Unified Nudge State in AppContext**

Replace the current fragmented nudge tracking (`watchNudgeDismissCount`, `watchAdoptionDismissed`, `showSignInPrompt`) with a centralized nudge engine:

- Add an `ActivationState` enum: `New_NoCapture`, `Anonymous_Active`, `SignedIn_NoWatch`, `WatchEnabled_Inactive`, `WatchActive`, `Power_User`
- Track dismiss counts and last-shown timestamps per nudge type (sign-in, watch-setup, watch-usage, power)
- Add a `isRecording` flag to suppress nudges during capture
- Implement `getPrimaryNudge()` function with priority: Sign-In > Watch Setup > Watch Usage > Power Features
- Change sign-in nudge trigger from `captureCount >= 2` to `captureCount >= 3` per PRD

**2. Replace WatchNudgeBanner + WatchAdoptionCard with Single NudgeCard**

Delete both components and create one `NudgeCard` component that renders based on `getPrimaryNudge()`:

- **Sign-In nudge**: shown when `!signedIn && captures >= 3`, copy: "Save across devices. Sign in to sync and unlock watch capture setup."
- **Watch Setup nudge**: shown when `signedIn && !watchEnabled`, copy: "Capture without your phone. Set up watch capture."
- **Watch Usage nudge**: shown when `watchEnabled && watchCaptures < 2`, copy as contextual reminder
- Only one nudge visible at a time (higher priority suppresses lower)

**3. Post-Sign-In Bridge**

After a user signs in (from the sign-in nudge specifically), show a bridge screen/sheet: "You're signed in. Want to set up hands-free capture?" with "Set Up Now" and "Later" CTAs. Not shown for organic sign-ins (e.g., from Settings).

- Add `signInSource` tracking to distinguish nudge-triggered vs organic sign-ins
- Create a `PostSignInBridge` component (small sheet or inline card)

**4. Cooldown and Suppression Rules**

Add timestamp-based cooldown logic to AppContext:

- Sign-In: 7-day cooldown, 30-day suppression after 2 dismissals
- Watch Setup: 3-day (72hr) cooldown, 14-day suppression after 2 dismissals
- Watch Usage: 3-day cooldown, 14-day suppression after ignored
- Power: 14-day cooldown, permanent after dismissal

Since this is a prototype without persistence, cooldowns will use in-memory timestamps (reset on refresh), but the logic structure will be production-ready.

**5. Guardrails**

- Add `isRecording` state to context (set true during voice capture, false after)
- `NudgeCard` returns null when `isRecording` is true
- No blocking UI -- all nudges remain inline cards, never modals

**6. Settings Watch Status**

Update Settings screen to show four states per PRD:
- "No watch connected" (not signed in)
- "Setup required" (signed in, no watch)
- "Try watch capture" (watch enabled, inactive)
- "Active" with checkmark (watch active)

---

### Technical Details

**Files to create:**
- `src/components/NudgeCard.tsx` -- single unified nudge component

**Files to modify:**
- `src/context/AppContext.tsx` -- add nudge engine state, `getPrimaryNudge`, cooldown timestamps, `isRecording`, `signInSource`, activation state derivation
- `src/types/task.ts` -- add `NudgeType`, `ActivationState` types, `watchCaptures` to User
- `src/screens/HomeScreen.tsx` -- replace `WatchNudgeBanner` + `WatchAdoptionCard` with single `NudgeCard`
- `src/pages/Index.tsx` -- add post-sign-in bridge logic, pass `signInSource` tracking
- `src/components/InlineVoiceCapture.tsx` -- set `isRecording` flag during capture
- `src/screens/SettingsScreen.tsx` -- update watch status to 4-state display

**Files to delete:**
- `src/components/WatchNudgeBanner.tsx`
- `src/components/WatchAdoptionCard.tsx`

**No new dependencies required.**

