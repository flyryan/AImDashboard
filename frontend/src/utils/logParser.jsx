// Message boundary indicator
const MESSAGE_BOUNDARY = '#=====< MESSAGE BOUNDARY >=====# ';

/**
 * Parse a raw message to extract sender, timestamp, and content
 * @param {string} rawMessage - The raw message to parse
 * @returns {Object|null} The parsed message or null if parsing failed
 */
export function parseMessage(rawMessage) {
  try {
    // Remove any message boundary indicators
    const cleanMessage = rawMessage.replace(MESSAGE_BOUNDARY, '').trim();
    
    // Split the message into lines
    const lines = cleanMessage.split('\n');
    if (lines.length === 0) return null;
    
    // The first line should contain the timestamp and sender
    const firstLine = lines[0];
    const timestampMatch = firstLine.match(/^\[(.*?)\]\s+(.*?):\s+(.*)/);
    
    if (!timestampMatch) {
      return null;
    }
    
    // Extract timestamp, sender, and first line of message
    const [, timestamp, sender, firstMessageLine] = timestampMatch;
    
    // Check if this is a bot entry message
    const botEntryMatch = firstMessageLine.match(/\*(.*?) has entered the chat\*/);
    
    // Prepare the full message content
    let messageContent = firstMessageLine;
    
    // If there are additional lines, add them to the message content
    if (lines.length > 1) {
      const additionalLines = lines.slice(1).join('\n');
      if (additionalLines.trim()) {
        messageContent += '\n' + additionalLines.trim();
      }
    }
    
    if (botEntryMatch) {
      // This is a bot entry message
      return {
        timestamp,
        sender: 'bot',
        content: messageContent,
        isEntry: true,
        botName: botEntryMatch[1]
      };
    }
    
    // This is a regular message
    return {
      timestamp,
      sender: sender.toLowerCase() === 'bot' ? 'bot' : 'user',
      content: messageContent,
      isEntry: false
    };
  } catch (error) {
    console.error('Error parsing message:', error);
    return null;
  }
}

/**
 * Parse a raw log content with multiple messages
 * @param {string} rawContent - The raw log content to parse
 * @returns {Array} Array of parsed messages
 */
export function parseLogContent(rawContent) {
  try {
    // Split the content by message boundary
    const messageBlocks = rawContent.split(MESSAGE_BOUNDARY).filter(block => block.trim());
    
    // Parse each message block
    return messageBlocks.map(block => parseMessage(block)).filter(msg => msg !== null);
  } catch (error) {
    console.error('Error parsing log content:', error);
    return [];
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
  parseLogContent,
  formatMessage,
  groupMessagesByDate
};