import http from 'k6/http';
import { fail } from 'k6';
import { API, jsonHeaders } from './config.js';

// For chat scenarios: finds, for each logged-in user, one chat room they belong to.
// Rooms only exist after scenario 06 (matching) has run, so fail loudly if there are none.
// Also runs inside setup(), before any VUs start — see the note in loginRange.
export function collectRooms(users, batchSize = 40) {
  const entries = [];
  const started = Date.now();
  console.log(`[setup] checking ${users.length} users for a chat room...`);
  for (let start = 0; start < users.length; start += batchSize) {
    const slice = users.slice(start, start + batchSize);
    const responses = http.batch(
      slice.map((u) => [
        'GET', `${API}/chats`, null,
        { headers: jsonHeaders(u.accessToken), tags: { name: 'GET /chats (setup)' }, timeout: '10s' },
      ]),
    );
    responses.forEach((res, k) => {
      if (res.status !== 200) return;
      const rooms = res.json();
      const list = Array.isArray(rooms) ? rooms : rooms.content || [];
      if (list.length) entries.push({ user: slice[k], roomId: list[0].chatRoomId });
    });
    console.log(`[setup] rooms checked ${Math.min(start + batchSize, users.length)}/${users.length} (found ${entries.length} so far)`);
  }
  if (entries.length === 0) {
    fail('No chat rooms found for the seeded users. Run scenarios/06_matching.js first so groups open.');
  }
  console.log(`[setup] room discovery done: ${entries.length} rooms in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return entries;
}
