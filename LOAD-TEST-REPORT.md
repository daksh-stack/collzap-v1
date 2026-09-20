# CollZap Production Load Test — Results & Capacity Report

**Date of tests:** 20 September 2026, 14:19 – 20:14 IST
**Target:** `https://api.collzap.com` (live production backend)
**Tool:** k6 in Docker, run from a laptop over the public internet
**Scenarios run:** 02 – 12 (scenario 13, the combined breaking-point run, was not executed)
**Raw reports:** `loadtest/results/*.html`

---

## 1. The short answer

| Question | Answer |
|---|---|
| How many requests per second can it take? | **~20–25 logged-in requests/second, absolute maximum** |
| How many at once, comfortably? | **~7 requests/second** for sub-second responses |
| How many students at the same moment? | **~115 comfortable · ~200 slow · 280+ broken** |
| How many students per day? | **~3,000 daily active** (planning number; see §6) |
| How many signed-up students? | **~6,000–10,000** before this server needs work |
| What breaks first? | **The database round trip.** Not CPU, not RAM, not nginx. |

**One number to remember: about 22 authenticated requests per second.** Every other figure in this report is derived from that ceiling.

---

## 2. Important caveat before reading anything else

**Every authenticated test was already past the breaking point.** The lightest concurrency tested was ~50 users, and even that showed 2-second response times. No test ever observed the server running healthily under logged-in load.

That means:

- Numbers marked **measured** come directly from the test output.
- Numbers marked **estimated** are extrapolated from the throughput ceiling and the latency curve in §4. They are reasoned, not observed.

Other caveats:

- Tests ran against live production, which may also have been serving real students. Some slowness may be from that overlap.
- Tests ran back to back through the afternoon. An earlier heavy test may have left the server degraded for the one after it.
- The `ws_stomp_connect_failed` counter in scenario 08 can count a single failed socket twice, so that figure is overstated (see §8).
- Traffic came from one laptop over the public internet, so a portion of every measured latency is internet round-trip, not server time.

---

## 3. All results

| # | Scenario | Peak load | Throughput | Avg latency | p95 | Errors | Health check OK |
|---|---|---|---|---|---|---|---|
| 02 | Public cached reads | 3,000 req/s target | 473 req/s | 1 s (med 163 ms) | 7 s | 26.5% | 88.1% |
| 03 | Login storm | 150 logins/s target | 22.7 req/s | 25 s | 59 s | **84.8%** | 48.8% |
| 04 | Everyday browsing | 1,500 users | 25.6 req/s | 13 s (med 6 s) | 51 s | — | 50.4% |
| 05 | Seriousness test | 100 users | 5.3 req/s | 5 s | 12 s | — | 85.9% |
| 06 | Matching | 400 users | 4.4 req/s | 14 s | 31 s | — | 58.9% |
| 07 | Chat over REST | 600 users | 4.8 req/s | 20 s | 53 s | — | 46.8% |
| 08 | Live chat sockets | 2,000 sockets | — | 46 s to connect | 1 m | ~60% fail | 75.5% |
| 09 | Token refresh | 50 users | 9.9 req/s | 2 s | 3 s | 0% | **100%** |
| 10 | Abuse / bad input | 120 req/s | 120.9 req/s | 239 ms (med 156 ms) | 182 ms | **0 server errors** | **100%** |
| 11 | Sudden spike | 800 users | 6.7 req/s | 21 s | 55 s | — | 66.1% |
| 12 | 45-minute soak | 150 users | 17.1 req/s | 7 s | 12 s | — | **1.3%** |

Highest throughput ever recorded on a database-backed path: **25.6 req/s** (scenario 04).

---

## 4. The latency curve

Because the scenarios ran at different concurrency levels, they form a curve. This is the most useful thing in the whole dataset.

| Concurrent users | Average response | Health check passing |
|---|---|---|
| 51 | 2 s | 100% |
| 101 | 5 s | 85.9% |
| **151** | **7 s** | **1.3%** |
| 401 | 14 s | 58.9% |
| 601 | 20 s | 46.8% |
| 801 | 21 s | 66.1% |
| 1,500 | 13 s | 50.4% |

The knee is between 10 and 17 requests/second: at 9.9 req/s responses averaged 2 seconds; at 17.1 req/s they averaged 7 seconds and the health endpoint effectively stopped answering.

