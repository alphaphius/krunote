# KruNote Design Contract

## Design read

Personal teacher operations PWA with a calm, trustworthy, data-dense Classroom Focus language.

## Dials

- Design variance: 3/10
- Motion intensity: 2/10
- Visual density: 8/10

## Impeccable lenses

- Setup and PIN: shape, onboard, clarify, adapt, harden, polish.
- Operational pages: layout, typeset, adapt, optimize, harden, polish.
- Settings: distill, clarify, adapt, harden.
- Release: audit, critique, optimize, polish.

## Typography

- One bilingual family: Noto Sans Thai.
- Self-hosted WOFF2 is preferred for release; system sans fallback is always present.
- Mobile body text is at least 16px with Thai-safe line height.
- Numbers use tabular figures.
- Text containers never use fixed heights.

## Three-layer tokens

### Primitive

- Cool neutral scale for surfaces and text.
- Teal scale for the one product accent.
- Amber, red, and green scales for semantic status only.
- Spacing follows 4px and 8px increments.

### Semantic

- `background`, `surface`, `surface-raised`, `text`, `text-muted`, `border`.
- `primary`, `on-primary`, `focus`, `success`, `warning`, `error`, `overlay`.

### Component

- Buttons, inputs, roster rows, state controls, dialogs, queue capsule, and navigation consume semantic tokens only.

## Shape and elevation

- Inputs and buttons: 10px radius.
- Panels and dialogs: 14px radius.
- Pills are reserved for compact status labels.
- Data rows use borders and spacing rather than card shadows.
- Shadows are limited to dialogs, menus, and the floating sync capsule.

## Interaction

- Minimum touch target: 44px.
- Attendance exposes `มา`, `สาย`, `ขาด`, `ลา` as labeled states.
- Submission exposes `ส่งแล้ว`, `ส่งช้า`, `ยังไม่ส่ง`, `ยกเว้น`.
- Score fields accept keyboard, numpad, Enter, arrow keys, and paste.
- Optimistic state appears immediately after encrypted outbox persistence.
- Save feedback is a non-blocking capsule near the bottom safe area.
- Motion is limited to 150-220ms state feedback and is disabled under reduced motion.

## Responsive contract

- Phone: roster cards with three quick controls; bottom navigation has five destinations.
- Tablet: compact roster table with room and assessment filters above.
- Desktop: stable data columns, sidebar navigation, and keyboard-first score entry.
- No horizontal page overflow. Only the desktop data table may have a labeled internal scroll fallback when required.
- Sticky controls reserve safe-area and content padding.

## Themes

- System, Light, Dark, and High Contrast.
- Theme applies before first paint.
- Theme, text size, and density are device-local and offline-capable.
- Status never relies on color alone.

## State coverage

- Setup, preparing, ready, incompatible API, and failed connection test.
- Incorrect PIN, cooldown, forced PIN replacement, expired session.
- Loading, empty, validation, success, recoverable error.
- Online, offline, queued, retrying, partial sync, conflict, failed.
- Export queued, running, ready, failed.
- Install available, update available, and installed PWA mode.

## Anti-references

- No oversized marketing typography in operational pages.
- No decorative gradients, glass panels, emoji icons, or motion for spectacle.
- No unlabeled icon-only navigation.
- No placeholder-only form labels.
- No generic spinner without task-specific progress copy.
