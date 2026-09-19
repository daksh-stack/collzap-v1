import http from 'k6/http';
import { sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL } from './config.js';

export const healthOk = new Rate('health_ok');
export const healthDown = new Counter('health_down_checks');
export const healthMs = new Trend('health_ms', true);

// A single VU that polls /actuator/health every 2 s for the whole run. The moment
// it stops answering 200 is the moment the backend stopped being able to serve.
export function canary() {
  const res = http.get(`${BASE_URL}/actuator/health`, {
    timeout: '5s',
    tags: { name: 'canary /actuator/health' },
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
