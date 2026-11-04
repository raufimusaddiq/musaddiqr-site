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
- **RHYTHM 3**: sections vary. Stats, project rows, motion, mechanisms, a connection map, principles and a stack use different compositions.
- **MOTION 2**: motion is a showreel, not wallpaper. Two short pieces, always with controls; reduced motion shows the poster first and never autoplays.

## Palette

- Canvas `#f4f1e8`, rail `#e9e4d4`, card `#ffffff`, ink `#0b0b0b`, secondary ink `#4f4a40`.
- Accents: pink `#ff6fae`, sun `#ffd42e`, cobalt `#2d4bff`, mint `#7bffbf`.
- The four accents are a deliberate fill system: pink, sun, cobalt and mint mark the stat cards, mechanism numbers and nodes. Keep them systematic; do not scatter them as decoration or introduce a fifth.

## Type

- **Space Grotesk** is the only typeface: statement, body, labels, numbers and metadata. The monospace was dropped because it read as a terminal log against the headline.
- Uppercase tracked labels are part of the identity. Keep tracking deliberate; do not add more sizes below the 14px floor.

## Layout and motion

- One order at every width: role, statement, lede, actions, then the host snapshot as proof. The markup order is the reading order; no CSS `order` is used. The snapshot says so itself and never leads.
- Cards use 8/14/20px radii and 2px ink borders. The hard shadow is the elevation marker.
- Videos are the only large motion. They have controls; under `prefers-reduced-motion` they show the poster and do not loop until the visitor presses play.
- The page holds at 320, 390 and 1440 with no horizontal overflow. Tap targets are at least 44px and meaningful text is at least 14px.

## Constraints

- Contrast stays AA: `#4f4a40` on cream is 7.79:1, white on cobalt is 5.90:1.
- No gradients, glass, glow, or decorative status dots.
- No fabricated metrics, testimonials or repo names. The stat strip is a host snapshot and says so.
