# Project-Specific Memory: NSDC Astro

## Design Specifications

### Color Palette (Tailwind v4 Theme)
Colors are defined as CSS variables with automatic dark mode support.

| Name | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `bg-0` | `#faf9f6` | `#0b111d` | Main page background |
| `bg-1` | `#ffffff` | `#162032` | Component backgrounds (cards, sections) |
| `bg-2` | `#e5e7eb` | `#1f2937` | Borders, subtle backgrounds, and dividers |
| `fg-0` | `#101828` | `#f9fafb` | Primary text, headings |
| `fg-1` | `#475467` | `#9ca3af` | Secondary text, descriptions |
| `primary` | `#101828` | `#f9fafb` | Primary accents, buttons, highlights |
| `primary-fg` | `#ffffff` | `#101828` | Text on primary backgrounds |

### Typography
- **Primary Sans**: "Quicksand" (weights 300-700). Used for all body text and UI elements.
- **Secondary Serif**: "Crimson Pro" (weights 400-700). Used for high-level headings and italic descriptions.
- **Monospace**: Standard for labels, numbers, and dates (e.g., `text-[10px]`, `font-mono`).
- **Patterns**:
  - Extensive use of uppercase with tracking: `uppercase tracking-widest` or `tracking-tighter`.
  - Heading sizes: `text-6xl` to `text-8xl` for major sections, `text-4xl` to `text-6xl` for component titles.

### Spacing & Layout
- **Section Padding**: Standard vertical padding is `py-16` or `py-24`.
- **Container Padding**: Typically `px-4` (mobile), `sm:px-6` (tablet), `lg:px-8` (desktop).
- **Grid Layouts**: Frequent use of `grid-cols-12` with sidebars taking `col-span-3` and content `col-span-9`.
- **Sticky Elements**: Headers and sidebar navigations use `sticky top-24` or `top-10`.

### Borders, Corners & Effects
- **Borders**: Sharp definition using `border-bg-2` or semi-transparent `border-fg-0/20`.
- **Corners**: Primarily `rounded-sm` or sharp `rounded-none`. Pills/Buttons use `rounded-full`.
- **Shadows**: Minimal usage (`shadow-sm`). Exceptions for highlights: `shadow-lg shadow-primary/20`.
- **Blur**: `backdrop-blur-sm` or `backdrop-blur-md` for headers and overlapping UI elements.

### Interactive Patterns
- **Animated Underlines**: Links often have a bottom border that grows from `scale-x-0` to `scale-x-100` on hover.
- **Hover Transitions**: `transition-all duration-300`, `hover:opacity-90`, and `hover:translate-x-1` for arrows.
- **View Transitions**: Custom Astro view transitions are enabled (`fade-out`, `slide-down`, `scale-down`).

## Architectural Patterns
- **SSR by Default**: `output: "server"` with the `@astrojs/node` adapter.
- **Islands Architecture**: Heavy use of Solid.js for interactive components (Islands).
- **Database**: Neon (PostgreSQL) with `pg` driver and a `data-service.ts` for centralized fetching.
- **Caching**: Middleware-level HTML caching for performance.
- **Theming**: Client-side theme detection and persistence (Light/Dark/System).
