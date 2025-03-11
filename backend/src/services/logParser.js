import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

/**
 * Parse a log file and extract structured conversation data
 * @param {string} filePath - Path to the log file
 * @returns {Promise<Array>} - Array of parsed messages
 */
export async function parseLogFile(filePath) {
  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract bot name from the file path
    // Assuming path format: /path/to/conversations/BOT_NAME/user.log
    const botName = path.basename(path.dirname(filePath));
    
    // Extract user name from the file name
    // Assuming file name format: username.log
    const userName = path.basename(filePath, '.log');
    
    const messages = [];
    let currentMessage = null;
    let isMultilineMessage = false;
    let botResponseContent = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a new message (starts with timestamp)
      const timestampMatch = line.match(/^\[(.*?)\]\s+(.*?):\s+(.*)/);
      
      if (timestampMatch) {
        // If we were processing a multiline message, add it to messages
        if (currentMessage && isMultilineMessage && botResponseContent) {
          // Add the bot's response as a separate message
          messages.push({
            timestamp: currentMessage.timestamp,
            sender: 'bot',
            botName,
            userName,
            content: botResponseContent.trim(),
            isEntry: false
          });
          botResponseContent = '';
          isMultilineMessage = false;
        }
        
        // Extract timestamp, sender, and message
        const [, timestamp, sender, message] = timestampMatch;
        
        // Check if this is a bot entry message
        const botEntryMatch = message.match(/\*(.*?) has entered the chat\*/);
        const isBotMessage = sender.toLowerCase() === 'bot';
        
        if (botEntryMatch) {
          // This is a bot entry message
          currentMessage = {
            timestamp,
            sender: 'bot',
            botName,
            userName,
            content: message,
            isEntry: true
          };
          messages.push(currentMessage);
          isMultilineMessage = true;
          botResponseContent = '';
        } else if (isBotMessage) {
          // This is a bot message - could be the start of a multiline message
          currentMessage = {
            timestamp,
            sender: 'bot',
            botName,
            userName,
            content: message,
            isEntry: false
          };
          
          // For bot messages, we'll add them to the array but also set up for potential multiline content
          messages.push(currentMessage);
          isMultilineMessage = true;
          botResponseContent = '';
        } else {
          // This is a user message
          currentMessage = {
            timestamp,
            sender: 'user',
            botName,
            userName,
            content: message,
            isEntry: false
          };
          
          // Add the user message to the array
          messages.push(currentMessage);
          currentMessage = null;
          isMultilineMessage = false;
        }
      } else if (isMultilineMessage && currentMessage) {
        // This is part of a multiline bot message
        // Add the line to the bot response content
        if (line.trim()) {  // Only add non-empty lines
          if (botResponseContent) {
            botResponseContent += '\n' + line;
          } else {
            botResponseContent = line;
          }
        }
      }
    }
    
    // Add the last message if it exists
    if (currentMessage && isMultilineMessage && botResponseContent) {
      // For the last message, we need to update the existing bot message with the full content
      // Find the last bot message
      const lastBotMessageIndex = messages.findIndex(msg =>
        msg.timestamp === currentMessage.timestamp &&
        msg.sender === 'bot' &&
        !msg.isEntry
      );
      
      if (lastBotMessageIndex !== -1) {
        // Update the existing message with the full content
        messages[lastBotMessageIndex].content += '\n' + botResponseContent.trim();
      } else {
        // If for some reason we didn't find the message, add a new one
        messages.push({
          timestamp: currentMessage.timestamp,
          sender: 'bot',
          botName,
          userName,
          content: botResponseContent.trim(),
          isEntry: false
        });
      }
    }
    
    return messages;
  } catch (error) {
    logger.error(`Error parsing log file ${filePath}: ${error.message}`);
    throw error;
  }
}

/**
 * Parse all log files for a specific bot
 * @param {string} botDir - Path to the bot's directory
 * @returns {Promise<Object>} - Object with user names as keys and arrays of messages as values
 */
export async function parseBotLogs(botDir) {
  try {
    const files = await fs.readdir(botDir);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    const conversations = {};
    
    for (const file of logFiles) {
      const filePath = path.join(botDir, file);
      const userName = path.basename(file, '.log');
      
      try {
        const messages = await parseLogFile(filePath);
        conversations[userName] = messages;
      } catch (error) {
        logger.error(`Error parsing log file for user ${userName}: ${error.message}`);
      }
    }
    
    return conversations;
  } catch (error) {
    logger.error(`Error parsing bot logs in ${botDir}: ${error.message}`);
    throw error;
  }
}

/**
 * Parse all logs for all bots
 * @param {string} conversationsDir - Path to the conversations directory
 * @returns {Promise<Object>} - Object with bot names as keys and conversation objects as values
 */
export async function parseAllLogs(conversationsDir) {
  try {
    const dirs = await fs.readdir(conversationsDir);
    
    const allConversations = {};
    
    for (const dir of dirs) {
      const botDir = path.join(conversationsDir, dir);
      
      // Check if it's a directory
      const stats = await fs.stat(botDir);
      if (!stats.isDirectory()) continue;
      
      try {
        const botConversations = await parseBotLogs(botDir);
        allConversations[dir] = botConversations;
      } catch (error) {
        logger.error(`Error parsing logs for bot ${dir}: ${error.message}`);
      }
    }
    
    return allConversations;
  } catch (error) {
    logger.error(`Error parsing all logs: ${error.message}`);
    throw error;
  }
}

export default {
  parseLogFile,
  parseBotLogs,
  parseAllLogs
};