import React, { createContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

// Create context
export const SocketContext = createContext(null);

// Socket.io server URL - in production, this will connect to the current host
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState({});
  const [lastError, setLastError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/ws'
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setLastError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setLastError(`Connection error: ${error.message}`);
    });

    // Data events
    socket.on('initialData', (data) => {
      console.log('Received initial data:', data);
      setConversations(data);
    });

    socket.on('conversationUpdate', ({ botName, userName, messages }) => {
      console.log(`Conversation update: ${botName} - ${userName}`);
      setConversations(prev => {
        const updated = { ...prev };
        if (!updated[botName]) {
          updated[botName] = {};
        }
        updated[botName][userName] = messages;
        return updated;
      });
    });

    socket.on('conversationDelete', ({ botName, userName }) => {
      console.log(`Conversation delete: ${botName} - ${userName}`);
      setConversations(prev => {
        const updated = { ...prev };
        if (updated[botName] && updated[botName][userName]) {
          const { [userName]: removed, ...rest } = updated[botName];
          updated[botName] = rest;
          
          // If no more conversations for this bot, remove the bot
          if (Object.keys(updated[botName]).length === 0) {
            const { [botName]: removedBot, ...restBots } = updated;
            return restBots;
          }
        }
        return updated;
      });
    });

    socket.on('botDelete', ({ botName }) => {
      console.log(`Bot delete: ${botName}`);
      setConversations(prev => {
        const { [botName]: removed, ...rest } = prev;
        return rest;
      });
    });

    socket.on('botAdd', ({ botName }) => {
      console.log(`Bot add: ${botName}`);
      setConversations(prev => {
        if (!prev[botName]) {
          return {
            ...prev,
            [botName]: {}
          };
        }
        return prev;
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setLastError(`Socket error: ${error.message}`);
    });

    // Clean up event listeners on unmount or socket change
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('initialData');
      socket.off('conversationUpdate');
      socket.off('conversationDelete');
      socket.off('botDelete');
      socket.off('botAdd');
      socket.off('error');
    };
  }, [socket]);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  // Context value
  const value = {
    socket,
    isConnected,
    conversations,
    lastError,
    reconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};