// The heaviest write burst in the app: starting a test inserts ~27 rows, then 25
// answers. We answer everything and then POST /test/reset (abandon) instead of
// submitting, because a submit starts a 30-day retake lock on the seeded user.
// Only users 1..LONG_TERM_COUNT have a long-term interest, so only they run this.
import { check, sleep } from 'k6';
import { LONG_TERM_COUNT, SAFE } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { get, post } from '../lib/flows.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '2m';

export const options = {
  setupTimeout: '5m',
  scenarios: {
    tests: {
      // VUs are capped at LONG_TERM_COUNT so each VU owns exactly one user.
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [10, 25, 50, LONG_TERM_COUNT].map((target) => ({ target: Math.min(target, LONG_TERM_COUNT), duration: STEP })),
      gracefulRampDown: '20s',
    },
    canary: canaryScenario('8m30s'),
  },
  thresholds: SAFE,
};

export function setup() {
  return { users: loginRange(1, LONG_TERM_COUNT) };
}

export default function ({ users }) {
  const user = users[(__VU - 1) % users.length];

  get(user, '/test/eligibility');
  const started = post(user, '/test/sessions', undefined, '/test/sessions');
  check(started, { 'session started (201/200) or locked (409)': (r) => [200, 201, 409].includes(r.status) });

  if (started.status === 200 || started.status === 201) {
    const questions = started.json().questions || [];
    for (const q of questions) {
      const ans = post(user, '/test/answers', { questionId: q.questionId, selectedOptionIndex: 0 }, '/test/answers');
      check(ans, { 'answer 200/429': (r) => r.status === 200 || r.status === 429 });
      sleep(0.2 + Math.random() * 0.6); // a person reads the question
    }
  }
  post(user, '/test/reset', undefined, '/test/reset');
  sleep(1);
}
