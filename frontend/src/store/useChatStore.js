import { create } from 'zustand';
import { api } from '../api/api';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set) => ({
  chatList: [],
  currentRoom: null,
  rooms: {}, // Map of roomId -> ChatRoomDetailResponse
  messages: {}, // Map of roomId -> ChatMessageResponse[]
  systemEvents: {}, // Map of roomId -> [{ id, name, at }] from MEMBER_JOINED
  pagination: {}, // Map of roomId -> { page, totalPages, last }
  loading: false,
  sending: false,
  error: null,

  fetchChatList: async () => {
    set({ loading: true, error: null });
    try {
      const chatList = await api.get('/chats');
      set({ chatList: Array.isArray(chatList) ? chatList : [], loading: false });
      return chatList;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchRoom: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const currentRoom = await api.get(`/chats/${roomId}`);
      set((state) => ({
        currentRoom,
        rooms: {
          ...state.rooms,
          [roomId]: currentRoom
        },
        loading: false
      }));
      return currentRoom;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMessages: async (roomId, page = 0) => {
    set({ loading: page === 0, error: null }); // Only set loading for initial fetch
    try {
      const response = await api.get(`/chats/${roomId}/messages?page=${page}`);
      
      set((state) => {
        const existingMessages = state.messages[roomId] || [];
        
        // Response content is newest first usually, but check endpoint comments:
        // "Within a page messages run oldest to newest so the client can prepend"
        // Let's assume we prepend the new page if we are fetching older history
        const newMessages = page === 0 
          ? response.content 
          : [...response.content, ...existingMessages]; // Assuming page > 0 is older

        return {
          messages: {
            ...state.messages,
            [roomId]: newMessages
          },
          pagination: {
            ...state.pagination,
            [roomId]: {
              page: response.page,
              totalPages: response.totalPages,
              last: response.last
            }
          },
          loading: false
        };
      });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  sendMessage: async (roomId, content, clientMessageId = null) => {
    set({ sending: true, error: null });
    try {
      const cid = clientMessageId || `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const payload = { content, clientMessageId: cid };
      const response = await api.post(`/chats/${roomId}/messages`, payload);
      
      set((state) => {
        const roomMessages = state.messages[roomId] || [];
        const alreadyPresentIndex = roomMessages.findIndex(m =>
          (m.id && response.id && m.id === response.id) ||
          (m.clientMessageId && cid && m.clientMessageId === cid)
        );

        // The room's own WebSocket broadcast (mine always false — it's built
        // viewer-neutral so every subscriber gets the same payload) can beat
        // this REST response back to the client, since it's sent server-side
        // before the HTTP response is even written. If that already inserted
        // this message, replace it with this authoritative response (real
        // `mine`, receipt tick) instead of leaving the broadcast's copy in
        // place until a reload re-fetches it correctly.
        if (alreadyPresentIndex !== -1) {
          const next = [...roomMessages];
          next[alreadyPresentIndex] = response;
          return {
            messages: { ...state.messages, [roomId]: next },
            sending: false
          };
        }

        return {
          messages: {
            ...state.messages,
            [roomId]: [...roomMessages, response]
          },
          sending: false
        };
      });
      
      return response;
    } catch (error) {
      set({ error: error.message, sending: false });
      throw error;
    }
  },

  markRead: async (roomId) => {
    try {
      return await api.post(`/chats/${roomId}/read`);
    } catch (error) {
      console.warn("Failed to mark read", error);
    }
  },

  markDelivered: async (roomId) => {
    try {
      return await api.post(`/chats/${roomId}/delivered`);
    } catch (error) {
      console.warn("Failed to mark delivered", error);
    }
  },

  // Local actions to be called from the WebSocket subscriber
  addIncomingMessage: (roomId, message) => {
    if (!message) return;

    // The socket broadcast is built viewer-neutral (same payload for every
    // subscriber), so its `mine` is always false — including for the
    // sender's own subscription. Recompute it against the actual logged-in
    // user so a message that arrives here (rather than via sendMessage's
    // REST response) still lands on the right side instead of the left.
    const myId = useAuthStore.getState().user?.id;
    const normalized = myId && message.senderId === myId ? { ...message, mine: true } : message;

    set((state) => {
      const roomMessages = state.messages[roomId] || [];

      // Strict deduplication against optimistic or previously received messages
      const duplicateIndex = roomMessages.findIndex(m =>
        (m.id && normalized.id && m.id === normalized.id) ||
        (m.clientMessageId && normalized.clientMessageId && m.clientMessageId === normalized.clientMessageId) ||
        (m.content === normalized.content && m.senderId === normalized.senderId && Math.abs(new Date(m.sentAt) - new Date(normalized.sentAt)) < 2000)
      );

      if (duplicateIndex !== -1) {
        // If sendMessage's REST response already landed here, it's the
        // authoritative copy (real receipt tick, `mine`) — this viewer-neutral
        // broadcast only fills in anything it might be missing, never
        // overwrites it with the broadcast's blank tick/receiptStatus.
        const next = [...roomMessages];
        next[duplicateIndex] = { ...normalized, ...next[duplicateIndex] };
        return { messages: { ...state.messages, [roomId]: next } };
      }

      return {
        messages: {
          ...state.messages,
          [roomId]: [...roomMessages, normalized]
        }
      };
    });
  },

  // MEMBER_JOINED lands here, never in messages[] — it is not a chat bubble.
  addSystemEvent: (roomId, member, at) => {
    if (!member) return;
    set((state) => {
      const existing = state.systemEvents[roomId] || [];
      if (existing.some((e) => e.id === member.userId)) return state;
      return {
        systemEvents: {
          ...state.systemEvents,
          [roomId]: [...existing, { id: member.userId, name: member.name, at }],
        },
      };
    });
  },

  updateReceipt: (roomId, update) => {
    set((state) => {
      const roomMessages = state.messages[roomId] || [];
      // Update the receipt status of matching messages
      const updatedMessages = roomMessages.map(msg => {
        if (msg.senderId !== update.userId && new Date(msg.sentAt) <= new Date(update.upTo)) {
          return { ...msg, receiptStatus: update.status };
        }
        return msg;
      });

      return {
        messages: {
          ...state.messages,
          [roomId]: updatedMessages
        }
      };
    });
  }
}));
