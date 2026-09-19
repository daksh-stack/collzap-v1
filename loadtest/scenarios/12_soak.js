// Steady load for a long time at ~50-60% of the capacity you found. Nothing should
// change over the hour. Watch on the server: `docker stats` memory creeping up (leak),
// Hikari "active" never returning to idle, latency slowly rising, Redis memory growth.
// Set SOAK_VUS to about half the VUs that were comfortable in scenario 04.
import { USER_COUNT, SAFE } from '../lib/config.js';
import { loginRange, pick } from '../lib/auth.js';
import { readSession } from '../lib/flows.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const SOAK_VUS = Number(__ENV.SOAK_VUS || 150);
const DURATION = __ENV.SOAK_DURATION || '45m';

export const options = {
  setupTimeout: '10m',
  scenarios: {
    soak: { executor: 'constant-vus', vus: SOAK_VUS, duration: DURATION },
    canary: canaryScenario(DURATION),
  },
  thresholds: SAFE,
};

export function setup() {
  return { users: loginRange(1, USER_COUNT) };
}

export default function ({ users }) {
  readSession(pick(users), users.map((u) => u.userId), true);
}
