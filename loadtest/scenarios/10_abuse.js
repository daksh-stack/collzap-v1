// Hostile and sloppy traffic. None of this should ever produce a 500 or hurt normal
// users. Each check encodes the EXPECTED status; a 500 anywhere is a bug to fix.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { API, BASE_URL, USER_COUNT, LONG_TERM_COUNT, jsonHeaders, randomIp } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { collectRooms } from '../lib/rooms.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const serverErrors = new Counter('server_errors_5xx');
const note = (res) => { if (res.status >= 500) serverErrors.add(1); return res; };
const expect = (...codes) => ({ responseCallback: http.expectedStatuses(...codes) });

export const options = {
  setupTimeout: '10m',
  scenarios: {
    bad_tokens: { executor: 'constant-arrival-rate', rate: 200, timeUnit: '1s', duration: '2m', preAllocatedVUs: 50, maxVUs: 400, exec: 'badTokens' },
    malformed: { executor: 'constant-vus', vus: 10, duration: '2m', exec: 'malformed' },
    oversized: { executor: 'constant-vus', vus: 10, duration: '2m', exec: 'oversized' },
    limit_hammer: { executor: 'per-vu-iterations', vus: 5, iterations: 1, maxDuration: '3m', exec: 'limitHammer' },
    canary: canaryScenario('3m'),
  },
  thresholds: { server_errors_5xx: ['count==0'], checks: ['rate>0.99'] },
};

export function setup() {
  return { rooms: collectRooms(loginRange(LONG_TERM_COUNT + 1, LONG_TERM_COUNT + 30)) };
}

// Garbage / expired / missing JWTs against protected endpoints: cheap 401s, no DB.
export function badTokens() {
  const headers = [
    { Authorization: 'Bearer not.a.jwt' },
    { Authorization: 'Bearer ' + 'a'.repeat(2000) },
    { Authorization: 'Basic abc' },
    {},
  ];
  const h = headers[Math.floor(Math.random() * headers.length)];
  const res = note(http.get(`${API}/me`, { headers: h, tags: { name: 'GET /me (bad token)' }, ...expect(401, 403) }));
  check(res, { 'bad token -> 401/403': (r) => r.status === 401 || r.status === 403 });
}

// Wrong verbs, wrong content types, broken JSON, unknown paths: expect 4xx, never 5xx.
export function malformed() {
  const post = (url, body, headers = {}, ...ok) => note(http.post(url, body, {
    headers: { 'X-Forwarded-For': randomIp(), ...headers }, tags: { name: 'malformed' }, ...expect(...ok),
  }));
  check(post(`${API}/auth/login`, '{not json', { 'Content-Type': 'application/json' }, 400), { 'broken JSON -> 400': (r) => r.status === 400 });
  check(post(`${API}/auth/login`, 'x=1', { 'Content-Type': 'text/plain' }, 415, 400), { 'text/plain -> 415/400': (r) => r.status === 415 || r.status === 400 });
  check(note(http.get(`${API}/auth/login`, { tags: { name: 'malformed' }, ...expect(405) })), { 'GET login -> 405': (r) => r.status === 405 });
  check(note(http.get(`${API}/does-not-exist`, { tags: { name: 'malformed' }, ...expect(401, 403, 404) })), { 'unknown path -> 4xx': (r) => r.status >= 400 && r.status < 500 });
  check(post(`${API}/upload`, JSON.stringify({ a: 1 }), { 'Content-Type': 'application/json' }, 401, 403, 415), { 'upload wrong type -> 4xx': (r) => r.status >= 400 && r.status < 500 });
  sleep(0.5);
}

// Big-but-legal and too-big inputs on chat and pagination.
export function oversized({ rooms }) {
  const { user, roomId } = rooms[(__VU - 1) % rooms.length];
  const h = jsonHeaders(user.accessToken);
  const send = (content, ...ok) => note(http.post(`${API}/chats/${roomId}/messages`, JSON.stringify({ content }), { headers: h, tags: { name: 'chat send (size test)' }, ...expect(...ok) }));
  check(send('x'.repeat(4000), 200, 201, 429), { '4000 chars accepted': (r) => [200, 201, 429].includes(r.status) });
  check(send('x'.repeat(4001), 400), { '4001 chars -> 400': (r) => r.status === 400 });
  check(send('   ', 400), { 'blank -> 400': (r) => r.status === 400 });
  // Does the server cap page size? A 100000 page on a busy room would be an easy DoS.
  const big = note(http.get(`${API}/chats/${roomId}/messages?size=100000`, { headers: h, tags: { name: 'GET messages size=100000' }, ...expect(200, 400) }));
  check(big, { 'huge page -> 200/400 (not 5xx)': (r) => r.status === 200 || r.status === 400 });
  note(http.get(`${API}/notifications?size=100000`, { headers: h, tags: { name: 'GET notifications size=100000' }, ...expect(200, 400) }));
  sleep(1);
}

// One user blasting the per-user chat limit (30/min): expect 429 with a wait time
// and a Retry-After header, and other users unaffected.
export function limitHammer({ rooms }) {
  const { user, roomId } = rooms[(__VU - 1) % rooms.length];
  let limited = 0;
  for (let n = 0; n < 60; n++) {
    const res = note(http.post(`${API}/chats/${roomId}/messages`, JSON.stringify({ content: `hammer ${n}` }), {
      headers: jsonHeaders(user.accessToken), tags: { name: 'chat send (hammer)' }, ...expect(200, 201, 429),
    }));
    if (res.status === 429) {
      limited++;
      if (limited === 1) {
        check(res, {
          '429 mentions seconds/minutes': (r) => /second|minute|hour/.test(r.body),
          '429 has Retry-After': (r) => !!r.headers['Retry-After'],
        });
      }
    }
  }
  check(limited, { 'limit engaged (>=1 429)': (n) => n >= 1 });
}
