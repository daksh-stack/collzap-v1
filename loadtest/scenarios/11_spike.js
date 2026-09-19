// A sudden crowd (a campus announcement, a WhatsApp forward): 0 -> SPIKE_VUS in
// 10 s, hold, drop to zero, then watch whether the backend RECOVERS by itself
// (Hikari pool draining, no stuck threads, no container restart).
import { USER_COUNT, SAFE } from '../lib/config.js';
import { loginRange, pick } from '../lib/auth.js';
import { readSession } from '../lib/flows.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const SPIKE_VUS = Number(__ENV.SPIKE_VUS || 800);

export const options = {
  setupTimeout: '10m',
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { target: 10, duration: '1m' },        // baseline
        { target: SPIKE_VUS, duration: '10s' },// the spike
        { target: SPIKE_VUS, duration: '2m' }, // hold
        { target: 10, duration: '10s' },       // crowd leaves
        { target: 10, duration: '3m' },        // recovery window: latency must return to baseline
      ],
      gracefulRampDown: '30s',
    },
    canary: canaryScenario('7m30s'),
  },
  thresholds: SAFE,
};

export function setup() {
  return { users: loginRange(1, USER_COUNT) };
}

export default function ({ users }) {
  readSession(pick(users), users.map((u) => u.userId), false);
}
