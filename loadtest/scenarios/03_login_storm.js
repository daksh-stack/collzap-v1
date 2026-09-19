// Worst case for CPU: everyone logs in at once (e.g. a push notification lands, or
// a deploy invalidates sessions). Each login is a bcrypt verify (~60-100 ms CPU),
// so this finds the login/s the server can sustain. Random X-Forwarded-For per
// request gets around the 10/hour/IP limit (which is itself a bypass to fix).
import http from 'k6/http';
import { check } from 'k6';
import { API, USER_COUNT, PASSWORD, emailFor, randomIp, jsonHeaders, SAFE } from '../lib/config.js';
export { canary } from '../lib/canary.js';
import { canaryScenario } from '../lib/canary.js';

const STEP = __ENV.STEP || '2m';

export const options = {
  scenarios: {
    logins: {
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1500,
      stages: [5, 10, 20, 40, 80, 150].map((target) => ({ target, duration: STEP })),
    },
    canary: canaryScenario('12m30s'),
  },
  thresholds: { ...SAFE, http_req_duration: ['p(95)<1500'] },
};

export default function () {
  const i = 1 + Math.floor(Math.random() * USER_COUNT);
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({ email: emailFor(i), password: PASSWORD }),
    { headers: jsonHeaders(null, { 'X-Forwarded-For': randomIp() }), tags: { name: 'POST /auth/login' } },
  );
  check(res, { 'login 200': (r) => r.status === 200 });
}
