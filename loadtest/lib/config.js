// Shared settings for every scenario. Override any of these with `-e NAME=value`.
//
//   BASE_URL   API origin, no trailing slash   (default: production)
//   USER_COUNT how many seeded users exist     (must match seed.sql)
//   LT_PASSWORD password given to seeded users (must match seed.sql)
//   ORIGIN     Origin header for the WebSocket (must be in COLLZAP_CORS_ALLOWED_ORIGINS)

export const BASE_URL = (__ENV.BASE_URL || 'https://api.collzap.com').replace(/\/$/, '');
export const API = `${BASE_URL}/api`;
export const WS_URL = (__ENV.WS_URL || BASE_URL.replace(/^http/, 'ws')) + '/ws/websocket';
export const ORIGIN = __ENV.ORIGIN || 'https://collzap.com';

export const USER_COUNT = Number(__ENV.USER_COUNT || 600);
export const PASSWORD = __ENV.LT_PASSWORD || 'LoadTest#2026';

// Users 1..LONG_TERM_COUNT have a long-term interest (seriousness test only).
// Users LONG_TERM_COUNT+1..USER_COUNT are short-term only and are the matching pool.
export const LONG_TERM_COUNT = Number(__ENV.LONG_TERM_COUNT || 100);

export const emailFor = (i) => `lt+${i}@loadtest.invalid`;

// Login is limited to 10/hour per IP, and the backend trusts the FIRST
// X-Forwarded-For entry (nginx appends the real IP after it), so a random value
// gets a fresh bucket. This is also a real rate-limit bypass worth fixing.
export function randomIp() {
  const o = () => 1 + Math.floor(Math.random() * 253);
  return `${o()}.${o()}.${o()}.${o()}`;
}

// A "safe capacity" step must stay inside these. They only MARK results; scenarios
// do not abort, because the goal is to find where it breaks.
export const SAFE = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<800'],
};

export const jsonHeaders = (token, extra = {}) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
});
