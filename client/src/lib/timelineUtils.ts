/**
 * Parse flexible date formats with BCE/CE handling
 * Supports standard dates, BCE/BC dates (negative timestamps), and custom formats
 */
export function parseDateToTimestamp(dateStr: string): number {
  // Try parsing as standard date first
  const standardDate = new Date(dateStr);
  if (!isNaN(standardDate.getTime())) {
    return standardDate.getTime();
  }
  
  // Handle BCE/BC dates (negative timestamps)
  const isBCE = /\b(BCE|BC)\b/i.test(dateStr);
  const numbers = dateStr.match(/\d+/g);
  
  if (numbers && numbers.length > 0) {
    const year = parseInt(numbers[0]);
    // BCE dates are negative, CE dates are positive
    return isBCE ? -year * 10000 : year * 10000;
  }
  
  // Fallback: use string hash for consistent ordering
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
