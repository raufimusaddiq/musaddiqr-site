# Design direction

This is the written direction behind `musaddiqr.com`. It exists so every visual
decision has a reason, not so the page can be restyled by a framework.

## Identity

A screen-print personal folio: cream paper, black ink, thick outlines and hard
offset shadows. It should feel assembled by a person who works on infrastructure,
not like a SaaS landing page. The identity is the paper, the ink and the colored
fills; do not soften it, round it off, or replace it with a generic dashboard.

## Dials

- **ENERGY 3**: the page should say hello. Large statement type, saturated fills and hard shadows carry that.
- **RHYTHM 3**: sections vary. Hire paths, featured cards, a project card grid, motion, mechanisms, an interactive path diagram, principles, a tool-chip stack and an about card use different compositions. Big friendly titles sit under the tracked section labels.
- **MOTION 2**: motion is a showreel, not wallpaper. Two short videos, always with controls; reduced motion shows the poster first and never autoplays. Small motion serves navigation and explanation only: an eased nav glide, a sliding section indicator, cards rising in once, and the walking agent in the path diagram. All of it is off under reduced motion.

## Palette

- Canvas `#f4f1e8`, rail `#e9e4d4`, card `#ffffff`, ink `#0b0b0b`, secondary ink `#4f4a40`.
- Accents: pink `#ff6fae`, sun `#ffd42e`, cobalt `#2d4bff`, mint `#7bffbf`.
- The four accents are a deliberate fill system: pink, sun, cobalt and mint mark the stat cards, mechanism numbers and nodes. Keep them systematic; do not scatter them as decoration or introduce a fifth.

## Drawings and characters

- Pictures are inline SVG in the page's own inks: 2px ink outlines, accent fills, hard offset shadows, Space Grotesk labels. No raster illustration except the portrait.
- Two characters, one family with the same screen face. **Screen-face bots** are the workers: they walk and carry tickets. **Drones** are the watchers and couriers: one holds the review sign over the gate, one flies the handoff brief, one patrols the Watch path.
- The illustrated portrait (`assets/avatar.webp`) is Raufi: it sits in the hero greeting sticker and the about card, never as decoration elsewhere.
- Every card picture has a text alternative; labels inside pictures are illustrative and may fall below 14px on a phone.

## Type

- **Space Grotesk** is the only typeface: statement, body, labels, numbers and metadata. The monospace was dropped because it read as a terminal log against the headline.
- Uppercase tracked labels are part of the identity. Keep tracking deliberate; do not add more sizes below the 14px floor.

## Layout and motion

- One order at every width: role, statement, plain sub-line, lede, availability, actions (with the hero drawing beside them above 1000px); then the two ways to hire (role or project), selected work and the project grid, motion, mechanisms, the path diagram, principles, stack, the host snapshot as proof of operations, the about card, and contact. The markup order is the reading order; no CSS `order` is used. The snapshot says what it is and never leads.
- Cards use 8/14/20px radii and 2px ink borders. The hard shadow is the elevation marker.
- The nav is sticky above phone width, with a reading-progress line; on a phone it is a normal top bar.
- Videos are the only large motion. They have controls; under `prefers-reduced-motion` they show the poster and do not loop until the visitor presses play.
- The page holds at 320, 390 and 1440 with no horizontal overflow. Tap targets are at least 44px and meaningful text is at least 14px.

## Constraints

- Contrast stays AA: `#4f4a40` on cream is 7.79:1, white on cobalt is 5.90:1.
- No gradients, glass, glow, or decorative status dots.
- No fabricated metrics, testimonials or repo names. The stat strip is a host snapshot and says so; the path diagram says it is illustrative.
- Only Raufi's own work is listed. Private projects are described from their repos, without names that are not public.
