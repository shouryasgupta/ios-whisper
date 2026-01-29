

# Clean, Minimal Task Tiles with Inline Actions

## Overview
Redesign the TaskCard component to include all essential actions directly on the tile without requiring users to tap into a detail dialog. The goal is a clean, minimal design that provides quick access to: play recording, set reminder, delete recording, delete task, and mark done.

---

## Design Approach

### Layout Structure
```text
+--------------------------------------------------+
|  [o] Task summary text here...                   |
|      Today, 2:00 PM                              |
|                                                  |
|  [Play] [Calendar] [Delete]              [Done]  |
+--------------------------------------------------+
```

**Key Design Decisions:**
- **Checkbox-style completion** - Circle on the left that fills with checkmark when tapped
- **Compact action bar** - Small icon buttons at the bottom of the card
- **No badge clutter** - Remove the "Action/Note/Draft" badges for cleaner look
- **Inline audio player** - Tapping play shows mini progress bar in place

---

## Component Changes

### 1. TaskCard Redesign
**What changes:**
- Add a completion circle/checkbox on the left side of the card
- Add a bottom action row with icon buttons:
  - **Play/Pause** - Inline audio playback with mini progress bar
  - **Calendar** - Opens date picker popover to set/update reminder
  - **Trash** - Delete options (recording only vs full task)
- Remove the kind badges (Action/Note/Draft) for cleaner look
- Make the whole card NOT clickable (no dialog needed)

**Action Icons:**
- Play icon (if has audio) - toggles to pause with progress
- Calendar icon - opens date picker popover
- Trash icon - opens small dropdown (Delete Recording / Delete Task)
- Checkmark circle - marks task complete

### 2. Add Context Methods
**New method in AppContext:**
- `updateTaskReminder(id: string, date: Date)` - Set specific reminder date
- `deleteRecording(id: string)` - Remove audio but keep task

### 3. HomeScreen Cleanup
- Remove TaskDetailSheet since actions are now inline
- Simplify the task list rendering

---

## UI/UX Details

### Completion Interaction
- Left side: Empty circle outline
- Tap to complete: Circle fills with checkmark, card fades slightly
- Completed tasks get strikethrough text and reduced opacity

### Audio Playback
- Default: Small play icon button
- While playing: Progress bar appears below summary, icon becomes pause
- Simulated 5-second playback

### Reminder Date Picker
- Tap calendar icon opens a Popover with Calendar component
- Quick options at top: "Tomorrow", "Next Week", "Clear"
- Full calendar picker below
- Selected date updates immediately

### Delete Actions
- Tap trash opens DropdownMenu:
  - "Delete Recording" (if has audio) - keeps task, removes audio indicator
  - "Delete Task" - removes entire task with brief confirmation

---

## Technical Implementation

### Files to Modify:
1. **src/components/TaskCard.tsx** - Complete redesign with inline actions
2. **src/context/AppContext.tsx** - Add `updateTaskReminder` and `deleteRecording` methods
3. **src/screens/HomeScreen.tsx** - Remove TaskDetailSheet, simplify props

### Dependencies Used:
- Existing: Popover, DropdownMenu, Calendar, Button components
- Icons from lucide-react: Play, Pause, Calendar, Trash2, Check, Circle

---

## Visual Style
- Card padding reduced slightly for compactness
- Action icons are 16-18px, muted color by default, primary on hover
- Subtle divider or spacing between summary and action row
- Rounded icon buttons with ghost/subtle background on tap

