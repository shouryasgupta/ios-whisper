# iOS Whisper — Mobile Architecture Plan

## Core Product Model

Voice-first task capture where:
- A single voice recording can produce **multiple tasks**
- Tasks appear in a **flat list UI** — recordings are not displayed as parent objects
- Tasks reference a recording; multiple tasks may share the same recording
- Playback from any related task plays the same recording

---

## Data Model

### Table: `captures`

Stores the recording itself.

```sql
CREATE TABLE captures (
  id TEXT PRIMARY KEY,
  local_file_uri TEXT NOT NULL,
  duration_ms INTEGER,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'local_only',
  transcript TEXT NULL
);
```

**Status values:** `local_only` → `queued` → `uploading` → `uploaded` → `processed` | `failed`

### Table: `tasks`

Stores all visible tasks (flat list).

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  system_title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER NULL,
  capture_id TEXT NULL REFERENCES captures(id),
  segment_start_ms INTEGER NULL,
  segment_end_ms INTEGER NULL,
  reminder_type TEXT NOT NULL DEFAULT 'anytime',
  reminder_date INTEGER NULL
);
```

- `capture_id` links tasks to the recording they came from.
- `segment_start_ms` / `segment_end_ms` reserved for future audio segmentation — NULL in MVP.

### Table: `outbox_jobs`

Tracks offline sync operations.

```sql
CREATE TABLE outbox_jobs (
  id TEXT PRIMARY KEY,
  capture_id TEXT NOT NULL REFERENCES captures(id),
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at INTEGER,
  last_error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

**Job types:** `UPLOAD_CAPTURE`, `FETCH_PROCESSING_RESULT`
**Status values:** `pending`, `uploading`, `succeeded`, `failed`

### Entity Relationships

```
captures 1 ──< tasks        (one capture → many tasks)
captures 1 ──< outbox_jobs  (one capture → many jobs)
```

---

## Offline Behavior

### Recording Flow (offline)

1. Save recording locally via expo-av + expo-file-system → `captures/{capture_id}.m4a`
2. Insert `captures` row with status `local_only`
3. Add `outbox_jobs` row for `UPLOAD_CAPTURE`
4. Show a **processing row** in the task list UI (not editable):

```
Voice capture · 11:22 PM
Waiting for internet
▶ Play recording
```

5. When processing finishes → remove processing row → insert extracted tasks

### State Transition: Capture Lifecycle

```
local_only → queued → uploading → uploaded → processed
                                           ↘ failed (retry)
```

---

## Online Processing Flow

When network is available:

1. Upload capture audio
2. Server performs transcription + task extraction
3. Server returns: `{ transcript, tasks: [{ system_title, reminder_date?, order }] }`
4. Client:
   - Stores `transcript` in `captures.transcript`
   - Creates `tasks` rows with `capture_id` set
   - Removes the processing row from UI

---

## Task Playback Rules

- Tasks with `capture_id` display a playback icon
- Tap → play recording from the beginning (MVP — no segment seeking)
- Only one recording plays at a time; starting playback stops any active recording
- **First playback hint** (once per capture): _"Playing the original recording this task came from."_

---

## Deletion Rules

### Deleting a task

1. Delete the task row
2. Check `COUNT(tasks WHERE capture_id = X)`
3. If zero remaining: delete capture row, audio file, and related outbox jobs

### Deleting a pending capture (processing row)

Delete: capture row + audio file + outbox jobs

### Completed tasks

Retain their recording. Audio is removed only when the **last referencing task** is deleted.

---

## Audio File Lifecycle

- Stored locally: `captures/{capture_id}.m4a`
- Deleted when capture is deleted (see deletion rules above)

---

## Sync Strategy

Strictly **offline-first**. Retries occur on:
- App launch
- App enters foreground
- Network reconnects

No background sync required.

---

## State Management

| Layer | Purpose |
|---|---|
| **SQLite** | Source of truth for captures, tasks, outbox |
| **Zustand** | Ephemeral UI state: `activeTab`, `isRecording`, `audioPlaybackState`, `nudgeDismissals` |
| **AsyncStorage** | Theme preference, nudge cooldowns |
| **expo-secure-store** | Authentication tokens |

---

## UI Model Summary

- Task list is **flat** — no capture grouping
- Pending recordings appear as a **temporary processing row**
- Once processing finishes: processing row disappears → extracted tasks appear
- Tasks with `reminder_type = 'anytime'` appear in **Today** category
- Categories: Overdue / Today / Upcoming / Saved

### UI State: Processing → Tasks

```
[Recording saved] → [Processing row visible] → [Server returns tasks] → [Processing row removed, tasks inserted]
```

---

## Future Improvements (Not MVP)

Intentionally deferred but architecture must remain compatible:

- Audio segment playback per task (`segment_start_ms` / `segment_end_ms`)
- On-device STT
- Capture grouping UI
- Editing system titles
- Transcript view

---

## Implementation Gates

### Gate 1–3: ✅ Completed
- Voice capture UI with pause/resume/cancel
- Task list with categories (Overdue/Today/Upcoming)
- Inline task management (completion, deletion, reminders)
- Nudge engine (sign-in, watch-setup, watch-usage)
- Settings screen with dark mode and privacy controls

### Gate 4: Local Data Layer
- Set up SQLite schema (captures, tasks, outbox_jobs)
- Implement repository pattern for CRUD operations
- Migrate from in-memory state to SQLite-backed state
- Wire Zustand stores for ephemeral UI state only

### Gate 5: Recording & Local Persistence
- Integrate expo-av for real recording
- Save audio files to `captures/{id}.m4a`
- Insert capture + outbox job on recording save
- Display processing row for pending captures

### Gate 6: Online Sync & Processing
- Implement outbox processor (upload on launch/foreground/reconnect)
- Upload capture → receive transcript + tasks
- Insert tasks, update capture status, remove processing row
- Retry logic with exponential backoff

### Gate 7: Playback & Deletion
- Task-level playback (tap icon → play capture audio)
- Single-playback constraint (stop any active before starting new)
- First-playback hint (once per capture)
- Cascade deletion rules (last task → delete capture + file)

### Gate 8: Auth & Cloud Sync
- Sign-in flow (Apple/Google)
- Token storage via expo-secure-store
- Server-side user association for captures/tasks
