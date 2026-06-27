/**
 * Adds a specified number of working days to a given date.
 * Excludes Saturdays and Sundays.
 */
export function addWorkingDays(startDate: Date, daysToAdd: number): Date {
  let currentDate = new Date(startDate.getTime());
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    // 0 = Sunday, 6 = Saturday
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return currentDate;
}
