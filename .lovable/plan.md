

## Mic-to-textfield morph transition

### Concept
Instead of an abrupt swap between idle and typing states, the mic button visually transforms into the textarea. This creates psychological continuity -- the user tapped the mic area and it "opened up" into a text field.

### How it works

Rather than conditionally rendering completely separate trees for idle vs typing, we render **both** in a single layout and use CSS transitions to morph between them:

1. **Shared container** with a fixed position stays mounted across states. Use `overflow-hidden` and animate `max-height` / `opacity` to smoothly expand.

2. **Mic circle shrinks and fades**: When entering typing mode, the mic button scales down (`scale-0 opacity-0`) with a 250ms ease-out transition.

3. **Textarea expands from the mic's position**: The textarea starts collapsed (`max-height: 0, opacity: 0`) and smoothly grows to full size (`max-height: 120px, opacity: 1`) over 300ms, creating the illusion the circle opened into a rectangle.

4. **Reverse on cancel**: When the user taps Cancel, the textarea collapses back down and the mic fades back in.

5. **Suggestion text and "Type instead" pill** fade out simultaneously with the mic shrink.

### Implementation

**`src/components/InlineVoiceCapture.tsx`**:
- Stop using early returns for idle vs typing. Instead, render a single wrapper that contains both the mic elements and the textarea elements, toggling visibility via CSS classes driven by `state`.
- Mic button and surrounding elements get: `transition-all duration-300` with conditional `scale-0 opacity-0 h-0` when `state === "typing"`.
- Textarea block gets: `transition-all duration-300 ease-out` with conditional `max-h-0 opacity-0 overflow-hidden` when idle, expanding to `max-h-[160px] opacity-100` when typing.
- The Cancel/Save row follows the textarea with the same opacity transition.

**`src/index.css`** (if needed):
- Add a small keyframe or transition utility if Tailwind's built-in transitions aren't sufficient, but the plan favors pure Tailwind classes to keep things simple.

### Visual sequence

```text
IDLE:                          TYPING (after 300ms):
                               
   ( Mic )     --scale down-->    (gone)
  [Type instead] --fade out-->    (gone)
  "suggestion"   --fade out-->    (gone)
                               +---------------------------+
               --expand up-->  | What's on your mind?      |
                               |                           |
                               +---------------------------+
                                          Cancel    [Save]
```

### Files changed
- **`src/components/InlineVoiceCapture.tsx`** -- Merge idle and typing returns into one block with CSS-driven morph transitions.
