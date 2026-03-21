# First Coast AI Design Spec

## Intent

The site already has a strong dark foundation. The goal of this update is to keep that credibility while introducing a broader coastal-tech palette and a set of visuals that make the pages feel more intentional, regional, and alive.

## Asset Pack

Place these files in the existing site flow:

- `images/hero-first-coast-network.svg`
  Use in the homepage hero. It combines a skyline silhouette, data paths, and coastal-tech lighting.
- `images/icon-ai-strategy.svg`
  Use with the AI Strategy card or as a section marker on `services.html`.
- `images/icon-ai-implementation.svg`
  Use with the AI Implementation card.
- `images/icon-ai-training.svg`
  Use with the AI Training and Workshops card.
- `images/icon-data-modernization.svg`
  Use with the Data Modernization card.
- `images/regional-northeast-florida.svg`
  Use in the "Local knowledge. Regional reach." section to replace the current text-only treatment.
- `images/about-team-constellation.svg`
  Use near the About page mission and leadership sections as a branded team placeholder.
- `images/contact-signal-illustration.svg`
  Use in the Contact page intro or beside the form.

## Expanded Palette

Use this as the next-pass token set. It preserves the existing colors and adds three new accents that broaden section moods without abandoning the original brand language.

```css
:root {
  --bg: #060d1a;
  --bg-soft: #0c172c;
  --bg-deep: #081225;
  --surface: rgba(16, 28, 53, 0.75);
  --surface-solid: #101c35;
  --surface-raised: #13264a;
  --line: rgba(161, 183, 219, 0.25);
  --line-strong: rgba(161, 183, 219, 0.42);
  --text: #e9f0ff;
  --muted: #a5b9de;

  --brand: #22d3ee;
  --accent: #fb7185;
  --highlight: #f8b84a;

  --lagoon: #5eead4;
  --horizon: #60a5fa;
  --sunset: #ff9a62;

  --glow-cyan: rgba(34, 211, 238, 0.18);
  --glow-lagoon: rgba(94, 234, 212, 0.16);
  --glow-rose: rgba(251, 113, 133, 0.16);
  --glow-sunset: rgba(255, 154, 98, 0.16);

  --gradient-hero: linear-gradient(135deg, #22d3ee 0%, #60a5fa 52%, #fb7185 100%);
  --gradient-section: linear-gradient(
    150deg,
    rgba(34, 211, 238, 0.12) 0%,
    rgba(96, 165, 250, 0.08) 52%,
    rgba(248, 184, 74, 0.10) 100%
  );
  --gradient-warm: linear-gradient(
    145deg,
    rgba(255, 154, 98, 0.14) 0%,
    rgba(248, 184, 74, 0.12) 42%,
    rgba(251, 113, 133, 0.08) 100%
  );
  --gradient-card-hover: linear-gradient(
    160deg,
    rgba(34, 211, 238, 0.16) 0%,
    rgba(94, 234, 212, 0.10) 48%,
    rgba(96, 165, 250, 0.14) 100%
  );
}
```

## Usage Guidance

### 1. Base surfaces

- Keep `--bg`, `--bg-soft`, and `--surface` as the dominant layout colors.
- Use `--surface-raised` for cards or illustration frames that need stronger separation.
- Reserve `--line-strong` for hover, focus, or active states.

### 2. Accent color roles

- `--brand`
  Primary action color and default link/highlight color.
- `--horizon`
  Use for secondary gradients, charts, or implementation-focused sections.
- `--lagoon`
  Use for support states, regional content, and data-link treatments.
- `--accent`
  Use sparingly for calls to attention and conversion moments.
- `--highlight`
  Use for kicker text and key emphasis.
- `--sunset`
  Use to warm up the site in sections that currently feel too cold or uniform.

### 3. Recommended gradient placement

- Homepage hero background or CTA button:
  `var(--gradient-hero)`
- Region strip, page dividers, or map section:
  `var(--gradient-section)`
- Contact or About section blocks that need warmth:
  `var(--gradient-warm)`
- Card hover state or selected state:
  `var(--gradient-card-hover)`

## Component Guidance

### Service cards

- Add the service SVGs above each `h3` or `h2`.
- Default icon size: `72px` to `88px`.
- Keep card body backgrounds dark, then shift only the top border, icon glow, or background wash on hover.

Suggested hover recipe:

```css
.service-card:hover,
.card:hover {
  background: var(--gradient-card-hover), var(--surface);
  border-color: var(--line-strong);
  transform: translateY(-4px);
}
```

### Regional section

- Replace the current text-only split with the map illustration on one side and city list on the other.
- The map works best on a dark background with `var(--gradient-section)` behind it.

### About page

- Use the team illustration above the leadership grid or as the second column beside mission and approach.
- Keep bios textual; let the illustration handle the visual weight.

### Contact page

- Pair the contact illustration with the form or intro copy.
- Use `--gradient-warm` behind the illustration shell so the final section feels more welcoming than the rest of the site.

## Suggested Section Mix

Use this sequence to reduce the current blue monotony:

1. Hero: cool and bright with `--gradient-hero`
2. Services: mostly dark cards with cyan and horizon hover states
3. Regional section: cool-to-warm mix with `--gradient-section`
4. About section: mostly dark with lagoon accents
5. Contact section: warm with `--gradient-warm`

## Implementation Notes

- All delivered visuals are SVG so they can scale cleanly on GitHub Pages without extra build tooling.
- If you need to place them inline at smaller sizes, preserve the `viewBox` and let CSS set dimensions.
- The icons were designed to sit on dark surfaces. Avoid placing them directly on a white background without a container.
