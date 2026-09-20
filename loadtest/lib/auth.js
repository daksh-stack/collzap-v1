import http from 'k6/http';
import { check, fail } from 'k6';
import { API, PASSWORD, emailFor, randomIp, jsonHeaders } from './config.js';

// 429 (per-user rate limits) and 409 are expected outcomes in some flows, not failures.
// 401 is deliberately NOT expected: on a normal flow it means a real auth problem.
http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 409, 429));

export function login(i) {
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({ email: emailFor(i), password: PASSWORD }),
    { headers: jsonHeaders(null, { 'X-Forwarded-For': randomIp() }), tags: { name: 'POST /auth/login' } },
  );
  if (res.status !== 200) return null;
  const body = res.json();
  return {
    i,
    userId: body.user && body.user.id,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
  };
}

// Logs in users [from..to] in parallel batches. This runs once in setup(),
// BEFORE the VU ramp starts, so the dashboard shows 0 VUs the whole time it's
// working — that is expected, not a hang. batchSize=25 balances two things:
// too small and setup itself becomes the slowest part of the whole test (each
// batch pays one full network round-trip to production); too large and the
// login burst becomes its own accidental login-storm test. A 10s per-request
// timeout means one slow/stuck login fails fast instead of stalling its whole
// batch for k6's 60s default.
export function loginRange(from, to, batchSize = 25) {
  const out = [];
  const total = to - from + 1;
  const started = Date.now();
  console.log(`[setup] logging in ${total} users (${from}..${to})...`);
  for (let start = from; start <= to; start += batchSize) {
    const reqs = [];
    for (let i = start; i < Math.min(start + batchSize, to + 1); i++) {
      reqs.push([
        'POST',
        `${API}/auth/login`,
        JSON.stringify({ email: emailFor(i), password: PASSWORD }),
        {
          headers: jsonHeaders(null, { 'X-Forwarded-For': randomIp() }),
          tags: { name: 'POST /auth/login' },
          timeout: '10s',
        },
      ]);
    }
    const responses = http.batch(reqs);
    responses.forEach((res, k) => {
      if (res.status === 200) {
        const body = res.json();
        out.push({
          i: start + k,
          userId: body.user && body.user.id,
          accessToken: body.accessToken,
          refreshToken: body.refreshToken,
        });
      }
    });
    const done = Math.min(start + batchSize - 1, to) - from + 1;
    console.log(`[setup] login progress: ${done}/${total} (${out.length} succeeded so far)`);
  }
  if (out.length === 0) {
    fail('Could not log in any seeded user. Did you run loadtest/seed/seed.sql? Are BASE_URL / LT_PASSWORD right?');
  }
  check(out, { 'all requested users logged in': (o) => o.length === total });
  console.log(`[setup] login done: ${out.length}/${total} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return out;
}

export const authed = (user, name) => ({
  headers: jsonHeaders(user.accessToken),
  tags: name ? { name } : undefined,
});

// Picks a stable user for this VU/iteration from a pool.
export const pick = (pool, offset = 0) => pool[(__VU + offset) % pool.length];
