# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Verified college students in India, matched inside their own college on shared interests, project goals, and seriousness level. The product names several audiences explicitly and treats them as equally weighted, with no single flagship persona (confirmed): founders looking for co-founders, developers looking for project teammates, designers/creators looking for people to build with, students who want a study group that actually studies, and students who simply want to meet others taking the same interests seriously.

Secondary, non-target role: college admins/staff who review "Bring CollZap to my college" applications, manage daily task banks, and moderate verification — an operating role, not an audience the product markets to.

## Product Purpose

CollZap exists because every college already contains the people a student needs, but campus talent rarely discovers itself — introductions happen through luck, hostel proximity, or whichever WhatsApp group someone was added to. Existing tools don't solve this: group chats go quiet within a week, Instagram optimizes for scrolling rather than finding a co-founder, and LinkedIn is built for cross-city professional networking, not the thousand students sharing one campus. CollZap exists to make same-campus peer discovery direct and intentional instead of accidental.

Success means students actually get introduced to, and keep working or talking with, the peers on their own campus who match what they're trying to do and how seriously they're doing it — not just a one-time introduction.

## Positioning

CollZap matches on four things simultaneously: same college (verified identity), same interest, similar seriousness level (established via a one-time assessment for long-term commitments), and the requested connection shape. Connection shape is a first-class match input, not an afterthought — matching someone who wants a co-founder with someone who wants a casual study circle "helps nobody." Three shapes exist: `ONE_ON_ONE` (exactly 2, drops back to waiting if the partner leaves), `SHORT_GROUP` (2–4, can grow after opening), and `SOCIETY` (1 to unbounded). No competitor mentioned in product copy (group chats, Instagram, LinkedIn) matches on seriousness level or connection shape at all.

## Operating Context

- Account creation requires a verified student identity tied to a specific college; verification status can be reviewed, approved, or revoked by admins.
- Long-term matching requires a one-time seriousness assessment; once the interests, assessment, and connection format are set, they cannot be changed.
- Short-term interests can be swapped at any time without disturbing existing chats.
- A matched group gets a persistent chat, and — new this cycle — a daily task sequence per interest: admin-authored task banks assign one task per day to active groups, members submit work and peer-review each other's submissions, and each student accrues points and a personal day-streak (no leaderboard).
- Rollout is campus-by-campus within India rather than simultaneous nationwide, because a peer-matching product is only as good as the density of people already on it in one place.
- Conversations are private to the people in them; there is no public feed or discovery surface.
- Students at a college not yet onboarded can submit a public "Bring CollZap to my college" application.

## Capabilities and Constraints

- Three connection shapes (`ONE_ON_ONE`, `SHORT_GROUP`, `SOCIETY`) with different capacity and growth rules, described under Positioning.
- India-only launch is a confirmed go-to-market sequencing choice; whether that is a permanent geographic limit or an eventual expansion is undecided — not to be treated as settled either way.
- The points/streak system is deliberately non-competitive: personal progress only, no leaderboard, no effect on matching or verification.
- Web platform: a React SPA with server-prerendered marketing routes for SEO; no native app exists or is planned as of this record.

## Brand Commitments

Name: CollZap (domain collzap.com). Shipped copy locks in a direct, unhedged voice — the About page argues its own differentiation plainly ("Every college already contains the people you need") rather than through generic startup-marketing language, and future copy should preserve that register. Existing tagline/eyebrow lines already shipped: "Find Your Circle On Campus Before College Passes You By," "Verified · Same Campus · Serious Peers," "Private by design."

## Evidence on Hand

None. Confirmed fully pre-launch: no real pilot colleges, testimonials, usage data, or case studies exist yet. Future design and marketing work must not fabricate testimonials, user/college counts, named customers, or outcome claims — copy should read as pre-launch and honest about it (e.g. "Launching first in selected Indian colleges") rather than implying traction that doesn't exist.

## Product Principles

1. Campus density over geographic breadth — depth in one college beats a thin presence across a hundred.
2. Match on shape, not just topic — connection type (pair, small group, or open society) is a first-class match input alongside interest and seriousness, never an afterthought.
3. Verified identity, private by default — every account is tied to a real, verified student, and conversations are never public.
4. State the differentiator plainly — copy names the mechanism and the specific competitive gap directly instead of leaning on soft marketing language.
5. Accountability sustains matches, not just introductions — the daily task system exists because chats alone go quiet; shared, admin-seeded activity plus peer review keeps a matched group active day to day rather than fading after the intro.
