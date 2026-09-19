# Load test results

Date: ____  Server: ____ (VPS size)  Backend: mem_limit 500m, Hikari 20, heap ~375 MB (change if you altered any)
Runner: ____ (machine / network)   Commit tested: ____

## Per scenario
| # | Scenario | Peak load reached | p95 at peak | Error rate | First thing that broke | Notes |
|---|---|---|---|---|---|---|
| 01 | smoke | | | | | |
| 02 | public reads (req/s) | | | | | |
| 03 | login storm (logins/s) | | | | | |
| 04 | read mix (concurrent users) | | | | | |
| 05 | seriousness test (concurrent) | | | | | |
| 06 | matching (concurrent) | | | | | |
| 07 | chat REST (concurrent) | | | | | |
| 08 | websockets (concurrent sockets) | | | | | |
| 09 | refresh storm | | | | | |
| 10 | abuse (any 5xx?) | | | | | |
| 11 | spike (recovered? in how long) | | | | | |
| 12 | soak (memory trend, latency trend) | | | | | |

## Breaking-point run (13)
| Step | Starts at | Sessions/s | Sockets | p95 | Error % | Canary | Backend CPU / mem | DB conns |
|---|---|---|---|---|---|---|---|---|
| 1 | 0:00 | 5 | 100 | | | | | |
| 2 | 3:00 | 10 | 200 | | | | | |
| 3 | 6:00 | 20 | 300 | | | | | |
| 4 | 9:00 | 35 | 450 | | | | | |
| 5 | 12:00 | 50 | 600 | | | | | |
| 6 | 15:00 | 70 | 800 | | | | | |
| 7 | 18:00 | 90 | 1000 | | | | | |
| 8 | 21:00 | 120 | 1300 | | | | | |
| 9 | 24:00 | 150 | 1600 | | | | | |
| 10 | 27:00 | 200 | 2000 | | | | | |

- **Safe capacity** (p95 < 800 ms, errors < 1 %): ____
- **Degraded** (p95 < 3 s, errors < 5 %): ____
- **Breaking point**: step ____ — symptom: ____ (OOM kill / Hikari exhausted / CPU / nginx / Supabase)
- **Recovered on its own?** ____  in ____

## Fixes to try, then retest
- [ ] Raise `mem_limit` / set `-Xmx` explicitly
- [ ] Hikari pool size vs Supabase connection limit
- [ ] `spring.threads.virtual.enabled=true`
- [ ] nginx `worker_connections` + `ulimit -n`
- [ ] Rate limit for WebSocket sends
- [ ] Trust only nginx's appended `X-Forwarded-For` entry
- [ ] Cap `size` on `/chats/{room}/messages` and `/notifications` if scenario 10 showed it is unbounded
