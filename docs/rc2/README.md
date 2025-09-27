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
- **Filter chips expanded**: Richer static chip set added to footer bar (abstract, floral, technology, nature, minimalist, surreal, summer) for parity with card tags.
- **Focus return & accessibility**: Dialog close restores trigger focus; toasts use polite vs assertive roles; length hints escalate politely → assertive only when breaching hard limit.

## 4. File Map
| File | Role |
|------|------|
| `index.html` | Canonical markup (flying header/footer, gallery, form, dialogs, portal root). |
| `style.css` | Token layers, layout primitives, parallax container styling, dialogs, chips, toasts. |
| `app.js` | Parallax engine, scroll lock manager, dialog manager (minimal), toast system, length hint logic, progress demo, nav accent, art mode toggle. |
| `IMPLEMENTATION_GUIDE.md` | Lower‑level specification (mechanics + constraints). |
| `README.md` | High‑level narrative & migration guidance (this doc). |

## 5. Design Token Model
Two strata:
1. **Master tokens** (`--color-master-*`): Theme seeds (never referenced in component selectors directly).
2. **Semantic tokens** (e.g. `--color-bg`, `--color-surface`, `--shadow-1`): Consumed by components & utilities. Changing master values reflows palette relationships via `color-mix()`.

This mirrors how a design system would map raw palette → semantic usage before component scoping (ideal for later CSS Modules or CSS‑in‑JS extraction).

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
- Events dispatched (`dialog:open`, `dialog:close`) enable accent recalculation.
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
Footer's filter bar temporarily swaps for a progress variant (simulated generation) using an animated fill (`--progress`). Provides blueprint for later real async integration.

## 13. Global API Surface (Temporary)
```js
window.parallax   // { freeze, resume }
window.scrollLock // { lock, unlock, isLocked }
window.dialogs    // { open(id), close() }
window.flyNotify  // alias toast()
window.UI         // Aggregated handle (debug only)
```
All will be replaced by modular imports / providers in a framework migration.

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
| Gallery data | Replace static `<li>` cards with `.map()` over fetched or prop data. |

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

## 20. Quick Start (Viewing Locally)
Simply open `index.html` in a browser. No build step or dependencies. (When migrating, create a Next.js page that imports card data + replicates `fly` layout.)
