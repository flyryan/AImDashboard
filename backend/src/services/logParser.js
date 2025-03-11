import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

// Message boundary indicator
const MESSAGE_BOUNDARY = '#=====< MESSAGE BOUNDARY >=====# ';

/**
 * Parse a log file and extract structured conversation data
 * @param {string} filePath - Path to the log file
 * @returns {Promise<Array>} - Array of parsed messages
 */
export async function parseLogFile(filePath) {
  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract bot name from the file path
    // Assuming path format: /path/to/conversations/BOT_NAME/user.log
    const botName = path.basename(path.dirname(filePath));
    
    // Extract user name from the file name
    // Assuming file name format: username.log
    const userName = path.basename(filePath, '.log');
    
    // Split the content by message boundary
    const messageBlocks = content.split(MESSAGE_BOUNDARY).filter(block => block.trim());
    
    const messages = [];
    
    for (const block of messageBlocks) {
      const lines = block.trim().split('\n');
      if (lines.length === 0) continue;
      
      // The first line should contain the timestamp and sender
      const firstLine = lines[0];
      const timestampMatch = firstLine.match(/^\[(.*?)\]\s+(.*?):\s+(.*)/);
      
      if (!timestampMatch) continue;
      
      // Extract timestamp, sender, and first line of message
      const [, timestamp, sender, firstMessageLine] = timestampMatch;
      
      // Check if this is a bot entry message
      const botEntryMatch = firstMessageLine.match(/\*(.*?) has entered the chat\*/);
      const isBotMessage = sender.toLowerCase() === 'bot';
      
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
        messages.push({
          timestamp,
          sender: 'bot',
          botName,
          userName,
          content: messageContent,
          isEntry: true
        });
      } else if (isBotMessage) {
        // This is a bot message
        messages.push({
          timestamp,
          sender: 'bot',
          botName,
          userName,
          content: messageContent,
          isEntry: false
        });
      } else {
        // This is a user message
        messages.push({
          timestamp,
          sender: 'user',
          botName,
          userName,
          content: messageContent,
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