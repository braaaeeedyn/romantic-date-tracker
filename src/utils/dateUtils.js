import { format, parseISO, isToday, isYesterday, isThisYear, formatDistanceToNow } from 'date-fns';

/**
 * Formats a date string into a human-readable format
 * @param {string|Date} date - The date to format
 * @param {string} [formatString='MMM d, yyyy'] - The format string
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Returns a human-readable relative time string (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

/**
 * Returns a human-readable date format based on how recent the date is
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const getSmartDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return 'Today';
    }
    
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
    
    if (isThisYear(dateObj)) {
      return format(dateObj, 'MMM d');
    }
    
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting smart date:', error);
    return 'Invalid date';
  }
};

/**
 * Gets the start and end of a date range for filtering
 * @param {string} range - The range identifier ('today', 'week', 'month', 'year')
 * @returns {{start: Date, end: Date}} - Start and end dates
 */
export const getDateRange = (range) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() + (6 - now.getDay()));
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      // All time
      start.setFullYear(2000);
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(2100);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
  }
  
  return { start, end };
};
