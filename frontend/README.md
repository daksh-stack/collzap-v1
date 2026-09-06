# CollZap — frontend

Find people in your college who are actually serious about the same thing.

This is the browser client. It is a **static single-page app** — there is no
Node server in production, no SSR, no API routes here. It builds to a folder of
files and talks to the Spring Boot backend over HTTP and one WebSocket.

---

## 1. Run it

```bash
npm i
npm run dev      # Vite dev server, usually http://localhost:5173
npm run build    # static bundle into dist/
npm run preview  # serve the built dist/ locally
npm run lint
```

**The backend must be running or nothing works.** Login, matching, chat and
admin are all server-driven. Start the backend first; it listens on `:8081`.

### Environment

Two variables. Copy `.env.example` to `.env`:

| Variable       | Meaning                               | Default when unset          |
| -------------- | ------------------------------------- | --------------------------- |
| `VITE_API_URL` | REST base URL — **must** end in `/api` | `http://localhost:8081/api` |
| `VITE_WS_URL`  | SockJS/STOMP endpoint for chat        | `http://localhost:8081/ws`  |

Two things to know about these:

- They are **inlined at build time**, not read at runtime. Changing them means
  rebuilding. You cannot swap the API URL by editing a file on the server.
- They ship to the browser. **Never put a secret in a `VITE_*` variable.**

CORS on the backend already allows `http://localhost:5173` and
`https://collzap.com`. Serving from any other origin means adding it to the
backend's CORS config, or every request fails in the browser.

---

## 2. The stack, and why

| Layer      | Choice                        | Note                                              |
| ---------- | ----------------------------- | ------------------------------------------------- |
| Build      | Vite 7                        | `vite.config.js` sets SPA fallback + manual chunks |
| UI         | React 19, plain JSX           | No TypeScript in this codebase                    |
| Routing    | react-router-dom 7            | All routes lazy-loaded                            |
| State      | Zustand 5                     | One store per backend domain                      |
| HTTP       | axios, one shared instance    | Auth header + 401 handling live in the interceptor |
| Realtime   | @stomp/stompjs over sockjs-client | One connection, many subscriptions            |
| Styling    | Tailwind 3                    | Design tokens in `tailwind.config.js`             |
| Motion     | `motion` (Framer Motion for React 19) | Shared springs in `src/lib/motion.js`     |
| 3D         | three + @react-three/fiber + drei | Exactly one object, only on the login screen  |
| Scroll     | lenis                         | Public + onboarding only, never in the app shell  |

---

## 3. Directory map

```
src/
  api/api.js            the single axios instance. Every request goes through it.
  services/websocket.js the single STOMP client. Chat + notification subscriptions.
  store/                Zustand stores, one per backend domain (10 of them)
  components/
    guards/             route gates: Auth, Onboarding, Admin
    layout/             PublicLayout, OnboardingLayout, AppShell, AdminLayout,
                        plus Sidebar and Topbar
    ui/                 primitives: Button, Input, Modal, Badge, Card, Tabs,
                        Avatar, Select, TextArea, Spinner, Pagination,
                        Dropdown, EmptyState, Skeleton
    three/              IdCardCanvas (guards) + IdCardScene (the R3F scene)
    EmptyChair.jsx      inline SVG used for the waiting/idle state
    ErrorBoundary.jsx   top-level crash net
  lib/
    motion.js           spring configs + reduced-motion helpers
    useLenis.js         smooth-scroll hook
    utils.js            cn() — clsx + tailwind-merge
  pages/                one folder per area; see the route table below
```

78 source files. Roughly: 14 UI primitives, 10 stores, 4 layouts, 3 guards.

---

## 4. How a request actually flows

This is the part worth understanding. Everything goes through the same path:

```
Component
   │  calls a store action, e.g. useMatchStore().fetchCircle()
   ▼
Zustand store          sets { loading: true }, calls api.get('/matches/circle')
   │
   ▼
axios instance (api/api.js)
   │  REQUEST interceptor  → attaches `Authorization: Bearer <accessToken>`
   │                         read live from useAuthStore
   ▼
Backend :8081/api/...
   │
   ▼
axios RESPONSE interceptor
   │  success → returns response.data (NOT the axios envelope)
   │  failure → normalises to a real Error with the backend's message
   ▼
Store sets { data, loading: false } — or throws
   │
   ▼
Component re-renders
```

