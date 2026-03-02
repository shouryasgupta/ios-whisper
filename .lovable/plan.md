

## Replace keyboard icon with a subtle "Type" pill

### Change

**`src/components/InlineVoiceCapture.tsx`** - In the idle state, replace the bare `<Keyboard size={14} />` button with a small rounded pill/chip that contains the keyboard icon and the word "Type". Styling: `bg-secondary/60 text-muted-foreground text-[11px] px-3 py-1 rounded-full` with the existing hover transition. This gives it a recognizable shape and label without competing with the mic button.

```text
      [ Mic Button ]
  "Buy diapers tomorrow"
     [ icon  Type ]        <-- subtle pill
```

