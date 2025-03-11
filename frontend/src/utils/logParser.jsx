/**
 * Parse a raw message to extract sender, timestamp, and content
 * @param {string} rawMessage - The raw message to parse
 * @returns {Object|null} The parsed message or null if parsing failed
 */
export function parseMessage(rawMessage) {
  try {
    // Check if the message matches the expected format
    const timestampMatch = rawMessage.match(/^\[(.*?)\]\s+(.*?):\s+(.*)/);
    
    if (!timestampMatch) {
      return null;
    }
    
    // Extract timestamp, sender, and message
    const [, timestamp, sender, message] = timestampMatch;
    
    // Check if this is a bot entry message
    const botEntryMatch = message.match(/\*(.*?) has entered the chat\*/);
    
    if (botEntryMatch) {
      // This is a bot entry message
      return {
        timestamp,
        sender: 'bot',
        content: '',
        isEntry: true,
        botName: botEntryMatch[1]
      };
    }
    
    // This is a regular message
    return {
      timestamp,
      sender: sender.toLowerCase() === 'bot' ? 'bot' : 'user',
      content: message,
      isEntry: false
    };
  } catch (error) {
    console.error('Error parsing message:', error);
    return null;
  }
}

/**
 * Format a message for display
 * @param {Object} message - The message to format
 * @returns {Object} The formatted message
 */
export function formatMessage(message) {
  if (!message) return null;
  
  // Create a copy of the message to avoid modifying the original
  const formattedMessage = { ...message };
  
  // Format the timestamp if needed
  
  // Format the content if needed
  if (formattedMessage.content) {
    // Replace URLs with clickable links
    formattedMessage.content = formattedMessage.content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Replace emojis with emoji images if needed
    
    // Add any other formatting needed
  }
  
  return formattedMessage;
}

/**
 * Group messages by date for display
 * @param {Array} messages - The messages to group
 * @returns {Object} The grouped messages
 */
export function groupMessagesByDate(messages) {
  if (!messages || !Array.isArray(messages)) return {};
  
  const grouped = {};
  
  messages.forEach(message => {
    try {
      // Extract the date part from the timestamp
      const timestamp = message.timestamp;
      const date = timestamp.split(' ')[0]; // Assuming format is 'YYYY-MM-DD HH:mm:ss'
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(message);
    } catch (error) {
      console.error('Error grouping message:', error);
    }
  });
  
  return grouped;
}

export default {
  parseMessage,
  formatMessage,
  groupMessagesByDate
};