Two consequences that trip people up:

1. **Stores receive `response.data` directly.** The interceptor unwraps it.
   There is no `.data.data` anywhere. `const circle = await api.get(...)` is
   already the payload.
2. **Errors are always `Error` objects with a useful `.message`.** Components
   do `toast.error(err.message)` and get the backend's own wording.

### The 401 rules

Non-obvious, and deliberate. In `api/api.js`:

- **Auth endpoints never trigger a refresh.** `/auth/otp`, `/auth/otp/verify`,
  `/admin/auth/login`, `/auth/logout` and `/auth/refresh` are exempt. A 401
  from these means *bad credentials*, not *expired session* — so a wrong OTP
  shows the backend's actual message instead of "Session expired".
- **No refresh token means no refresh attempt.** Admin sessions have no refresh
  token at all; they log out immediately.
- **On refresh failure the user is redirected**, via
  `window.location.assign('/login')`, so nobody is stranded on a dead page.
- **Refresh does not rotate the refresh token.** `AccessTokenResponse` only
  returns a new access token; the existing refresh token is kept.

---

## 5. State: 10 stores, one per domain

Stores are plain Zustand. Only `useAuthStore` persists (to `localStorage` under
`auth-storage`), and only these keys: `user`, `accessToken`, `refreshToken`,
`isAuthenticated`, `nextStep`. Loading and error flags are deliberately not
persisted.

| Store                 | Holds                                                        | Talks to                                    |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| `useAuthStore`        | tokens, user, `nextStep`; `requestOtp` `verifyOtp` `refresh` `logout` `adminLogin` | `/auth/*`, `/admin/auth/login` |
| `useUserStore`        | `profile` `onboarding` `settings` `peerProfile`              | `/me/*`, `/users/{id}`                      |
| `useMatchStore`       | `circle` `currentGroup` `findResults`                        | `/matches/*`                                |
| `useChatStore`        | `chatList` `rooms` `messages` `systemEvents` `pagination`     | `/chats/*`                                  |
| `useNotificationStore`| `notifications` `unreadCount` `pagination`                   | `/notifications/*`                          |
| `useInterestStore`    | `catalog` `myInterests` `projectTypes` `connectionTypes`      | `/interests/*`, `/project-types`, `/connection-types` |
| `useTestStore`        | `eligibility` `session` `result`                             | `/test/*`                                   |
| `useModerationStore`  | `blockedUsers` `verificationStatus`                          | `/safety/*`, `/verification/*`              |
| `useCollegeStore`     | `colleges`                                                   | `/colleges`                                 |
| `useAdminStore`       | `stats` `users` `verifications` `matches` `queue` `reports` `interestFeedback` | `/admin/*`              |

**Single-object vs map.** `useMatchStore` keeps one `currentGroup`, not a map
keyed by id. `useUserStore` keeps one `peerProfile`, not a map. Pages therefore
guard on identity before rendering:

```js
const group = currentGroup?.id === groupId ? currentGroup : null;
```

Without that guard you briefly render the *previous* group while the new one
loads. The same pattern is in `PeerProfilePage`.

---

## 6. Routing and the three guards

Routes are declared in `App.jsx`, all lazy-loaded behind a `<Suspense>`. Guards
nest as layout routes — each renders an `<Outlet>` or redirects.

```
<AuthGuard>                          is there a session?
  └── <PublicLayout>                 /login  /verify-otp  /admin/login
  └── <OnboardingGuard>              is setup finished?
        └── <OnboardingLayout>       /onboarding
        └── /test                    (no shell — full-viewport exam)
        └── <AppShell>               /  /chat  /chat/:roomId  /matches
                                     /matches/:groupId  /profile
                                     /profile/:userId  /settings  /notifications
  └── <AdminGuard>
        └── <AdminLayout>            /admin  /admin/users  /admin/verifications
                                     /admin/matches  /admin/queue  /admin/reports
                                     /admin/feedback  /admin/colleges
```

**AuthGuard** — no session and not on a public route → `/login`. Logged in and
*on* a public route → `/` (or `/admin` for operators). An admin who wanders
into a student route is sent to `/admin`. It also calls `fetchOnboarding()`
once on boot, so a `nextStep` persisted from before an admin approved the
document is not stale.

