// @ts-check
/**
 * Get a formatted date for daily notes. Accepts a timestamp string or 
 * nothing a returns a string like "2024-04-25".
 * @param {string|undefined} date
 * @return {string} 
 */
export function getFormattedDate(date = '') {
  const d = date === '' ? new Date() : new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString(10).padStart(2, "0");
  const day = d.getDate().toString(10).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @param {string} date
 * @return {boolean}
 */
export function matchFormattedDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function prettyPrintDate(dateString) {
  // Create a date object using the input string
  const date = new Date(dateString + 'T00:00:00');
  
  // Format the date using the browser's locale and timezone
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}