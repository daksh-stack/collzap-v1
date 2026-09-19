// Normal use: N students each browsing the app with think time between taps.
// Stresses Tomcat threads and the Hikari pool (20 connections) with plain reads.
import { USER_COUNT, SAFE } from '../lib/config.js';
import { loginRange, pick } from '../lib/auth.js';
import { readSession } from '../lib/flows.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '3m';

export const options = {
  setupTimeout: '10m',
  scenarios: {
    browsing: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [50, 100, 200, 400, 800, 1200, 1500].map((target) => ({ target, duration: STEP })),
      gracefulRampDown: '30s',
    },
    canary: canaryScenario('21m'),
  },
  thresholds: SAFE,
};

export function setup() {
  return { users: loginRange(1, USER_COUNT) };
}

export default function ({ users }) {
  const user = pick(users);
  readSession(user, users.map((u) => u.userId), true);
}
