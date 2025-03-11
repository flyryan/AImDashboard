import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a timestamp as a readable date
 * @param {string} timestamp - The timestamp to format
 * @param {string} formatString - The format string to use
 * @returns {string} The formatted date
 */
export function formatDate(timestamp, formatString = 'MMM d, yyyy h:mm a') {
  try {
    // Check if timestamp is already a Date object
    const date = timestamp instanceof Date 
      ? timestamp 
      : parseTimestamp(timestamp);
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return timestamp;
  }
}

/**
 * Format a timestamp as a relative time (e.g., "5 minutes ago")
 * @param {string} timestamp - The timestamp to format
 * @returns {string} The relative time
 */
export function formatRelativeTime(timestamp) {
  try {
    const date = timestamp instanceof Date 
      ? timestamp 
      : parseTimestamp(timestamp);
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return timestamp;
  }
}

/**
 * Parse a timestamp string into a Date object
 * @param {string} timestamp - The timestamp to parse
 * @returns {Date} The parsed date
 */
export function parseTimestamp(timestamp) {
  // Check if timestamp is in ISO format
  if (timestamp.includes('T') && timestamp.includes('Z')) {
    return parseISO(timestamp);
  }
  
  // Check if timestamp is in the format [YYYY-MM-DD HH:mm:ss]
  const match = timestamp.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
  if (match) {
    return new Date(match[1].replace(' ', 'T') + 'Z');
  }
  
  // Try to parse as a regular date string
  return new Date(timestamp);
}

/**
 * Get a short formatted time (e.g., "3:45 PM")
 * @param {string} timestamp - The timestamp to format
 * @returns {string} The formatted time
 */
export function formatTime(timestamp) {
  return formatDate(timestamp, 'h:mm a');
}

/**
 * Get a short formatted date (e.g., "Mar 15")
 * @param {string} timestamp - The timestamp to format
 * @returns {string} The formatted date
 */
export function formatShortDate(timestamp) {
  return formatDate(timestamp, 'MMM d');
}

/**
 * Get a formatted date and time (e.g., "Mar 15, 3:45 PM")
 * @param {string} timestamp - The timestamp to format
 * @returns {string} The formatted date and time
 */
export function formatDateTime(timestamp) {
  return formatDate(timestamp, 'MMM d, h:mm a');
}

export default {
  formatDate,
  formatRelativeTime,
  parseTimestamp,
  formatTime,
  formatShortDate,
  formatDateTime
};