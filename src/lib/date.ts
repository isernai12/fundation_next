import { format as formatTz, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addDays } from 'date-fns';

export const TIMEZONE = 'Asia/Dhaka';

/**
 * Returns the current date in Asia/Dhaka timezone.
 */
export function getNow(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Converts any UTC or local date to Asia/Dhaka time.
 */
export function toDhakaTime(date: Date | string | number): Date {
  return toZonedTime(date, TIMEZONE);
}

/**
 * Converts a Dhaka time back to UTC if needed for Prisma storage.
 * Note: Prisma mostly handles standard Date objects natively, 
 * but this is useful if you construct a local time and need it in UTC.
 */
export function fromDhakaTime(date: Date | string | number): Date {
  return fromZonedTime(date, TIMEZONE);
}

// ------------------------------------------------------------------
// FORMATTING
// ------------------------------------------------------------------

const BANGLA_NUMBERS: Record<string, string> = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

function toBanglaDigits(str: string): string {
  return str.replace(/[0-9]/g, (match) => BANGLA_NUMBERS[match] || match);
}

/**
 * Formats date as DD MMM YYYY (e.g., "26 Jul 2026")
 */
export function formatDate(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  return formatTz(dhakaDate, 'dd MMM yyyy', { timeZone: TIMEZONE });
}

/**
 * Formats time as 12-hour format with Bangla labels (e.g., "সকাল ৯:৩০")
 */
export function formatTimeBangla(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  const hour = dhakaDate.getHours();
  let label = '';
  
  if (hour >= 5 && hour < 12) {
    label = 'সকাল';
  } else if (hour >= 12 && hour < 15) {
    label = 'দুপুর';
  } else if (hour >= 15 && hour < 18) {
    label = 'বিকাল';
  } else if (hour >= 18 && hour < 20) {
    label = 'সন্ধ্যা';
  } else {
    label = 'রাত';
  }

  // Formatting to h:mm
  const timeStr = formatTz(dhakaDate, 'h:mm', { timeZone: TIMEZONE });
  const banglaTimeStr = toBanglaDigits(timeStr);

  return `${label} ${banglaTimeStr}`;
}

/**
 * Formats date to relative string (আজ, গতকাল, আগামীকাল) or falls back to DD MMM YYYY
 */
export function formatRelativeDateBangla(date: Date | string | number): string {
  const targetDate = toDhakaTime(date);
  const now = getNow();

  if (isSameDay(targetDate, now)) return 'আজ';
  if (isSameDay(targetDate, addDays(now, -1))) return 'গতকাল';
  if (isSameDay(targetDate, addDays(now, 1))) return 'আগামীকাল';

  return formatDate(targetDate);
}

// ------------------------------------------------------------------
// DATE RANGES IN DHAKA TIME (For Prisma queries)
// ------------------------------------------------------------------

/**
 * Returns { start, end } of TODAY in UTC, representing the bounds of Dhaka's today.
 * Pass these bounds to Prisma queries.
 */
export function getTodayBounds() {
  const now = getNow();
  return {
    start: fromDhakaTime(startOfDay(now)),
    end: fromDhakaTime(endOfDay(now))
  };
}

/**
 * Returns { start, end } of THIS WEEK in UTC, representing the bounds of Dhaka's this week.
 */
export function getThisWeekBounds() {
  const now = getNow();
  return {
    start: fromDhakaTime(startOfWeek(now, { weekStartsOn: 0 })), // Assuming Sunday start
    end: fromDhakaTime(endOfWeek(now, { weekStartsOn: 0 }))
  };
}

/**
 * Returns { start, end } of THIS MONTH in UTC, representing the bounds of Dhaka's this month.
 */
export function getThisMonthBounds() {
  const now = getNow();
  return {
    start: fromDhakaTime(startOfMonth(now)),
    end: fromDhakaTime(endOfMonth(now))
  };
}

/**
 * Returns { start, end } for the NEXT 7 DAYS in UTC, representing the bounds from Dhaka's today to next 7 days.
 */
export function getNext7DaysBounds() {
  const now = getNow();
  return {
    start: fromDhakaTime(startOfDay(now)),
    end: fromDhakaTime(endOfDay(addDays(now, 7)))
  };
}
