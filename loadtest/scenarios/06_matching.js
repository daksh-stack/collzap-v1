// Matching under contention: everyone in the pool taps "Find peers" in waves, then
// polls the circle like the waiting screen does. All users share ONE college, so
// they compete for the same groups and take the same row locks (findByIdForUpdate),
// and the 30-second MatchingScheduler sweep runs over all the WAITING groups.
//
// RUN THIS BEFORE 07/08/13: it creates the groups and chat rooms they use.
import { sleep } from 'k6';
import { USER_COUNT, LONG_TERM_COUNT, SAFE } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { findMatches, get } from '../lib/flows.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '2m';
const POOL_FROM = LONG_TERM_COUNT + 1;
const POOL_SIZE = USER_COUNT - LONG_TERM_COUNT;

export const options = {
  setupTimeout: '10m',
  scenarios: {
    waves: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [50, 100, 200, Math.min(400, POOL_SIZE)].map((target) => ({
        target: Math.min(target, POOL_SIZE),
        duration: STEP,
      })),
      gracefulRampDown: '20s',
    },
    canary: canaryScenario('8m30s'),
  },
  thresholds: SAFE,
};

export function setup() {
  return { users: loginRange(POOL_FROM, USER_COUNT) };
}

export default function ({ users }) {
  const user = users[(__VU - 1) % users.length];
  findMatches(user);
  // the waiting screen polls; 10 s here (the real client polls every ~30 s)
  for (let n = 0; n < 3; n++) {
    sleep(10);
    get(user, '/matches/circle');
  }
}
