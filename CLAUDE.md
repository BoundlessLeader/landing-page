# CLAUDE.md (packages/landing)

## Scope

This file defines the working conventions for the active landing package. Follow this file for all changes in `packages/landing`.

## Dev Workflow

- `npm run dev` starts `python3 -m http.server 4173`.
- The site is static; browser refresh is manual (no hot reload).
- `npm run build` runs `mkdir -p dist && cp -R index.html guide.html css js assets dist/`.
- Build is copy-only; there is no transpilation or bundling step.
- If you add a new HTML page, update the `build` script in `package.json` to copy it into `dist/`.

## Design System (from `css/styles.css`)

### Fonts

- Google Fonts import:
  - Playfair Display (serif headings).
  - DM Sans (body and UI).
- Use Playfair Display for major headings and emphasis.
- Use DM Sans for body copy, labels, and utility text.

### Color Tokens (HSL custom properties)

- `--teal: hsl(180, 42%, 22%)`
- `--teal-light: hsl(178, 35%, 35%)`
- `--gold: hsl(38, 45%, 62%)`
- `--gold-light: hsl(38, 50%, 72%)`
- `--gold-dark: hsl(36, 40%, 48%)`
- `--ivory: hsl(40, 33%, 96%)`
- `--ivory-dark: hsl(40, 25%, 92%)`
- `--charcoal: hsl(200, 18%, 16%)`
- `--charcoal-light: hsl(200, 12%, 28%)`
- `--text-muted: hsl(200, 10%, 44%)`
- `--border: hsl(40, 20%, 85%)`

### Token Usage Rules

- Primary CTA styling uses gold (`.btn.btn-gold`).
- Secondary CTA styling uses teal (`.btn.btn-teal`).
- Light surfaces use ivory / ivory-dark.
- Dark emphasis sections use charcoal.
- Avoid ad-hoc colors unless explicitly approved.

### Utilities and Shared Classes

- `.eyebrow` for uppercase micro-headings.
- `.text-gradient-gold` for gold gradient text emphasis.
- `.fade-in` for enter-on-scroll elements.
- `.stagger-item` for repeated card/list items with staggered reveal.

### Buttons

- Primary CTA: `.btn.btn-gold`
- Secondary CTA: `.btn.btn-teal`
- Keep `.btn` base class present for spacing and hover transitions.

### Container and Breakpoint

- Container: `width: min(1400px, 100% - 4rem)`.
- Mobile container override at `max-width: 768px`: `width: min(1400px, 100% - 2rem)`.
- Global responsive breakpoint is `768px`.

### Section Background Pattern (current pages)

#### `index.html`

- `#hero`: image + charcoal overlay.
- `#problem`: `var(--ivory-dark)`.
- `#how-it-works`: `var(--ivory)`.
- `#why-boundless`: `var(--charcoal)`.
- `#practitioners`: `var(--ivory)`.
- `#social-proof`: `var(--ivory-dark)`.
- `#impact`: `var(--teal)`.
- `#final-cta`: `var(--charcoal)`.
- Footer: `var(--charcoal)`.

#### `guide.html`

- Hero: charcoal.
- Content sections alternate ivory and ivory-dark.
- Apply section + footer: charcoal.

## JavaScript Patterns (from `js/main.js`)

- IntersectionObserver targets `.fade-in, .stagger-item` and adds `.visible` when intersecting.
- Staggering uses index-based `transitionDelay` for `.stagger-item`.
- Parallax targets `.hero-bg img` and uses `#hero` measurements.
- Do not restructure `#hero` or remove `.hero-bg img` unless parallax logic is also updated.
- Nav scroll behavior adds/removes `.scrolled` on `.site-nav` at `window.scrollY > 40`.
- Mobile menu toggles `.open` on `.mobile-menu` and updates toggle button state.

## How To Add a New Section

1. Choose an id and placement that fits narrative flow in `index.html` or `guide.html`.
2. Add `<section id="...">` (or section class for guide pages) with `.section`, `.container`, and semantic heading/content tags.
3. Add `.fade-in` to standalone elements that should animate in.
4. For repeated cards/items, use `.stagger-item` on each repeated child.
5. Reuse existing CTA/button patterns (`.btn.btn-gold` or `.btn.btn-teal`).
6. Add corresponding CSS near related sections in `css/styles.css`.
7. If needed, add responsive rules only inside the single bottom `@media (max-width: 768px)` block.
8. Verify scroll behavior and animation sequencing in browser.

## How To Add a New Page

1. Copy `guide.html` as the template for new secondary pages (simpler and more maintainable than `index.html`).
2. Update page-specific metadata (`<title>`, description, OG/Twitter tags, canonical).
3. Keep nav and footer structure consistent with existing pages.
4. Ensure links and paths remain relative (`./css/styles.css`, `./js/main.js`, `./assets/...`).
5. Update `package.json` build script so the new page is copied into `dist/`.
6. Run `npm run build` and confirm file appears in `dist/`.

## Nav/Footer Duplication Warning

Navigation and footer markup are duplicated across `index.html` and `guide.html`. Any nav/footer edit must be applied manually to both files to keep parity.

## CSS Conventions

- Keep all responsive overrides in one `@media (max-width: 768px)` block at the bottom of `css/styles.css`.
- Do not create additional scattered mobile media blocks.
- Keep section CSS grouped near similar/related sections for readability.

## What To Avoid

- No bundler introduction.
- No new npm dependencies for landing package unless explicitly requested.
- No framework migration.
- No CSS nesting syntax.
- Never commit `dist/`.

## Pending Work / Known Placeholders

- Typeform embed in `guide.html` apply card is still placeholder.
- Footer legal links still use `<a href="#">`.
- OG image URL currently points to `https://boundlessleader.com/hero-bg.jpg` and may need final production asset URL.