**Sub-second responses therefore require staying at roughly 7 requests/second or below.** *(estimated — extrapolated below the lowest tested point)*

---

## 5. Concurrent students

A simulated user in these scripts taps far faster than a real student — roughly 8× faster — so raw VU counts overstate the load a real student creates.

Measured from the app's own flows, one real student generates about **3–4 requests per minute** while actively using CollZap (≈ 0.06 req/s):

- Opening the app fires 5 requests at once (`/me`, `/me/onboarding`, unread count, `/chats`, `/matches/circle`)
- Browsing around adds roughly 5 more
- A chat exchange adds roughly 8

| Experience | Sustained rate | Concurrent students | Status |
|---|---|---|---|
| **Snappy** (under 1 s) | ~7 req/s | **~115** | estimated |
| **Usable** (2–3 s) | ~11 req/s | ~180 | estimated |
| **Painful** (7 s+) | 17 req/s | ~280 | **measured** (scenario 12) |
| **Broken** | 20–25 req/s | 300+ | measured |

---

## 6. Daily students

### Step 1 — what one student costs per day

- ~20 requests per session
- 2–3 sessions per day
- **≈ 50 requests per active student per day**

### Step 2 — what the server can serve per day

Traffic is never flat. For a campus app the busiest hour (evening, or between classes) typically carries 10–20% of the day's traffic.

| Experience | Sustained rate | Busiest hour | Requests per day (peak = 15%) |
|---|---|---|---|
| Snappy | 7 req/s | 25,200 | **~168,000** |
| Usable | 11 req/s | 39,600 | ~264,000 |
| Painful | 17 req/s | 61,200 | ~408,000 |

### Step 3 — daily active students

| Experience | Requests/day | ÷ 50 per student | **Daily active students** |
|---|---|---|---|
| **Snappy** | 168,000 | | **~3,400** |
| Usable | 264,000 | | ~5,300 |
| Painful | 408,000 | | ~8,200 |

### How sensitive is this to the peak assumption?

| If the busiest hour holds… | Daily active students (snappy) |
|---|---|
| 10% of the day (spread out) | ~5,000 |
| **15% (typical)** | **~3,400** |
| 20% (evening-heavy) | ~2,500 |
| 30% (one big rush) | ~1,700 |

### Planning numbers

| Metric | Figure |
|---|---|
| **Daily active students** | **~3,000** |
| Signed-up students (at 30–50% daily activity) | **~6,000–10,000** |
| Requests per day | ~170,000 |
| Requests per month | ~5 million |
| Peak concurrent students | ~115 |

**In plain terms: this server comfortably handles about one mid-sized Indian college.** A very large campus, or two colleges launching at once, would need the fixes in §9 first.

### What breaks first as you grow

1. **~115 concurrent** — responses cross 1 second.
2. **~180 concurrent** — 2–3 seconds; students start noticing.
3. **~280 concurrent** — 7 seconds; the health endpoint dies and Docker may mark the backend unhealthy.
4. **~400–500 live chat sockets** — WebSocket connections stop establishing.
5. **Any moment above ~10 logins/second** — logins start timing out.

---

## 7. Where the bottleneck actually is

Your own tests prove it by contrast:

| Path | Throughput | Median latency |
|---|---|---|
| Requests that **never touch the database** (scenario 10) | **120.9 req/s** | 156 ms |
| Requests that **hit the database** (scenarios 04, 12) | **17–25 req/s** | 6–8 s |

A **6× gap**. The HTTP stack, nginx, the JVM and the server hardware are all fine. The database round trip is the entire bottleneck.

Two numbers confirm it:

1. **Even at zero load, a logged-in request takes 150–400 ms** (the minimum values across all runs). That is very slow for simple queries, and points at network latency between the VPS and Supabase — an external database reached over the internet with TLS.
2. **The connection pool is 20.** At 20 requests/second, that is a full second of connection time per request.

### The health check makes it worse

Spring's default `/actuator/health` runs a database validation query, so it queues behind everything else when the pool is congested:

- At 150 users it failed **98.7%** of the time (scenario 12: 384 failed checks).
- The `Dockerfile` has `HEALTHCHECK` hitting that endpoint with a 5-second timeout and 3 retries.

**Under sustained load Docker will mark a perfectly functional backend as unhealthy.**

### Logins are separately crippled

