

# Handled – Voice-First Personal Assistant Prototype

## Overview
A **warm, friendly mobile-first web prototype** that simulates the complete Handled iOS app experience. The app lets busy parents and professionals capture tasks using voice, get timely reminders, and maintain an "external memory layer" for their busy lives.

**Core Promise:** *"Say it once. Don't think about it again."*

---

## Screens & Features

### 1. Onboarding & First Launch Experience
- **Capture-first home screen** with the headline "What do you want handled?" and subtext "Say it once. Don't think about it again."
- Large, prominent microphone button as the primary CTA
- No sign-in wall – users can start capturing immediately
- Subtle helper text: "Sign in later to sync across devices"

### 2. Voice Capture Flow (Simulated)
- **Tap-to-record interface** with animated recording indicator
- Visual waveform animation while "recording"
- 60-second timer countdown
- Cancel and stop recording buttons
- **Post-capture confirmation:** "Got it. You don't need to remember this anymore."
- Simulated transcription with realistic sample tasks (multi-language friendly)

### 3. Home Task List
- **TODAY section:** Items due today and recently captured
- **UPCOMING section:** Items scheduled for the next 7 days  
- **SAVED section:** Reference notes and drafts without reminders
- Each task card shows:
  - Summary text (1 line)
  - Time/date label or "Anytime"
  - Kind indicator chip (Action/Note/Draft)
  - 🔊 Audio playback icon
  - Checklist badge when applicable
  - Link icon for buy intents

### 4. Task Detail & Audio Playback
- Full task view with playback controls
- Simulated audio playback progress bar
- Option to edit reminder time
- "Mark as Done" and "Snooze" actions
- Delete task option with confirmation

### 5. Sign-In Prompt Modal (Value-Based)
- Triggered after first/second capture
- **Title:** "Save this across devices"
- **Body:** "Sign in to keep your captures safe, sync across devices, and enable watch capture."
- Simulated Apple/Google sign-in buttons
- "Not now" secondary option

### 6. Signed-In Home
- User avatar and account indicator
- "Watch capture enabled" status
- Cross-device sync visual indicator
- Same task list with synced data

### 7. Reminder Notification Simulation
- In-app notification banner/toast for due reminders
- **Actions:** Done | Snooze (15min, 1hr, Tomorrow, Pick time)
- Shows task summary and scheduled time

### 8. Assisted Buying Flow
- For buy intent captures, show external link generation
- "Shop on Amazon" or "Search on Google" buttons
- External link indicator on task cards

### 9. Settings Screen
- **Account section:** Profile info, sign out
- **Privacy controls:**
  - Delete a recording (keeps task)
  - Delete all recordings
  - Delete account (full data wipe)
- Clear deletion confirmation dialogs with proper copy
- App version and "30-day retention" policy info

### 10. Watch Capture Preview
- Mockup/preview of Apple Watch capture experience
- "Requires sign-in to enable" messaging for anonymous users
- Outbox status indicator ("2 captures waiting to sync")

---

## Design Style: Warm & Friendly
- **Soft, approachable color palette** – warm neutrals with a calming accent color (e.g., soft coral or warm teal)
- **Rounded corners** everywhere – cards, buttons, inputs
- **Comfortable typography** – friendly sans-serif fonts
- **Smooth animations** – fade-ins, gentle scaling, subtle bounces on interactions
- **iOS-inspired patterns** – bottom navigation, swipe gestures, sheet-style modals

---

## Visual Experience Highlights
- Large, tactile microphone button that pulses when pressed
- Reassuring confirmation animations after capture
- Empty states with friendly illustrations and encouraging copy
- Skeleton loading states for task list
- Haptic-style visual feedback on all tap interactions