**OnboardingGuard** — reads `nextStep` from `useAuthStore`:
- a test sitting in progress locks navigation to `/test`
- `nextStep === 'TAKE_SERIOUSNESS_TEST'` also redirects to `/test`
- `READY`, `AWAITING_VERIFICATION` and `null` may use the app
- anything else → `/onboarding`

**AdminGuard** — `user.isAdmin` or bounce to `/`. This is *convenience only*.
Real authorisation is `ROLE_ADMIN` on the backend; never treat this flag as
security.

### Onboarding steps

`OnboardingPage` switches on `useUserStore().onboarding.step` — **not** on
`useAuthStore().nextStep`. The two are kept in sync by `fetchOnboarding()`, but
the store's `onboarding.step` is what actually picks the component. The step
IDs are the backend enum, exactly:

```
UPLOAD_DOCUMENT → COMPLETE_PROFILE → SELECT_PROJECT_TYPE → SELECT_INTERESTS
→ TAKE_SERIOUSNESS_TEST → SELECT_CONNECTION_TYPE → AWAITING_VERIFICATION → READY
```

`VERIFICATION_REJECTED` is not a stepper position — it is a *state of the
document step*, and its "send another" button moves `onboarding.step` back to
`UPLOAD_DOCUMENT`.

---

## 7. Realtime

One STOMP client for the whole app (`services/websocket.js`), connected over
SockJS with the access token in the CONNECT headers.

| Destination                   | Payload               | Goes to                                  |
| ----------------------------- | --------------------- | ---------------------------------------- |
| `/topic/rooms/{roomId}`       | `ChatSocketEvent`     | `useChatStore`                           |
| `/user/queue/notifications`   | `NotificationResponse`| `useNotificationStore.addIncomingNotification` |
| `/user/queue/errors`          | error frame           | logged in dev only                       |

`ChatSocketEvent` is `{ type, chatRoomId, payload, at }` and is dispatched on
`type`:

- `MESSAGE` → `payload` is a `ChatMessageResponse` → `addIncomingMessage`
- `RECEIPT` → `payload` is `{ userId, status, upTo }` → `updateReceipt`
- `MEMBER_JOINED` → `payload` is a `MemberSummary` → `addSystemEvent`.
  **Never appended as a chat bubble.** It renders as a small system line.

Lifecycle: `AppShell` connects and subscribes to notifications on mount and
unsubscribes on unmount; polling `/notifications/unread-count` every 30s runs
alongside as a fallback. `ChatRoomPage` subscribes to its room on mount and
unsubscribes on leave. `logout()` calls `disconnect()`, which drops everything.

Sending is **REST, not STOMP**: `POST /chats/{roomId}/messages`. The socket
echo of your own message is de-duplicated in the store by `id` and
`clientMessageId`.

STOMP frame logging is on in dev and silenced in production builds.

---

## 8. Design system

Tokens live in `tailwind.config.js`. The palette is warm paper — one ink, one
accent, one danger:

```
paper #F4EFE6   ink #1A1714   mute #6B645C   line #DDD4C8
accent #C45C26  accent-ink #8A3510
good #2F6B4F    wait #B5812F   bad #A33B2B
```

`brand` is aliased to `accent`, so pre-existing `brand-*` classes still resolve
to the current palette rather than the old blue.

- **Type** — Fraunces for display/headlines, IBM Plex Sans for UI, IBM Plex
  Mono for labels and numbers. Loaded in `index.html`.
- **Radius** — capped at 10px. `xl`, `2xl` and `3xl` all resolve to 10px, so no
  stray blob corners can sneak in.
- **Shadow** — one hairline, one soft. No stacked colour shadows.
- **Motion** — `src/lib/motion.js` exports `snappy`, `soft` and `page`.
  `useReducedMotion()` and `transition()` collapse everything to a near-instant
  opacity change when the user asks for reduced motion. There is also a global
  CSS `prefers-reduced-motion` block in `index.css`.

Two registers, deliberately different: the **student app** is quiet and roomy
with large Fraunces headlines; **admin** is a dense ops desk with headings
capped at 24px, no 3D and no smooth scroll.

### The 3D object

One only: a college ID on a lanyard, behind the login form
(`components/three/`). It is aggressively guarded and degrades to a CSS card:

- `prefers-reduced-motion` → CSS card, WebGL never initialises
- no WebGL support → CSS card
- context lost → CSS card
- sustained low FPS (three consecutive sub-15fps seconds, after a 2s warm-up
  to ignore shader compilation) → CSS card
