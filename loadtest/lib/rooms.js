import http from 'k6/http';
import { fail } from 'k6';
import { API, jsonHeaders } from './config.js';

// For chat scenarios: finds, for each logged-in user, one chat room they belong to.
// Rooms only exist after scenario 06 (matching) has run, so fail loudly if there are none.
export function collectRooms(users, batchSize = 20) {
  const entries = [];
  for (let start = 0; start < users.length; start += batchSize) {
    const slice = users.slice(start, start + batchSize);
    const responses = http.batch(
      slice.map((u) => ['GET', `${API}/chats`, null, { headers: jsonHeaders(u.accessToken), tags: { name: 'GET /chats (setup)' } }]),
    );
    responses.forEach((res, k) => {
      if (res.status !== 200) return;
      const rooms = res.json();
      const list = Array.isArray(rooms) ? rooms : rooms.content || [];
      if (list.length) entries.push({ user: slice[k], roomId: list[0].chatRoomId });
    });
  }
  if (entries.length === 0) {
    fail('No chat rooms found for the seeded users. Run scenarios/06_matching.js first so groups open.');
  }
  return entries;
}
