# Design Brief

## Direction

Project Build Plus — professional construction management platform for schedule optimization, resource allocation, earned value tracking, owner-architect-contractor coordination, and integrated safety standards compliance.

## Tone

Refined, authoritative, and purposeful — a premium SaaS tool for sophisticated construction leadership with restrained visual detail, information density, and compliance clarity that builds confidence in complex project management.

## Differentiation

Dynamic cash curves and EVM metrics cascade through schedule crashing, resource leveling, participant scenarios, and integrated compliance checklists — closed-loop project intelligence with safety-first authority.

## Color Palette

| Token            | OKLCH            | Role                                    |
|------------------|------------------|-----------------------------------------|
| background       | 0.12 0.008 260   | Deep dark base surface                  |
| foreground       | 0.92 0.008 260   | High-contrast text                      |
| card             | 0.16 0.008 260   | Content card backgrounds                |
| primary          | 0.68 0.18 190    | Calls-to-action, focus states (patriotic blue) |
| accent           | 0.72 0.16 60     | Highlights, energy, contrast (gold)     |
| safety           | 0.65 0.22 130    | Compliance passed, safe states (warm green) |
| muted            | 0.22 0.012 260   | Secondary surfaces, disabled            |
| destructive      | 0.58 0.2 22      | Warnings, deletions                     |
| chart-1          | 0.68 0.18 190    | S-curve primary                         |
| chart-2          | 0.72 0.16 60     | Schedule of values overlay              |

## Typography

- Display: Space Grotesk — dashboard headings, page titles, form section headers, compliance module tabs
- Body: Satoshi — paragraph text, labels, form fields, table content, compliance descriptions
- Mono: JetBrains Mono — budget codes, timestamps, numeric fields, standard codes (OSHA, ANSI)
- Scale: h1 2rem, h2 1.5rem, h3 1.125rem, body 0.938rem, sm 0.813rem

## Elevation & Depth

Minimal shadow hierarchy with `shadow-sm` for cards and `shadow-md` on hover; depth created through layered surface colors (background → card → elevated) and subtle border contrast; compliance module uses color-coded backgrounds for visual state scanning.

## Structural Zones

| Zone                 | Background      | Border              | Notes                                            |
|----------------------|-----------------|---------------------|-------------------------------------------------|
| Header / Nav         | card            | border-b            | Sidebar and top navigation bar with Safety tab  |
| Page Content         | background      | —                   | Main scrollable area                            |
| Cards / Sections     | card            | border (subtle)     | Phase cards, forms, compliance checklists       |
| Compliance Panels    | safety/5 or accent/5 | border-safety or border-accent | Status-coded backgrounds |
| Form Fields          | secondary       | border              | Input, textarea, select elements                |
| Footer               | muted/20        | border-t            | Pitch breakdown link and sync status            |
| Modal / Overlay      | popover         | border              | Alerts, dialogs, floating menus                 |

## Spacing & Rhythm

Large sections separated by `gap-6`; form groups and cards use `gap-4` with internal `space-y-2`; micro-spacing on labels and inputs via `text-sm` and `py-2`; compliance checklist items spaced with `py-2` for scannability.

## Component Patterns

- Buttons: Primary (blue bg, white text), secondary (muted bg, text), destructive (red), accent (gold), safety (green for compliance pass)
- Cards: Rounded `0.625rem`, `border-border`, `shadow-sm` on hover, hover state lifts shadow
- Forms: Labels in `text-sm`, inputs/textareas with `border-border`, focus ring `ring-primary`, consistent `py-2 px-3` padding
- Badges: Participant roles / compliance states as `inline-block`, muted or safety/accent background, rounded-full
- Compliance Checklist: `.compliance-complete` (safety green) for passed items, `.compliance-pending` (gold) for review, checkmarks or icons for visual scan
- Safety Standards Table: Code | Title | CSI Division | Applicability columns, mono font for codes, consistent row height

## Motion

- Entrance: Cards fade in on page load, 300ms ease-out
- Hover: Cards lift (`shadow-md`), buttons darken slightly, form fields brighten on focus
- State transitions: Compliance status changes animate color shift, checklist items fade in as marked complete
- Decorative: Minimal; spinner on async operations, smooth transitions on state changes

## Constraints

- No gradients or blurred overlays; prefer clean layer separation with color-coded backgrounds
- All form and compliance components use token-based colors only; no arbitrary hex or rgb
- No animations longer than 300ms unless choreographed across page zones
- Accent color (gold) used sparingly for pending/review states; safety color (green) for complete/compliant states
- Destructive (red) for critical alerts and risk assessments
- Mobile-first responsive; forms and compliance tables scale cleanly on tablet and desktop
- Compliance module prioritizes clarity and scannability over decoration

## Signature Detail

A live cascading update visualization — when crash factors or resource multipliers shift, the S-curve animates to show new cash requirement with EVM metrics recalculating in real-time. Compliance module mirrors this responsiveness: when a phase is updated, linked compliance checklists and CSI standard recommendations recalculate and highlight changes, creating a unified experience where safety and schedule are visibly interconnected.
