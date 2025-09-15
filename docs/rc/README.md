
# Gallery Static Prototype (2025 Refactor)

A modern, mobile-first static HTML+CSS prototype for a gallery UI. This version is a major refactor for simplicity, maintainability, and visual polish.

## Features
- **Fixed header and footer**: Both bars are always visible, centered, and share a unified layout and safe-area handling.
- **Modern, minimal markup**: No unnecessary wrappers; consistent, semantic structure.
- **Responsive card grid**: Gallery adapts to screen size, with cards for each item.
- **Filter bar**: Persistent at the bottom, with tag chips and aspect ratio selector.
- **Accessible**: Semantic HTML, focus styles, ARIA labels, and dark mode support.
- **No dependencies**: Pure HTML and CSS, no frameworks or build tools required.

## Usage
- Open `index.html` directly in your browser.
- All assets are local or inline (SVGs, icons).

## Structure
- `index.html` — Main markup, with header, card grid, and filter bar.
- `styles.css` — All layout, color, and component styles. Unified for header/footer.
- `icons/` — SVG icon files for UI.
- `app.js` — (Optional) Placeholder for interactivity.

## Notable Changes (2025)
- Header and filter-bar now share a single layout system and are both fixed (not sticky).
- Markup is flatter and more consistent; wrappers and redundant divs removed.
- CSS is refactored for clarity, with shared variables and modern features (e.g., `color-mix`, `env()` for safe-area).
- Visuals are more polished: glassmorphism, subtle gradients, and improved spacing.
- Accessibility improved: ARIA roles, visually hidden labels, and keyboard focus.

## For Next.js/React Migration
- Each major block (header, card list, filter bar) can be mapped to a component.
- Class names are stable and BEM-like for easy migration to CSS Modules.
- CSS variables can be moved to a global stylesheet.

## License
MIT. Use as a reference or starting point for your own gallery UIs.