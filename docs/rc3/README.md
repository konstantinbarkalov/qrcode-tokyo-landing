# Gallery Prototype – Modern Standard (Refactored 2025)

**Status: Design / behavior reference. Not a production app.**

## 1. Purpose
Provide a clean, minimal, implementation‑oriented blueprint that:
- Preserves original visual layout 1:1 with less DOM & simpler CSS.
- Demonstrates canonical solutions for scroll lock + parallax + overlays without legacy hacks (no body fixed virtualization, no wrapper host, no synthetic backdrop nodes).
- Exposes very small global APIs to ease later modularization.
- Acts as a teaching artifact for how to break the original monolithic behavior into composable future modules.

## 2. What This Is / Is Not
| This Is | This Is Not |
|---------|-------------|
| A reference implementation | A production service |
| A migration starting point | Performance‑tuned code |
| A semantic & accessible markup model | A data‑driven dynamic gallery |
| A tokenized design surface | A fully themed multi‑brand system |
| A demonstration of interaction primitives | A finalized component library |

## 3. Core Improvements vs Original Prototype
- **Native dialogs only**: Navigation sheet + info modal use plain `<dialog>` + `::backdrop`; removed custom backdrop `<div>` and stacking manager complexity.
- **Root scroll lock**: Single class `html.is-scroll-locked` plus scrollbar compensation variable `--scrollbar-comp`; no body `position:fixed` trick; parallax just freezes.
- **Parallax simplification**: Non‑linear translate with gamma curve; freeze/resume instead of virtual scroll injection.
- **DOM slimming**: Overlay/backdrop wrappers, duplicate containers, and legacy overlay manager removed.
- **Toast triggers**: Declarative `data-random-toast` attribute provides frictionless variant testing (dialog action + main Preview button).
- **Filter chips expanded**: Richer static chip set added to footer bar (abstract, floral, technology, nature, minimalist, surreal, summer) for parity with sheet tags.
- **Focus return & accessibility**: Dialog close restores trigger focus; toasts use polite vs assertive roles; length hints escalate politely → assertive only when breaching hard limit.

## 4. File Map
| File | Role |
|------|------|
| `index.html` | Canonical markup (flying header/footer, gallery, form, dialogs, portal root). |
| `style.css` | Token layers, layout/layout primitives, components, and a small `@layer mockup` for temporary placeholders. |
| `app.js` | Parallax engine, scroll lock manager, dialog manager (minimal), toast system, length hint logic, progress demo, nav selection state, art mode toggle. |
| `IMPLEMENTATION_GUIDE.md` | Lower‑level specification (mechanics + constraints). |
| `README.md` | High‑level narrative & migration guidance (this doc). |

## 5. Design Token Model
Two strata:
1. **Master tokens** (`--master--color-*`): Theme seeds (never referenced in component selectors directly).
2. **Semantic tokens** (e.g. `--color-bg`, `--color-surface`, `--shadow-1`): Consumed by components & utilities. Changing master values reflows palette relationships via `color-mix()`.

This mirrors how a design system would map raw palette → semantic usage before component scoping (ideal for later CSS Modules or CSS‑in‑JS extraction).

### 5.1 CSS layering (what matters)

- Order: `@layer reset, tokens, utilities, mockup;` with most app rules left unlayered (so they naturally sit above layers). This keeps tokens/utilities easy to override while leaving component/layout CSS straightforward.
- What’s special: `@layer mockup` contains throwaway placeholders only (e.g., `.sheet-scene-mockup`, `.toggle-mockup`, basic `.toggle*`). It isolates visual scaffolding so it can be removed in one go without touching real components.
- Production note: Delete the entire `@layer mockup { … }` block and the related placeholder markup in `index.html` during migration; replace with real components that consume the tokens/utilities.
 - Important: This layering isn’t a “best practice” to copy into the final app. It’s temporary scaffolding to make the current CSS easier to read, reason about, and later migrate to Next.js. Use whatever structure fits the target framework when implementing real components.

## 6. Flying Surfaces Pattern
```
.fly.fly--top   → parallax transform, sets --space-header
.fly.fly--bottom→ anchors footer & portal spacing via --space-footer
```
Each has:
- `.fly__measured` (height contributor)
- `.fly__extra` (non‑layout overlays: toasts)
JS measures these heights and writes `--space-header` / `--space-footer` so main content naturally offsets without hardcoded magic numbers.

## 7. Parallax
Configured via data attributes on `.fly--top`:
- `data-parallax-factor` (0–0.95)
- `data-parallax-gamma` (>=1)
- `data-parallax-identity-distance`
- (optional) `data-parallax-extra-offset`
Runtime calculates a non‑linear vertical translation; one rAF guarded pipeline; `parallax.freeze()` halts updates when modals open.

## 8. Scroll Lock
```
html.is-scroll-locked { overflow: hidden; padding-right: var(--scrollbar-comp); }
```
Lifecycle:
1. Measure scrollbar width (diff innerWidth vs clientWidth).
2. Set `--scrollbar-comp` if needed.
3. Add class & freeze parallax.
4. On unlock: remove class + variable; resume parallax.
Lock depth is reference‑counted so nested dialogs (future) stay safe.

## 9. Dialogs (Navigation Sheet + Modal)
- Pure `<dialog>` (side sheet styled via transform from left; modal centered).
- Minimal manager: open/close, focus-first, restore previous focus, integrates scroll lock.
- Events dispatched (`dialog:open`, `dialog:close`) remain available for downstream hooks (analytics, state sync, etc. if neeeded).
- No custom backdrop nodes; rely on `dialog::backdrop` styling.

