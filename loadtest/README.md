# CollZap load tests (k6 in Docker)

Finds how much traffic the production backend (`https://api.collzap.com`) takes
before it degrades and before it breaks. Only the API host is tested, never the
Vercel frontend. No signup, OTP, email, upload or admin endpoints are touched, so
Resend and Cloudinary are never called.

**Run k6 from your own machine (Docker Desktop must be running), not from the VPS.**

## One-time setup
1. Start Docker Desktop.
2. Open `seed/seed.sql`, run it in the Supabase SQL editor. It creates an isolated
   "LoadTest College" and 600 users `lt+1..600@loadtest.invalid` (password
   `LoadTest#2026`), all APPROVED. Check the result queries at the bottom:
   600 users, interests spread out, and question banks > 0 for long-term interests.
   (Change counts/password in the `DECLARE` block AND `lib/config.js` together.)
3. Before the real run, open a **second terminal on the VPS** and keep these going:
   ```
   docker stats
   docker compose logs -f backend
   docker compose ps          # RESTARTS column = the backend got killed
   ```
   Also keep Supabase → Database → Reports open (connections, CPU).

## Running
```
.\run.ps1 01_smoke                         # PowerShell   (or ./run.sh 01_smoke)
.\run.ps1 04_read_mix -Step 1m             # shorter steps
```
Live dashboard while it runs: <http://localhost:5665>. HTML report and JSON summary
are saved in `results/`. **Ctrl+C is the kill switch.** If the backend wedges:
`docker compose restart backend` on the VPS.

> **Warning:** your local dev backend (`localhost:8081`) connects to the SAME
> Supabase database as production (see its JDBC URL). Do not point tests at local dev
> unless you have a separate database; the seed and the test traffic land in that DB.

## Order
| Run | Scenario | What it answers |
|---|---|---|
| 1 | `01_smoke` | Seed, credentials, endpoints, WebSocket frames all work. **Must pass first.** |
| 2 | `02_public_reads` | Ceiling of nginx + Tomcat with no database (cached `GET /colleges`) |
| 3 | `03_login_storm` | Logins/second before bcrypt CPU saturates |
| 4 | `04_read_mix` | Concurrent students browsing; Tomcat threads + DB pool (20) |
| 5 | `05_seriousness` | Heaviest write burst (test start = ~27 inserts, 25 answers) |
| 6 | `06_matching` | Everyone taps Find Peers; row locks, scheduler sweep. **Creates the rooms 07/08/10/13 need.** |
| 7 | `07_chat_rest` | Chat send/history/read over REST |
| 8 | `08_websocket` | Max concurrent WebSocket/STOMP connections |
| 9 | `09_refresh_storm` | Token rotation under concurrency + reuse detection |
| 10 | `10_abuse` | Garbage tokens, bad JSON, wrong verbs, oversized input, rate limit hammer; **any 5xx is a bug** |
| 11 | `11_spike` | 0 → 800 users in 10 s; does it recover by itself? |
| 12 | `12_soak` | 45 min at ~50% of capacity; leaks / slow degradation |
| 13 | `13_breaking_point` | Everything at once, stepping up until it falls over. **Last, at 3–4 AM.** |

Leave 5–10 minutes between runs so caches, the JVM and the DB pool settle; restart the
backend between runs if a previous one left it degraded.

## Reading the result
Definitions used everywhere:
- **Safe capacity**: highest step where p95 < 800 ms and errors < 1 %.
- **Degraded**: p95 < 3 s and errors < 5 %.
- **Breaking point**: sustained errors > 10 %, or the health canary fails, or the container restarts.

Scenario 13's steps are 3 min each; step N starts `(N-1) × 3 min` after launch. Read
error rate / p95 from the dashboard against that clock. The canary
(`health_ok`, `health_down_checks`) shows the second the backend stopped answering.
Fill in `RESULTS.md` as you go.

Useful custom metrics: `rate_limited_429`, `server_errors_5xx`, `ws_stomp_connected`,
`ws_stomp_connect_failed`, `ws_echo_latency_ms`, `health_ok`.

What to look for on the server while a run is in progress:
| Symptom | Likely cause |
|---|---|
| backend RESTARTS increments, `OOMKilled` | 500 MB container / ~375 MB heap too small |
| `HikariPool … Connection is not available` in logs | DB pool (20) exhausted |
| latency climbs, CPU pinned on login runs | bcrypt |
| WebSocket connects fail near ~500 | nginx `worker_connections` (default 1024) or fd limits |
| cache misses, odd rate-limit behaviour | Redis `maxmemory 128mb` eviction |
| errors but CPU/memory fine | Supabase connection/CPU limits |

## Cleanup (always do this after)
Run `seed/cleanup.sql` in the Supabase SQL editor. It deletes the test users, and
their chats, groups, notifications and the test college, and prints
`users_left / colleges_left` (both must be 0). The app's own "delete account" is
not enough: it leaves match groups and chat rooms behind.

## Safety notes
- The seeded emails end in `.invalid`, which can never receive mail.
- Test traffic is confined to the "LoadTest College"; matching is per-college, so real
  students are never matched into test groups.
- Login uses a random `X-Forwarded-For` to bypass the 10/hour/IP limit. That works
  because the backend trusts the first entry of that header. It is a real rate-limit
  bypass; fix it (trust only nginx's appended value) after you have your numbers.
- Never submit the seriousness test with seeded users (30-day retake lock);
  scenario 05 resets instead.
