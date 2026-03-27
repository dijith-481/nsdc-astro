# NSDC Astro Database Schema & Data Types

This document maps the database tables to their expected TypeScript types and JSONB structures for the Admin Panel implementation.

## 1. Tables Overview

| Table Name | Description | Key JSONB Fields |
| :--- | :--- | :--- |
| `club.announcements` | Global announcements shown in Hero and About sections. | None |
| `club.events` | Core event data, includes complex metadata for detail pages. | `metadata` |
| `club.teams` | Team members grouped by year. | `social_links` |
| `club.links` | Navigation links for Header and Footer. | None |
| `club.short_links` | Custom slugs for redirects, iframes, or dynamic resource pages. | `metadata` |
| `club.resources` | Repository of projects, research papers, and publications. | `metadata` |
| `club.site_config` | Key-Value store for global settings (Hero, About, Themes, Slots). | `value` |

---

## 2. Table Definitions & JSONB Mapping

### 2.1 club.announcements
- **id**: `number` (Serial)
- **priority**: `number` (Ascending)
- **title**: `string`
- **link**: `string` (Optional)

### 2.2 club.events
- **id**: `number`
- **title**: `string`
- **description**: `text`
- **image_url**: `string` (URL)
- **date**: `string` (**Legacy Support**: Can be "TBA" or ISO Date string)
- **venue**: `string`
- **event_type**: `string` (e.g., "Workshop", "Hackathon")
- **tags**: `string[]` (Text Array)
- **link**: `string` (Registration URL)
- **report_url**: `string`
- **custom_html**: `text` (Optional, injected at bottom of detail page or instead of card)
- **button_text**: `string` (Default: "Register Now")
- **metadata**: `JSONB` (`EventMetadata`)

#### EventMetadata Structure
```typescript
interface EventMetadata {
  collaborators?: {
    name: string;
    desc: string;
    img: string; // URL
    link?: string;
  }[];
  prizes?: {
    title: string;
    reward: string;
    priority: number;
    position?: number; // 1 for primary highlighting
    desc?: string;
  }[];
  rounds?: {
    name: string;
    desc: string;
    priority: number;
    format: "online" | "offline";
    outcome?: string;
    criteria?: string;
    objective?: string;
  }[];
  contacts?: {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
    priority: number;
  }[];
  fees?: {
    label: string;
    amount: string;
    condition?: string;
    is_active: boolean;
  }[];
  hero_config?: {
    start_date: string; // ISO Date
    end_date: string;   // ISO Date
    show_in_hero: boolean;
    before?: number;    // Minutes before start to show in hero
    after?: number;     // Minutes after end to show in hero
    bg_type?: "image" | "html" | "iframe";
    bg_value?: string;
    before_config?: HeroStateConfig;
    ongoing_config?: HeroStateConfig;
    after_config?: HeroStateConfig;
  };
}

interface HeroStateConfig {
  bg?: { type: "image" | "html" | "iframe"; value: string };
  link?: string;
  hide_details?: boolean;
}
```

### 2.3 club.teams
- **id**: `number`
- **name**: `string`
- **year**: `number` (YYYY)
- **position**: `string`
- **role**: `string` (e.g., "Core", "Lead", "Member")
- **priority**: `number`
- **description**: `text`
- **image_url**: `string`
- **social_links**: `JSONB` (`SocialLink[]`)
  - `[{ "name": "LinkedIn", "url": "..." }, { "name": "GitHub", "url": "..." }]`

### 2.4 club.short_links
- **slug**: `string` (Unique)
- **destination_url**: `string`
- **type**: `"iframe" | "redirect" | "embed" | "gform" | "resource-page"`
- **metadata**: `JSONB`
  - **For `resource-page`**: `{ "types": string[], "excluded_types": string[] }`
  - **For `iframe` / `gform`**: `{ "height": string }` (e.g., "80vh")

### 2.5 club.resources
- **id**: `number`
- **title**: `string`
- **description**: `text`
- **image_url**: `string`
- **link**: `string`
- **date**: `string`
- **priority**: `number`
- **resource_type**: `string` (e.g., "Project", "Research")
- **status**: `"active" | "archived" | "upcoming"`
- **tags**: `string[]`
- **button_text**: `string`
- **metadata**: `JSONB` (`ResourceMetadata`)
  - `authors`: `{ name: string; link?: string }[]`
  - `doi`: `string`
  - `publishers`: `{ name: string; link?: string }[]`
  - `version`: `string`
  - `additional_html`: `text`

### 2.6 club.site_config
This table uses a `key` (string) and `value` (JSONB).

| Key | Value Type | Recommended Structure |
| :--- | :--- | :--- |
| `about` | `AboutConfig` | `{ title: string, subtitle?: string, desc_main?: string, established_year?: number, total_participants?: string, nbdc?: { title, desc, img }, chairperson?: AboutQuote, external_testimonial?: AboutQuote, impact?: { line, total_members_count } }` |
| `hero` | `HeroConfig` | `{ title: string, subtitle: string, desc: string }` |
| `hero-main`| `HeroMainConfig`| `{ type: "img"\|"video"\|"iframe"\|"animation"\|"none", src, link, buttontext, desc, animation_variant?: "constellation"\|"data-stream"\|"topographical-matrix" }` |
| `team-main`| `TeamMainConfig`| `{ title: string, subtitle: string, items: { type: "img"\|"video", src, priority }[] }` |
| `top-html` | `SlotConfig` | `{ html: string, is_active: boolean }` (**Recommended over plain string**) |
| `hero-slot`| `SlotConfig` | `{ html: string, is_active: boolean }` |
| `footer-slot`| `SlotConfig` | `{ html: string, is_active: boolean }` |
| `default-theme`| `string` | `"light" \| "dark" \| "system"` |
| `theme_colors`| `ThemeColors` | `{ light?: { bg0, bg1, bg2, fg0, fg1, primary, primaryFg }, dark?: { ... } }` |

---

## 3. Recommended Implementation Notes

1. **Date Fields**: For `club.events.date`, the frontend uses `parseEventDate`. To maintain compatibility, allow the admin to input a free-text string, but provide a date picker that formats to ISO-8601 for new entries.
2. **Site Config**:
   - `nbdc` (National Big Data Cup) section in `about` is optional.
   - `impact` section calculates dynamic counts for "Core Members" and "Lifetime Members" if not explicitly provided in the config, based on the `club.teams` table.
3. **Injections**: The system supports both plain strings and `{ html: string, is_active: boolean }` objects for `top-html`, `hero-slot`, and `footer-slot`. **Recommendation**: Migrate all to the object format in the Admin UI for better control.
4. **Validation**: Use the `priority` field (number) for all sortable entities (Announcements, Team Members, Resources, Links).
