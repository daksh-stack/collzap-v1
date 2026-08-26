import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.pendingRooms = new Set();
  }

  connect() {
    if (this.client && this.client.connected) {
      return;
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      console.warn('Cannot connect to WebSocket without token');
      return;
    }

    // SockJS fallback URL
    const socketUrl = 'http://localhost:8081/ws';

    this.client = new Client({
      // Create a custom WebSocket factory to use SockJS
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000, // Reconnect automatically after 5 seconds
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket server', frame);
      
      // Subscribe all pending rooms
      this.pendingRooms.forEach(roomId => {
        this._doSubscribe(roomId);
      });
      this.pendingRooms.clear();

      this.client.subscribe('/user/queue/errors', (message) => {
        console.error('WebSocket Error from server:', message.body);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client && this.client.connected) {
      this.client.deactivate();
    }
    this.subscriptions.clear();
    this.pendingRooms.clear();
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
    console.log(`Subscribing to ${topic}`);

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        if (payload.type === 'RECEIPT') {
          useChatStore.getState().updateReceipt(roomId, payload.payload || payload);
        } else if (payload.type === 'MESSAGE') {
          useChatStore.getState().addIncomingMessage(roomId, payload.payload || payload);
        } else {
          useChatStore.getState().addIncomingMessage(roomId, payload);
        }
      } catch (error) {
        console.error("Error processing websocket message", error, message.body);
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
      console.log(`Unsubscribed from room ${roomId}`);
    }
  }

  send(roomId, destination, body) {
    if (!this.client || !this.client.connected) {
        console.error("Cannot send message, WebSocket not connected");
        return;
    }
    this.client.publish({
        destination: `/app/rooms/${roomId}/${destination}`,
        body: JSON.stringify(body),
    });
  }
}

export const webSocketService = new WebSocketService();
