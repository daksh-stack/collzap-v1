import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const WS_BASE = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws';

const DEV = import.meta.env.DEV;

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.pendingRooms = new Set();
    this.notificationsSub = null;
    this.wantNotifications = false;
    this.connectFailures = 0;
  }

  connect() {
    if (this.client && (this.client.connected || this.client.active)) {
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      if (DEV) console.warn('Cannot connect to WebSocket without token');
      return;
    }

    // SockJS fallback URL
    const socketUrl = WS_BASE;

    this.client = new Client({
      // Create a custom WebSocket factory to use SockJS
      webSocketFactory: () => new SockJS(socketUrl),
      // Read the token fresh on every (re)connect attempt instead of once at
      // construction time — otherwise the built-in reconnectDelay loop keeps
      // retrying with whatever token was current the first time forever,
      // even after it's refreshed elsewhere or the user logs out.
      beforeConnect: () => {
        const currentToken = useAuthStore.getState().accessToken;
        if (!currentToken) {
          this.client.deactivate();
          return;
        }
        this.client.connectHeaders = { Authorization: `Bearer ${currentToken}` };
      },
      debug: () => {}, // Disabled chatty STOMP logging
      reconnectDelay: 5000, // Reconnect automatically after 5 seconds
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      if (DEV) console.log('Connected to WebSocket server');
      this.connectFailures = 0;

      // Subscribe all pending rooms
      this.pendingRooms.forEach(roomId => {
        this._doSubscribe(roomId);
      });
      this.pendingRooms.clear();

      if (this.wantNotifications) this._doSubscribeNotifications();

      this.client.subscribe('/user/queue/errors', (message) => {
        if (DEV) console.warn('WebSocket error frame from server:', message.body);
      });
    };

    this.client.onStompError = (frame) => {
      if (DEV) {
        console.warn('Broker reported error:', frame.headers['message'], frame.body);
      }
      // The CONNECT frame is rejected when the token is invalid/expired
      // (StompAuthChannelInterceptor). A fresh token from beforeConnect
      // fixes most cases, but if it fails repeatedly in a row the access
      // token itself is stale — try one refresh instead of retrying every
      // 5s forever with a token that will never be accepted.
      this.connectFailures += 1;
      if (this.connectFailures >= 2) {
        this.connectFailures = 0;
        this.client?.deactivate();
        useAuthStore.getState().refresh()
          .then(() => this.connect())
          .catch(() => {
            if (DEV) console.warn('WebSocket: token refresh failed, giving up until next connect()');
          });
      }
    };

    this.client.onWebSocketClose = () => {
      if (DEV) console.log('WebSocket connection closed');
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.client.connected) {
      this.client.deactivate();
    }
    this.connectFailures = 0;
    this.subscriptions.clear();
    this.pendingRooms.clear();
    this.notificationsSub = null;
    this.wantNotifications = false;
  }

  /**
   * Personal notification queue. Payload is a NotificationResponse, not a
   * chat event — it goes to the notification store, never to the chat store.
   */
  subscribeNotifications() {
    this.wantNotifications = true;
    if (!this.client || !this.client.connected) return; // picked up in onConnect
    this._doSubscribeNotifications();
  }

  _doSubscribeNotifications() {
    if (this.notificationsSub) return;
    this.notificationsSub = this.client.subscribe('/user/queue/notifications', (message) => {
      try {
        const notification = JSON.parse(message.body);
        if (notification) {
          useNotificationStore.getState().addIncomingNotification(notification);
        }
      } catch (error) {
        if (DEV) console.warn('Bad notification frame', error);
      }
    });
  }

  unsubscribeNotifications() {
    this.wantNotifications = false;
    if (this.notificationsSub) {
      this.notificationsSub.unsubscribe();
      this.notificationsSub = null;
    }
  }

  subscribe(roomId) {
    if (!this.client || !this.client.connected) {
      this.pendingRooms.add(roomId);
      return;
    }
    this._doSubscribe(roomId);
  }

  _doSubscribe(roomId) {
    if (this.subscriptions.has(roomId)) {
      return;
    }

    const topic = `/topic/rooms/${roomId}`;
    if (DEV) console.log(`Subscribing to ${topic}`);

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        // ChatSocketEvent: { type, chatRoomId, payload, at }
        const event = JSON.parse(message.body);
        switch (event.type) {
          case 'MESSAGE':
            // payload is a ChatMessageResponse
            useChatStore.getState().addIncomingMessage(roomId, event.payload);
            break;
          case 'RECEIPT':
            // payload is { userId, status, upTo }
            useChatStore.getState().updateReceipt(roomId, event.payload);
            break;
          case 'MEMBER_JOINED':
            // payload is a MemberSummary. Never a text bubble — the store
            // records it separately so the room can show a system line.
            useChatStore.getState().addSystemEvent(roomId, event.payload, event.at);
            break;
          default:
            if (DEV) console.warn('Unhandled chat socket event type', event.type);
        }
      } catch (error) {
        if (DEV) console.warn('Error processing websocket message', error, message.body);
      }
    });

    this.subscriptions.set(roomId, subscription);
  }

  unsubscribe(roomId) {
    this.pendingRooms.delete(roomId);
    const subscription = this.subscriptions.get(roomId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(roomId);
      if (DEV) console.log(`Unsubscribed from room ${roomId}`);
    }
  }

  send(roomId, destination, body) {
    if (!this.client || !this.client.connected) {
        if (DEV) console.warn("Cannot send message, WebSocket not connected");
        return;
    }
    this.client.publish({
        destination: `/app/rooms/${roomId}/${destination}`,
        body: JSON.stringify(body),
    });
  }
}

export const webSocketService = new WebSocketService();
