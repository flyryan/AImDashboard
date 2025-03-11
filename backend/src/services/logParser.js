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
        }
        
        // Extract timestamp, sender, and message
        const [, timestamp, sender, message] = timestampMatch;
        
        // Check if this is a bot entry message
        const botEntryMatch = message.match(/\*(.*?) has entered the chat\*/);
        
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
        } else {
          // This is a regular message
          currentMessage = {
            timestamp,
            sender: sender.toLowerCase() === 'bot' ? 'bot' : 'user',
            botName,
            userName,
            content: message,
            isEntry: false
          };
          
          // Add the message to the array if it's not a bot entry
          if (!isMultilineMessage) {
            messages.push(currentMessage);
            currentMessage = null;
          }
        }
      } else if (isMultilineMessage && currentMessage) {
        // This is part of a multiline bot message
        // Add the line to the bot response content
        if (botResponseContent) {
          botResponseContent += '\n' + line;
        } else {
          botResponseContent = line;
        }
      }
    }
    
    // Add the last message if it exists
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