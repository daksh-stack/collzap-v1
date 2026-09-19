// Refresh-token rotation under concurrency (the B05 change).
//   chain:  each VU refreshes in a loop, always using the newest token -> must stay 200.
//   race:   3 parallel refreshes with the SAME token (two tabs) -> all 200 inside the
//           30 s grace window, no false lock-out.
//   replay: a rotated token replayed after the grace window -> 401, and ALL of that
//           user's sessions are revoked (so even the newest token then fails).
// Uses dedicated users at the top of the range so a revoked session never affects
// other scenarios; they log in again in setup() each run.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { API, USER_COUNT, jsonHeaders, SAFE } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const raceUnexpected = new Counter('refresh_race_unexpected');
const replayNotRevoked = new Counter('refresh_replay_not_revoked');

const FROM = Math.max(1, USER_COUNT - 59); // last 60 users

export const options = {
  setupTimeout: '5m',
  scenarios: {
    chain: { executor: 'constant-vus', vus: 30, duration: '3m', exec: 'chain' },
    race: { executor: 'constant-vus', vus: 10, duration: '3m', exec: 'race', startTime: '0s' },
    replay: { executor: 'per-vu-iterations', vus: 10, iterations: 1, maxDuration: '3m', exec: 'replay' },
    canary: canaryScenario('3m'),
  },
  thresholds: { ...SAFE, refresh_race_unexpected: ['count==0'], refresh_replay_not_revoked: ['count==0'] },
};

export function setup() {
  return { users: loginRange(FROM, USER_COUNT) };
}

const refresh = (token) =>
  http.post(`${API}/auth/refresh`, JSON.stringify({ refreshToken: token }), {
    headers: jsonHeaders(),
    tags: { name: 'POST /auth/refresh' },
  });

let chainToken; // per-VU (each VU has its own JS context)

export function chain({ users }) {
  const user = users[(__VU - 1) % 30];
  if (!chainToken) chainToken = user.refreshToken;
  const res = refresh(chainToken);
  if (check(res, { 'chain refresh 200': (r) => r.status === 200 })) {
    chainToken = res.json('refreshToken');
  } else {
    chainToken = undefined; // fell off the chain: start over from the setup token
  }
  sleep(1);
}

let raceToken;
export function race({ users }) {
  const user = users[30 + ((__VU - 1) % 10)];
  if (!raceToken) raceToken = user.refreshToken;
  const responses = http.batch([0, 1, 2].map(() => [
    'POST', `${API}/auth/refresh`, JSON.stringify({ refreshToken: raceToken }),
    { headers: jsonHeaders(), tags: { name: 'POST /auth/refresh (race)' } },
  ]));
  responses.forEach((r) => { if (r.status !== 200) raceUnexpected.add(1); });
  const ok = responses.find((r) => r.status === 200);
  if (ok) raceToken = ok.json('refreshToken');
  sleep(5);
}

export function replay({ users }) {
  const user = users[40 + ((__VU - 1) % 10)];
  const first = refresh(user.refreshToken); // rotates: user.refreshToken is now revoked
  if (first.status !== 200) return;
  const newest = first.json('refreshToken');
  sleep(35); // outlive the 30 s grace window
  const replayed = refresh(user.refreshToken);
  check(replayed, { 'replayed old token rejected (401)': (r) => r.status === 401 });
  const after = refresh(newest);
  if (after.status === 200) replayNotRevoked.add(1); // reuse should have revoked everything
}
