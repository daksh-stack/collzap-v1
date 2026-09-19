// Unauthenticated, cached read: GET /api/colleges (Redis-backed). No database work
// on a warm cache, so this measures the ceiling of nginx + Tomcat + JSON alone.
import http from 'k6/http';
import { check } from 'k6';
import { API, SAFE } from '../lib/config.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '1m';

export const options = {
  scenarios: {
    reads: {
      executor: 'ramping-arrival-rate',
      startRate: 100,
      timeUnit: '1s',
      preAllocatedVUs: 300,
      maxVUs: 4000,
      stages: [100, 250, 500, 1000, 1500, 2000, 3000].map((target) => ({ target, duration: STEP })),
    },
    canary: canaryScenario('8m'),
  },
  thresholds: SAFE,
};

export default function () {
  const res = http.get(`${API}/colleges`, { tags: { name: 'GET /colleges' } });
  check(res, { 'colleges 200': (r) => r.status === 200 });
}
