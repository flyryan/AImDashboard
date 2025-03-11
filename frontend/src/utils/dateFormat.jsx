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
    
    // Add debugging to see what's happening with the dates
    console.log('Message timestamp:', {
      original: timestamp,
      parsed: date.toISOString(),
      parsedLocal: date.toLocaleString(),
      formatted: format(date, formatString)
    });
    
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
    
    const now = new Date();
    const diffMs = now - date;
    
    // Add debugging to see what's happening with the dates
    console.log('Relative time debug:', {
      original: timestamp,
      parsed: date.toISOString(),
      parsedLocal: date.toLocaleString(),
      now: now.toISOString(),
      nowLocal: now.toLocaleString(),
      diff: diffMs / (1000 * 60), // diff in minutes
      formatted: formatDistanceToNow(date, { addSuffix: true })
    });
    
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
    // Extract date parts from the timestamp
    const dateTimeStr = match[1];
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    // Create a date string in ISO format with the UTC timezone indicator (Z)
    // This ensures the date is interpreted as UTC
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}Z`;
    const date = new Date(isoString);
    
    console.log('Timestamp parsing:', {
      original: timestamp,
      dateTimeStr: dateTimeStr,
      isoString: isoString,
      date: date.toISOString(),
      localDate: date.toLocaleString()
    });
    
    return date;
  }
  
  // Handle timestamps in the format 'YYYY-MM-DD HH:mm:ss' (without brackets)
  const directMatch = timestamp.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/);
  if (directMatch) {
    const dateTimeStr = directMatch[1];
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    // Create a date string in ISO format with the UTC timezone indicator (Z)
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}Z`;
    const date = new Date(isoString);
    
    console.log('Direct timestamp parsing:', {
      original: timestamp,
      dateTimeStr: dateTimeStr,
      isoString: isoString,
      date: date.toISOString(),
      localDate: date.toLocaleString()
    });
    
    return date;
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
  try {
    // Parse the timestamp
    const date = timestamp instanceof Date
      ? timestamp
      : parseTimestamp(timestamp);
    
    // Format the date in local time
    const localTime = format(date, 'MMM d, h:mm a');
    
    console.log('DateTime formatting:', {
      original: timestamp,
      parsed: date.toISOString(),
      localTime: localTime
    });
    
    return localTime;
  } catch (error) {
    console.error('Error formatting date time:', error);
    return timestamp;
  }
}

export default {
  formatDate,
  formatRelativeTime,
  parseTimestamp,
  formatTime,
  formatShortDate,
  formatDateTime
};