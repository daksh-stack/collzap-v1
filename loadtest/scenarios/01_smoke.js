// 1 VU, one pass over every kind of request. Run this first, against LOCAL
// (-e BASE_URL=http://host.docker.internal:8081) and then production, to prove the
// seed, credentials, endpoints and STOMP frames are right before any real load.
import { check } from 'k6';
import http from 'k6/http';
import { API, BASE_URL, USER_COUNT, LONG_TERM_COUNT, jsonHeaders } from '../lib/config.js';
import { loginRange } from '../lib/auth.js';
import { readSession, findMatches, get, post } from '../lib/flows.js';
import { stompSession } from '../lib/stomp.js';

export const options = {
  vus: 1,
  iterations: 1,
  setupTimeout: '2m',
  thresholds: { checks: ['rate>0.95'] },
};

export function setup() {
  // one long-term user (test flow) and two matching-pool users
  return { users: loginRange(1, 1).concat(loginRange(LONG_TERM_COUNT + 1, LONG_TERM_COUNT + 2)) };
}

export default function ({ users }) {
  const [longTerm, a, b] = users;
  const peers = [a.userId, b.userId];

  check(http.get(`${BASE_URL}/actuator/health`), { 'health 200': (r) => r.status === 200 });
  check(http.get(`${API}/colleges`), { 'colleges 200': (r) => r.status === 200 });

  readSession(a, peers, false);

  const found = findMatches(a);
  console.log(`matches/find -> ${found.status} ${found.body && found.body.slice(0, 200)}`);
  findMatches(b);

  // Seriousness test: eligibility + start + reset (never submit: it starts a 30-day lock)
  const elig = get(longTerm, '/test/eligibility');
  console.log(`test/eligibility -> ${elig.status} ${elig.body && elig.body.slice(0, 200)}`);
  const started = post(longTerm, '/test/sessions', undefined, '/test/sessions');
  console.log(`test/sessions -> ${started.status}`);
  if (started.status === 201 || started.status === 200) {
    const questions = (started.json().questions || []).slice(0, 2);
    questions.forEach((q) => {
      const ans = post(longTerm, '/test/answers', { questionId: q.questionId, selectedOptionIndex: 0 }, '/test/answers');
      check(ans, { 'answer ok': (r) => r.status === 200 });
    });
  }
  post(longTerm, '/test/reset', undefined, '/test/reset');

  // WebSocket handshake
  const chats = get(a, '/chats').json();
  const rooms = Array.isArray(chats) ? chats : chats.content || [];
  if (rooms.length) {
    stompSession({
      token: a.accessToken,
      destinations: [`/topic/rooms/${rooms[0].chatRoomId}`, '/user/queue/notifications'],
      holdMs: 4000,
      onReady: (s) => s.send(rooms[0].chatRoomId, 'smoke test'),
    });
  } else {
    console.log('No chat room yet (expected before scenario 06). WebSocket smoke skipped.');
  }
}
