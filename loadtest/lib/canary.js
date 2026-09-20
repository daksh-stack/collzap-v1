import http from 'k6/http';
import { sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL } from './config.js';

export const healthOk = new Rate('health_ok');
export const healthDown = new Counter('health_down_checks');
export const healthMs = new Trend('health_ms', true);

// A single VU that polls the liveness probe every 2 s for the whole run. The moment
// it stops answering 200 is the moment the backend stopped being able to serve.
//
// Deliberately /actuator/health/liveness rather than /actuator/health: the latter
// runs a database validation query, so it queues for a Hikari connection like any
// other request and reports "down" whenever the pool is merely busy. That is what
// produced the 1.3% reading in the soak test while the app was still answering
// requests, and it measures pool saturation, not whether the server is up.
export function canary() {
  const res = http.get(`${BASE_URL}/actuator/health/liveness`, {
    timeout: '5s',
    tags: { name: 'canary /actuator/health/liveness' },
    responseCallback: http.expectedStatuses({ min: 200, max: 599 }),
  });
  const ok = res.status === 200;
  healthOk.add(ok);
  if (!ok) healthDown.add(1);
  healthMs.add(res.timings.duration);
  sleep(2);
}

/** Drop this into a scenario's `scenarios` map. `duration` should cover the whole run. */
export const canaryScenario = (duration) => ({
  executor: 'constant-vus',
  vus: 1,
  duration,
  exec: 'canary',
  tags: { role: 'canary' },
});
