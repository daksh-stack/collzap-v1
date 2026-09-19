// Chat over REST: open a room, page through history, send a message, mark read.
// Each send is a DB write plus one receipt and one notification per recipient.
// Needs rooms from scenario 06.
import { USER_COUNT, LONG_TERM_COUNT, SAFE } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { collectRooms } from '../lib/rooms.js';
import { chatSession } from '../lib/flows.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '2m';

export const options = {
  setupTimeout: '10m',
  scenarios: {
    chatting: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [25, 50, 100, 200, 400, 600].map((target) => ({ target, duration: STEP })),
      gracefulRampDown: '20s',
    },
    canary: canaryScenario('12m30s'),
  },
  thresholds: SAFE,
};

export function setup() {
  return { rooms: collectRooms(loginRange(LONG_TERM_COUNT + 1, USER_COUNT)) };
}

export default function ({ rooms }) {
  const { user, roomId } = rooms[(__VU - 1) % rooms.length];
  chatSession(user, roomId, true);
}
