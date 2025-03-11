import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext.jsx';

/**
 * Custom hook to access the socket context
 * @returns {Object} Socket context value
 */
export function useSocket() {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
}

/**
 * Custom hook to access conversation data
 * @returns {Object} Conversation data and helper functions
 */
export function useConversations() {
  const { conversations } = useSocket();
  
  // Get all bot names
  const getBots = () => {
    return Object.keys(conversations);
  };
  
  // Get all users for a specific bot
  const getUsersForBot = (botName) => {
    if (!conversations[botName]) return [];
    return Object.keys(conversations[botName]);
  };
  
  // Get all users across all bots
  const getAllUsers = () => {
    const users = new Set();
    
    Object.values(conversations).forEach(botConversations => {
      Object.keys(botConversations).forEach(user => {
        users.add(user);
      });
    });
    
    return Array.from(users);
  };
  
  // Get conversation between a bot and user
  const getConversation = (botName, userName) => {
    if (!conversations[botName] || !conversations[botName][userName]) {
      return [];
    }
    
    return conversations[botName][userName];
  };
  
  // Get the last message from a conversation
  const getLastMessage = (botName, userName) => {
    const messages = getConversation(botName, userName);
    
    if (messages.length === 0) {
      return null;
    }
    
    return messages[messages.length - 1];
  };
  
  // Get the number of active bots
  const getActiveBotCount = () => {
    return Object.keys(conversations).length;
  };
  
  // Get the number of active users
  const getActiveUserCount = () => {
    return getAllUsers().length;
  };
  
  // Get the total number of conversations
  const getTotalConversationCount = () => {
    let count = 0;
    
    Object.values(conversations).forEach(botConversations => {
      count += Object.keys(botConversations).length;
    });
    
    return count;
  };
  
  return {
    conversations,
    getBots,
    getUsersForBot,
    getAllUsers,
    getConversation,
    getLastMessage,
    getActiveBotCount,
    getActiveUserCount,
    getTotalConversationCount
  };
}

export default useSocket;