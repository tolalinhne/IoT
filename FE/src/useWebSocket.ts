import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export type WsMessageHandler = (body: unknown) => void;

export interface WsSubscription {
  topic: string;
  handler: WsMessageHandler;
}

export function useWebSocket(subscriptions: WsSubscription[], enabled = true) {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Connected to', WS_URL);
        subscriptions.forEach(({ topic, handler }) => {
          client.subscribe(topic, (msg) => {
            try {
              handler(JSON.parse(msg.body));
            } catch {
              handler(msg.body);
            }
          });
        });
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected');
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers?.message);
      },
    });
    client.activate();
    clientRef.current = client;
  }, [enabled, subscriptions]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);

  return clientRef;
}
