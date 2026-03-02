

## Fix typing mode layout

### Problem
The textarea is centered with side padding (`px-1`, `items-center`), but Cancel and Save are spread to the edges with `justify-between`, creating a mismatched, awkward feel.

### Solution
Tighten the layout so the textarea and action row feel like a cohesive unit:

1. Remove `items-center` from the typing container -- let children stretch to full width naturally
2. Right-align the actions: place Cancel as a ghost text button and Save as a small pill, both on the right side in a row with `gap-3` and `justify-end`
3. Add consistent horizontal padding (`px-4`) to match the rest of the header area

The result is a compact, messenger-style input block:

```text
+------------------------------------+
| What's on your mind?               |
|                                    |
+------------------------------------+
                     Cancel    [Save]
```

### File changed
**`src/components/InlineVoiceCapture.tsx`** -- typing state return block (lines 151-183): update container classes and action row alignment.

