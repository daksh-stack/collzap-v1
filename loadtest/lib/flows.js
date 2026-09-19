import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { API, jsonHeaders } from './config.js';

export const rateLimited = new Counter('rate_limited_429');

function get(user, path, name) {
  const res = http.get(`${API}${path}`, { headers: jsonHeaders(user.accessToken), tags: { name: `GET ${name || path}` } });
  if (res.status === 429) rateLimited.add(1);
  return res;
}

function post(user, path, body, name) {
  const res = http.post(`${API}${path}`, body === undefined ? null : JSON.stringify(body), {
    headers: jsonHeaders(user.accessToken),
    tags: { name: `POST ${name || path}` },
  });
  if (res.status === 429) rateLimited.add(1);
  return res;
}

export { get, post };

/**
 * One realistic "student opens the app" session: home screen data, then wandering
 * between tabs with think time. `peers` is a list of other users' ids for profile views.
 */
export function readSession(user, peers, think = true) {
  const pause = (min, max) => think && sleep(min + Math.random() * (max - min));

  check(get(user, '/me'), { 'me 200': (r) => r.status === 200 });
  get(user, '/me/onboarding', '/me/onboarding');
  get(user, '/notifications/unread-count');
  pause(0.5, 2);

  get(user, '/interests/catalog');
  get(user, '/matches/circle');
  pause(1, 3);

  const chats = get(user, '/chats');
  check(chats, { 'chats 200': (r) => r.status === 200 });
  pause(1, 3);

  get(user, '/notifications');
  if (peers && peers.length) {
    const peer = peers[Math.floor(Math.random() * peers.length)];
    get(user, `/users/${peer}`, '/users/{id}');
  }
  get(user, '/colleges');
}

/** Heavy-ish chat REST session against rooms this user belongs to. */
export function chatSession(user, roomId, think = true) {
  get(user, `/chats/${roomId}`, '/chats/{room}');
  const hist = get(user, `/chats/${roomId}/messages?size=50`, '/chats/{room}/messages');
  check(hist, { 'history 200': (r) => r.status === 200 });
  const sent = post(user, `/chats/${roomId}/messages`, {
    content: `load test message ${Date.now()}`,
    clientMessageId: `lt-${__VU}-${__ITER}-${Date.now()}`,
  }, '/chats/{room}/messages');
  check(sent, { 'send 200/201/429': (r) => [200, 201, 429].includes(r.status) });
  post(user, `/chats/${roomId}/read`, undefined, '/chats/{room}/read');
  if (think) sleep(1 + Math.random() * 3);
}

/** Runs the matcher; returns the response so callers can inspect outcome. */
export function findMatches(user) {
  const res = post(user, '/matches/find', undefined, '/matches/find');
  check(res, { 'find 200/429': (r) => r.status === 200 || r.status === 429 });
  return res;
}
