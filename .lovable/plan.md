

## Multi-task capture: flat list with link badge

### Overview
When a single voice capture produces multiple tasks, each task appears independently in the flat task list (maintaining the current simple layout). A small visual badge on each task indicates it belongs to a capture group, and tapping it reveals the sibling tasks from the same recording.

### Data model changes

**`src/types/task.ts`** — Add an optional `captureGroupId` field to the `Task` interface:
```ts
captureGroupId?: string; // shared UUID across tasks from the same capture
```

Update `generateMockTask` to accept an optional `captureGroupId` parameter and pass it through.

### Context / state changes

**`src/context/AppContext.tsx`** — Update `addTask` to support batch creation:
- Add a new method `addTasks(texts: string[], hasAudio?: boolean)` that generates a shared `captureGroupId` (single `crypto.randomUUID()`), creates a task for each text with that group ID, and prepends them all at once.
- Keep the existing single `addTask` unchanged (no group ID) for typed entries.

### UI changes

**`src/components/TaskCard.tsx`** — When `task.captureGroupId` is present:
- Show a small pill/badge (e.g., a `Link2` or `Layers` icon from lucide + count) below the reminder text, like: `[icon] 3 from same capture`
- Tapping the badge scrolls to / highlights sibling tasks (simplest v1: open a small popover listing sibling summaries, each clickable to scroll into view).

**`src/screens/HomeScreen.tsx`** — Pass the full task list (or a lookup map of `captureGroupId → Task[]`) down to `TaskCard` so it can resolve siblings. Alternatively, expose a `getTasksByGroup(groupId)` helper from context.

### Voice capture integration

**`src/components/InlineVoiceCapture.tsx`** — For now, `onCapture` still produces a single text string. The multi-task splitting logic (detecting multiple intents in one transcription) would be handled upstream when real AI parsing is added. For demo/mock purposes, we can simulate it by splitting on sentences or semicolons when the transcription contains multiple distinct items.

### Files changed
| File | Change |
|------|--------|
| `src/types/task.ts` | Add `captureGroupId?` to `Task`, update `generateMockTask` |
| `src/context/AppContext.tsx` | Add `addTasks` batch method with shared group ID |
| `src/components/TaskCard.tsx` | Render link badge when `captureGroupId` exists, show sibling popover |
| `src/screens/HomeScreen.tsx` | Pass group lookup data to TaskCard |
| `src/components/InlineVoiceCapture.tsx` | Simulate multi-task split for demo |

