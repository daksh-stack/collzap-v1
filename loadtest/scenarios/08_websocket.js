// Concurrent WebSocket/STOMP connections, each subscribed to a room and chatting.
// Finds the max simultaneous sockets before nginx (worker_connections default 1024,
// two per proxied socket), the JVM or the in-memory broker gives out. There is NO
// server-side rate limit on WebSocket sends, so this is also the abuse ceiling.
// Needs rooms from scenario 06. Many sockets share a user; that is fine for load —
// this test cares about total open connections, not distinct identities, so setup()
// only logs in a couple hundred of the pool instead of all 500 (which was the real
// cause of "VUs stay at 0 for a long time": that login step runs once, up front,
// before the VU ramp starts, so the dashboard shows nothing while it works).
import { sleep } from 'k6';
import { LONG_TERM_COUNT } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { collectRooms } from '../lib/rooms.js';
import { stompSession } from '../lib/stomp.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '2m';
const HOLD_MS = Number(__ENV.WS_HOLD_MS || 110000);
const SEND_EVERY_MS = Number(__ENV.WS_SEND_EVERY_MS || 8000);

export const options = {
  setupTimeout: '10m',
  scenarios: {
    sockets: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [100, 250, 500, 750, 1000, 1500, 2000].map((target) => ({ target, duration: STEP })),
      gracefulRampDown: '30s',
    },
    canary: canaryScenario('15m'),
  },
  thresholds: {
    ws_stomp_connect_failed: ['count<5'],
    ws_echo_latency_ms: ['p(95)<1500'],
  },
};

const SETUP_POOL = LONG_TERM_COUNT + 200; // 200 distinct users is plenty to cycle through

export function setup() {
  return { rooms: collectRooms(loginRange(LONG_TERM_COUNT + 1, SETUP_POOL)) };
}

export default function ({ rooms }) {
  const { user, roomId } = rooms[(__VU - 1) % rooms.length];
  stompSession({
    token: user.accessToken,
    destinations: [`/topic/rooms/${roomId}`, '/user/queue/notifications', '/user/queue/errors'],
    holdMs: HOLD_MS,
    onReady: (session) => {
      session.every(SEND_EVERY_MS + Math.floor(Math.random() * 2000), () => {
        session.send(roomId, `ws load ${Date.now()}`);
      });
    },
  });
  sleep(1);
}
