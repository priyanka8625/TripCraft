import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export default function useWebSocket(tripId, onMessageReceived) {
  const client = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    client.current = Stomp.over(socket);

    client.current.connect({}, () => {
      client.current.subscribe(`/topic/trip/${tripId}`, (message) => {
        const payload = JSON.parse(message.body);
        onMessageReceived(payload);
      });
    });

    return () => {
      if (client.current) client.current.disconnect();
    };
  }, [tripId, onMessageReceived]);
 
  const sendUpdate = (editPayload) => {
    client.current.send(`/app/trip/${tripId}/edit`, {}, JSON.stringify(editPayload));
  };

  return { sendUpdate };
}

