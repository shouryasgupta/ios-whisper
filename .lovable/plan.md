

## Add "Type instead" option to the capture area

### Overview
Add a subtle keyboard/type option below the mic button so users who can't speak can type their task instead. The mic remains the primary CTA; the type option is secondary and unobtrusive.

### UX Design
- In the **idle state**, add a small text link below the revolving suggestions: "or type it" (with a keyboard icon)
- Tapping it replaces the mic button area with a **text input + submit** flow:
  - An auto-focused textarea with placeholder "What do you need to remember?"
  - A row with a "Cancel" text button and a primary "Save" button
- On save, the task is created the same way as voice, but with `hasAudio: false`
- On cancel, return to the mic idle state

### Technical Changes

**1. `src/types/task.ts`** - New helper for typed tasks
- Add a `generateTypedTask` function (or add an optional `hasAudio` param to `generateMockTask`) that creates a task with `hasAudio: false` instead of `true`

**2. `src/components/InlineVoiceCapture.tsx`** - Main changes
- Add a `"typing"` value to the `RecordingState` type (rename to `CaptureState`)
- Import `Keyboard` icon from lucide and `Textarea` component
- Add state for typed text (`typedText`)
- In the idle state, add a "or type it" link below the suggestion text
- Add a new **typing state** render block:
  - Auto-focused textarea
  - Cancel + Save buttons (Save disabled when empty)
- On save: call `onCapture` with the typed text, but also pass a flag or use a separate callback so the task is created with `hasAudio: false`

**3. `src/components/InlineVoiceCapture.tsx`** - Callback change
- Update the `onCapture` prop to accept an optional second argument for whether it has audio, OR change the prop to `onCapture: (text: string, hasAudio?: boolean) => void`
- Voice capture calls `onCapture(text, true)`, typed capture calls `onCapture(text, false)`

**4. `src/context/AppContext.tsx`** - Update `addTask`
- Change `addTask` to accept `(text: string, hasAudio?: boolean)` 
- Pass `hasAudio` through to the task generator

**5. `src/types/task.ts`** - Update `generateMockTask`
- Add optional `hasAudio` parameter (default `true`) to `generateMockTask`
- Use it in the returned task object

### Visual Layout (idle state)
```text
       [ Mic Button ]
  "Buy diapers tomorrow"
      Keyboard  or type
```

### Visual Layout (typing state)
```text
  +----------------------------+
  | What do you need to        |
  | remember?                  |
  +----------------------------+
     Cancel            [Save]
```

The typing state replaces the mic and suggestions entirely, keeping the area compact and focused.
