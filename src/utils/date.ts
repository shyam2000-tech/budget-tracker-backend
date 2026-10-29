/**
 * Helper to compute date boundaries respecting timezone offsets.
 * Given an ISO date string or YYYY-MM-DD and an optional IANA timezone or offset.
 */

export const parseDateWithTimezone = (dateString?: string): Date => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date;
};

export const getDayBoundaries = (
  dateInput?: string | Date,
  timezoneOffsetMinutes = 0
): { start: Date; end: Date; dateStr: string } => {
  const base = dateInput ? new Date(dateInput) : new Date();
  
  // Adjust to the client's local day
  const localTime = new Date(base.getTime() + timezoneOffsetMinutes * 60 * 1000);
  const year = localTime.getUTCFullYear();
  const month = localTime.getUTCMonth();
  const day = localTime.getUTCDate();

  // Construct start of local day in UTC
  const startLocal = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const start = new Date(startLocal.getTime() - timezoneOffsetMinutes * 60 * 1000);

  // Construct end of local day in UTC
  const endLocal = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  const end = new Date(endLocal.getTime() - timezoneOffsetMinutes * 60 * 1000);

  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  const dateStr = `${year}-${monthStr}-${dayStr}`;

  return { start, end, dateStr };
};

export const getMonthBoundaries = (
  yearInput?: number,
  monthInput?: number, // 1 to 12
  timezoneOffsetMinutes = 0
): { start: Date; end: Date; year: number; month: number } => {
  const now = new Date();
  const year = yearInput || now.getUTCFullYear();
  const month = monthInput !== undefined ? monthInput : now.getUTCMonth() + 1;

  // Start of month: day 1 at 00:00:00
  const startLocal = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const start = new Date(startLocal.getTime() - timezoneOffsetMinutes * 60 * 1000);

  // End of month: last day of month at 23:59:59.999
  const nextMonthLocal = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const end = new Date(nextMonthLocal.getTime() - timezoneOffsetMinutes * 60 * 1000);

  return { start, end, year, month };
};