- tab hidden → `frameloop="never"`, so it burns nothing in the background

It is `aria-hidden`, `pointer-events: none`, and cannot take focus from the
form. `three` is code-split into its own chunk, so it only downloads on
`/login`.

---

## 9. Backend contract notes

Field names come from Java records; Jackson serialises component names as-is.
These are the ones that have historically been guessed wrong — the values on
the right are correct:

| Payload                 | Correct                                                   |
| ----------------------- | --------------------------------------------------------- |
| `CircleResponse`        | `connections` / `waiting` (not activeGroups/waitingGroups) |
| `MatchResultResponse`   | chat id is `result.group.chatRoomId`, not `result.chatRoomId` |
| `UserResponse`          | `verificationStatus === 'APPROVED'` — there is no boolean `verified` |
| `PeerProfileResponse`   | interests have **no** id; key on `interestName + projectType` |
| `TestEligibilityResponse` | `hasInProgressSession` (not hasActiveSession)            |
| `InterestCatalogResponse` | `catalog.longTerm` **is** the array                     |
| `AdminStatsResponse`    | `activeMatchGroups`, `waitingMatchGroups`, `totalMessages` — there is no unresolvedReports |
| `AdminReportRow`        | `reportedName` / `reportedId`                             |
| `PendingVerificationRow`| `uploadedAt` (not submittedAt)                            |
| `AccessTokenResponse`   | access token only — no new refresh token                  |
| `AdminAuthResponse`     | no refresh token at all; session lives until the JWT dies |

Paged endpoints return `{ content, page, size, totalElements, totalPages, last }`.

**Things the backend does not have**, so the UI must not pretend otherwise:
there is no report-resolve or ban endpoint (the reports page is read-only);
there is no admin token refresh; chat is **not** end-to-end encrypted; file
upload is a URL field, not a real uploader.

---

## 10. Deploying

`dist/` is a static SPA. Routing is client-side, so **every path must fall back
to `index.html`** or a refresh on `/chat/:id` returns 404.

- **Netlify** — `public/_redirects` is committed and handles it.
- **Vercel** — `vercel.json` is committed and handles it.
- **nginx** — add it yourself:

  ```nginx
  location / {
    root /var/www/collzap;
    try_files $uri $uri/ /index.html;
  }
  ```

Build command `npm run build`, output directory `dist`, and set both `VITE_*`
variables in the host's environment before building.

Pointing at a deployed API:

```bash
VITE_API_URL=https://api.collzap.com/api
VITE_WS_URL=https://api.collzap.com/ws
```

Both must be HTTPS when the site is HTTPS — browsers block mixed content, and
that includes the WebSocket.

### Bundle shape

`vite.config.js` splits vendor code manually:

| Chunk   | Contents                    | Loaded                       |
| ------- | --------------------------- | ---------------------------- |
| `three` | three, @react-three/*       | only on `/login`, ~898kB raw |
| `react` | react, react-dom, router     | always                       |
| `stomp` | @stomp/stompjs, sockjs      | always                       |
| `index` | app code                    | always                       |

Plus one lazy chunk per route. `define: { global: 'globalThis' }` stays —
SockJS reaches for `global`, which browsers do not have.

---

## 11. Conventions

- **Never change a store's HTTP payload shape** to suit the UI. The backend is
  the source of truth; fix the component.
- **Store method names are stable.** `fetchCircle`, `findMatches`, `fetchGroup`,
  `leaveGroup`, `fetchMe`, `fetchOnboarding`, `fetchPeerProfile` and friends are
  referenced across many pages.
- **Icon-only buttons need an `aria-label`.** No exceptions.
- **Guard on identity before rendering** anything from a single-object store.
- **No `console.log` on happy paths.** Dev-only logging goes behind
  `import.meta.env.DEV`.
- **Respect `prefers-reduced-motion`** — use the helpers in `lib/motion.js`
  rather than hand-rolling.

### Known rough edges

- `ErrorBoundary.jsx` references `process.env`, which is not defined in the
  browser — currently a lint error.
- `useChatStore` and `useNotificationStore` declare an unused `get` parameter.
- `AdminMatchesPage` renders a per-member remove button only when a row carries
  `memberIds`; if the list endpoint returns only `memberNames`, the group-level
  unmatch still works but the per-member control is absent.
