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

// Logs in users [from..to] with modest parallelism (bcrypt is CPU heavy on the
// server; a big burst here would itself be a load test). Call from setup().
export function loginRange(from, to, batchSize = 8) {
  const out = [];
  for (let start = from; start <= to; start += batchSize) {
    const reqs = [];
    for (let i = start; i < Math.min(start + batchSize, to + 1); i++) {
      reqs.push([
        'POST',
        `${API}/auth/login`,
        JSON.stringify({ email: emailFor(i), password: PASSWORD }),
        { headers: jsonHeaders(null, { 'X-Forwarded-For': randomIp() }), tags: { name: 'POST /auth/login' } },
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
  }
  if (out.length === 0) {
    fail('Could not log in any seeded user. Did you run loadtest/seed/seed.sql? Are BASE_URL / LT_PASSWORD right?');
  }
  check(out, { 'all requested users logged in': (o) => o.length === to - from + 1 });
  return out;
}

export const authed = (user, name) => ({
  headers: jsonHeaders(user.accessToken),
  tags: name ? { name } : undefined,
});

// Picks a stable user for this VU/iteration from a pool.
export const pick = (pool, offset = 0) => pool[(__VU + offset) % pool.length];