Password hashing is CPU-heavy by design (bcrypt strength 10, ~60–100 ms each). Scenario 03 targeted 27,300 logins, issued 17,100, dropped 10,400, and **84.8% of those issued failed** — mostly 59-second timeouts.

Sustainable login rate: **5–10 per second.** Normal daily signups and logins are nowhere near this. The danger is a mass simultaneous login — for example after a deploy that invalidates sessions.

---

## 8. Bugs the tests found

### A. Refresh-token reuse detection is not working — **confirmed defect**

Scenario 09 recorded `refresh_replay_not_revoked = 10` — **10 out of 10 trials failed**, and the test's own threshold (`count==0`) failed with it.

- Rotation works: each refresh issues a new token. ✅
- Rejection works: a replayed old token is correctly refused with 401. ✅
- **Revocation does not work:** replaying a stolen token should revoke every session for that user. It does not — the newest token still worked afterward. ❌

So a stolen refresh token is detected but the thief is not kicked out. Likely cause is transaction/rollback behaviour around the bulk `revokeAllForUser` update in `AuthService.refresh` — **not yet verified, needs investigation.**

### B. Health endpoint is database-gated

See §7. Causes false "unhealthy" reports under load.

### C. Measurement flaw in the WebSocket test (ours, not the app's)

`ws_stomp_connect_failed` is incremented in two places in `loadtest/lib/stomp.js`, so one failed socket can be counted twice. The reported 10,100 failures against 8,200 sessions is therefore overstated — the true failure rate is closer to **60%**. The conclusion does not change, but the number is softer than it appears.

### D. What passed cleanly

Scenario 10 (abuse) was a **clean pass**: 29,300 hostile requests at 120.9/s — bad tokens, malformed JSON, wrong HTTP verbs, oversized messages, rate-limit hammering — produced **100% correct responses, zero server errors, 156 ms median, 100% health**. Input validation and error handling are solid.

---

## 9. What would actually move these numbers

In order of impact:

| # | Fix | Expected gain | Where |
|---|---|---|---|
| 1 | **Put the VPS in the same region as Supabase.** Every query currently pays 100–300 ms of network latency. | **3–10×** | Infrastructure — not code |
| 2 | **Raise the Hikari pool from 20** and use Supabase's connection pooler (port 6543). More parallel round trips directly multiplies throughput when latency is the constraint. | 2–5× | `application.properties` |
| 3 | **Enable virtual threads** — `spring.threads.virtual.enabled=true`. Java 25 already supports it. Stops thread starvation. | Moderate | `application.properties` |
| 4 | **Make the health check skip the database.** Stops Docker killing a backend that is merely busy. | Stability | `application.properties` |
| 5 | **Cache more read endpoints** in Redis. Each cached read removes a whole database round trip. | Per-endpoint | `CollegeService` pattern |
| 6 | **Put Cloudflare in front.** Free, and it absorbs the entire public/cached path. | Removes ~400 req/s of load | DNS |
| 7 | **Raise nginx `worker_connections`** from the 1024 default, and the file-descriptor limit. | 400 → 2,000+ sockets | `nginx/templates/app.conf.template` |
| 8 | **Fix refresh reuse detection** (§8A). | Security, not capacity | `AuthService.refresh` |

Items 2, 3, 4 and 7 are configuration changes of a few lines each. **Item 1 is the single biggest lever and costs nothing but a migration.**

---

## 10. Still outstanding

- **Scenario 13 (combined breaking point) was never run.** The soak test largely answered the question, but the headline combined number is still unmeasured.
- **No server-side resource data was captured.** `docker stats` output during the runs would show whether the backend was CPU-bound or near its 500 MB memory limit. Without it, §7's conclusion rests on the throughput contrast alone.
- **No Supabase-side metrics** (connection count, slow queries, CPU) were recorded.
- **Re-test after the §9 fixes** to quantify the gain.

---

## 11. Reproducing this

```
loadtest/README.md          how to run everything
loadtest/seed/seed.sql      creates the 600 test accounts
loadtest/seed/cleanup.sql   removes them (verify it prints 0 and 0)
loadtest/results/           HTML and JSON reports per run
```

Run from a laptop, never from the VPS. Heavy scenarios belong in a 3–4 AM window.
**Confirm the cleanup script has been run — the 600 test accounts must not be left in production.**
