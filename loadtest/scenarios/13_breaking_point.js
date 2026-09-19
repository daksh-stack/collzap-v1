// THE HEADLINE RUN. Everything at once, stepping up every STEP until the backend
// falls over: realistic browsing + chat REST + matching waves + live WebSockets.
// Needs rooms from scenario 06. Thresholds only MARK; the run never aborts itself.
// Stop it by hand (Ctrl+C) once the canary shows the backend is down or restarting.
//
// Reading the result: every step lasts STEP (default 3m) and step N begins at
// (N-1) x STEP after start. Line the k6 dashboard's error-rate / p95 charts up
// against that to see which step first crossed:
//   safe capacity   p95 < 800 ms  and errors < 1 %
//   degraded        p95 < 3 s     and errors < 5 %
//   breaking point  errors > 10 % sustained, or health canary failing, or a restart
import { USER_COUNT, LONG_TERM_COUNT } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { collectRooms } from '../lib/rooms.js';
import { readSession, chatSession, findMatches } from '../lib/flows.js';
import { stompSession } from '../lib/stomp.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '3m';
const steps = (targets) => targets.map((target) => ({ target, duration: STEP }));
const TOTAL = `${3 * 10 + 1}m`; // 10 steps of 3m + 1m slack; override with STEP if you change it

export const options = {
  setupTimeout: '15m',
  scenarios: {
    browsing: {          // sessions per second (each session is ~10 requests)
      executor: 'ramping-arrival-rate', startRate: 3, timeUnit: '1s',
      preAllocatedVUs: 200, maxVUs: 6000, exec: 'browsing',
      stages: steps([5, 10, 20, 35, 50, 70, 90, 120, 150, 200]),
    },
    chatting: {          // chat REST sessions per second
      executor: 'ramping-arrival-rate', startRate: 1, timeUnit: '1s',
      preAllocatedVUs: 100, maxVUs: 3000, exec: 'chatting',
      stages: steps([2, 4, 8, 14, 20, 30, 40, 55, 70, 90]),
    },
    matching: {          // people tapping "Find peers"
      executor: 'ramping-arrival-rate', startRate: 1, timeUnit: '1s',
      preAllocatedVUs: 50, maxVUs: 800, exec: 'matching',
      stages: steps([1, 2, 4, 6, 8, 12, 16, 20, 25, 30]),
    },
    sockets: {           // live WebSocket connections held open
      executor: 'ramping-vus', startVUs: 50, exec: 'sockets', gracefulRampDown: '30s',
      stages: steps([100, 200, 300, 450, 600, 800, 1000, 1300, 1600, 2000]),
    },
    canary: canaryScenario(TOTAL),
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
    health_ok: ['rate>0.99'],
  },
};

export function setup() {
  const pool = loginRange(LONG_TERM_COUNT + 1, USER_COUNT);
  return { pool, rooms: collectRooms(pool), ids: pool.map((u) => u.userId) };
}

export function browsing({ pool, ids }) {
  readSession(pool[Math.floor(Math.random() * pool.length)], ids, false);
}

export function chatting({ rooms }) {
  const { user, roomId } = rooms[Math.floor(Math.random() * rooms.length)];
  chatSession(user, roomId, false);
}

export function matching({ pool }) {
  findMatches(pool[Math.floor(Math.random() * pool.length)]);
}

export function sockets({ rooms }) {
  const { user, roomId } = rooms[(__VU - 1) % rooms.length];
  stompSession({
    token: user.accessToken,
    destinations: [`/topic/rooms/${roomId}`, '/user/queue/notifications', '/user/queue/errors'],
    holdMs: 170000,
    onReady: (s) => s.every(8000 + Math.floor(Math.random() * 2000), () => s.send(roomId, `bp ${Date.now()}`)),
  });
}