## 10. Toast / Message System
Portal root: `<div id="portal-root" class="fly-messages">` inside bottom `.fly__extra` so it visually associates with the footer without shifting layout.

API (prototype global):
```js
toast({
  title: 'Saved',
  message: 'Operation complete',
  variant: 'success', // info | success | warn | error
  timeout: 5000,
});
```
## 11. Length Hint System
Applied to `.length-field` wrappers with `data-soft-limit` / `data-hard-limit`.
Behavior:
- Hidden until value length > soft.
- `is-soft` between limits; `is-hard` beyond hard.
- Live region escalates to assertive only when hard exceeded.
Goal: Encourage concise QR content (performance + aesthetics rationale embedded in copy).

## 12. Progress Demo
Footer's filter bar temporarily swaps for a progress variant (simulated generation) using an animated fill controlled by a contextual variable `--progress--ratio`. Provides blueprint for later real async integration.

## 13. Global API Surface (Temporary)
```js
window.parallax   // { freeze, resume }
window.scrollLock // { lock, unlock, isLocked }
window.dialogs    // { open(id), close() }
window.flyNotify  // alias toast()
window.UI         // Aggregated handle (debug only)
```
All will be replaced by modular imports / providers in a framework migration.

## 13.1 CSS Variable Naming Convention (Important)

Two categories of custom properties are used throughout the CSS:

1) Global/project tokens (no prefix, type-first)
- Form: `--type-name` (e.g., `--color-accent`, `--radius-m`, `--space-xl`, `--shadow-2`)
- Scope: defined at `:root`, broadly reused. These are semantic tokens built on top of master seeds (`--master--color-*`).

2) Contextual/component tokens (scoped via prefix)
- Form: `--prefix--type-name` (double dash separates the context prefix from the type block)
- Examples:
  - Buttons: `--btn--color-bg`, `--btn--color-border`, `--btn--color-text`, `--btn--bright`
  - Chips: `--chip--color-bg`, `--chip--color-border`, `--chip--color-text`
  - Fields: `--field--color-bg`, `--field--color-border`, `--field--color-text`, `--field--color-placeholder`
  - Length hint: `--length-hint--color-bg`, `--length-hint--color-border`
  - UI bar: `--ui-bar--tint`, `--ui-bar--color-bg`
  - Progress: `--progress--ratio` (progress state 0–1)
  - Toggle: `--toggle--size-track-w`, `--toggle--size-track-h`, `--toggle--space-pad`, `--toggle--size-thumb`, `--toggle--color-bg`, `--toggle--color-bg-on`, `--toggle--color-border`
  - Generation note block: `--generation-note--color-bg`, `--generation-note--color-border`, `--generation-note--color-accent`

Guidelines:
- Global tokens start with a type (color/space/size/radius/shadow/etc.) and have no context prefix.
- Contextual tokens start with a prefix naming the owning component/feature, followed by `--`, then a type-first name.
- Prefer semantic globals over raw master seeds in component rules.
- When adding a new component, introduce a small set of contextual vars under its own prefix rather than inventing one-off globals.

## 14. Migration Guidance (Next.js / React)
| Concern | Migration Strategy |
|---------|-------------------|
| Flying surfaces | Create `<FlySurface position="top|bottom">` that measures & sets context (React state or CSS vars). |
| Parallax | Hook: `useParallaxHeader(ref, config)` attaching scroll listener client-side. |
| Scroll lock | Context provider with depth counter; expose `useScrollLock()`. |
| Dialogs | Wrap native dialog in controlled component; fire `useEffect` to lock/unlock. |
| Toasts | `<ToastProvider portalId="portal-root" />` with context + reducer; map old API to a hook. |
| Tokens | Export JS token map; emit CSS vars at root via `<ThemeProvider/>`. |
| Chips / filters | Convert static chips to dynamic list; manage active state via component state. |
| Gallery data | Replace static `<li>` sheets with `.map()` over fetched or prop data. |

## 15. Accessibility Summary
- Dialogs: labeled headings, restore focus, Esc closes, backdrop focus not trapped erroneously.
- Toasts: polite vs assertive; dismiss button always present; off‑screen removal after animation.
- Form hints: live region only visible post‑threshold.
- Keyboard: All interactive elements are focusable and order follows visual structure.

## 16. Extensibility Hooks
Future additions should:
- Add new floating toolbars by replicating `.fly` pattern (or component abstraction) without custom offsets.
- Reuse scroll lock manager (or provider) for any new blocking UI (multi-step wizard, etc.).
- Keep new notifications funneling through a single toast provider to preserve stacking & focus hygiene.

## 17. Random Toast Trigger Pattern
Declarative approach reduces JS glue:
```
<button data-random-toast>Preview</button>
```
Delegated listener finds the attribute, samples variant, and calls `toast()`. Add to any future surface without new wiring.

## 18. Anti‑Patterns Avoided
- Body fixed virtualization for scroll freeze.
- Manually reimplemented dialog focus traps (native suffices here).
- Direct consumption of master tokens in component selectors.
- Per‑frame measurements inside the scroll loop (only transform application scheduled).
- Duplicate backdrop DOM nodes.

## 19. Deferred Scope (Finalization Phase)
To keep this prototype clean and focused on core layout/behavior, the following are intentionally out of scope and will be layered on during the final polish after migrating to Next.js:
- Motion preference support: `@media (prefers-reduced-motion: reduce)` (we’ll add reduced-motion styles and transition fallbacks in the Next.js phase).
- Dark theme: system/theme toggle, and dark semantic token set.

The current goal is lean, readable CSS that implements everything needed functionally and visually for the light theme.

## 20. Quick Start (Viewing Locally)
Simply open `index.html` in a browser. No build step or dependencies.