

## Clean up "Type instead" trigger

Remove the "or type it" text label, keeping only the keyboard icon as the tap target. This maintains discoverability while reducing visual clutter below the mic button.

### Change

**`src/components/InlineVoiceCapture.tsx`** - In the idle state, replace the current button content (icon + "or type it" text) with just the `Keyboard` icon. Keep the same click handler and styling, just drop the `<span>or type it</span>`.

