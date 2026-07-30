import { format as formatTz, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addDays } from 'date-fns';

export function getTimezone(): string {
  if (typeof window !== 'undefined') {
    return (window as any).APP_TIMEZONE || 'Asia/Dhaka';
  } else {
    return (globalThis as any).APP_TIMEZONE || 'Asia/Dhaka';
  }
}

export function getDateFormat(): string {
  if (typeof window !== 'undefined') {
    return (window as any).APP_DATE_FORMAT || 'dd MMM yyyy';
  } else {
    return (globalThis as any).APP_DATE_FORMAT || 'dd MMM yyyy';
  }
}

/**
 * Returns the current date in the application timezone.
 */
export function getNow(): Date {
  return toZonedTime(new Date(), getTimezone());
}

/**
 * Converts any UTC or local date to application time.
 */
export function toDhakaTime(date: Date | string | number): Date {
  return toZonedTime(date, getTimezone());
}

/**
 * Converts a Dhaka time back to UTC if needed for Prisma storage.
 * Note: Prisma mostly handles standard Date objects natively, 
 * but this is useful if you construct a local time and need it in UTC.
 */
export function fromDhakaTime(date: Date | string | number): Date {
  return fromZonedTime(date, getTimezone());
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
  // Reformat the date formatting string based on what we store
  let fmt = getDateFormat();
  if (fmt === 'DD/MM/YYYY') fmt = 'dd/MM/yyyy';
  if (fmt === 'MM/DD/YYYY') fmt = 'MM/dd/yyyy';
  if (fmt === 'YYYY-MM-DD') fmt = 'yyyy-MM-dd';
  if (fmt === 'DD MMM YYYY') fmt = 'dd MMM yyyy';
  if (fmt === 'DD MMMM YYYY') fmt = 'dd MMMM yyyy';

  return formatTz(dhakaDate, fmt, { timeZone: getTimezone() });
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
  const timeStr = formatTz(dhakaDate, 'h:mm', { timeZone: getTimezone() });
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


/**
 * Formats date and time like toLocaleString('bn-BD')
 */
export function formatDateTimeBanglaLocal(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  const timeStr = formatTz(dhakaDate, 'd/M/yyyy, h:mm:ss a', { timeZone: getTimezone() });
  return toBanglaDigits(timeStr);
}

/**
 * Formats date like toLocaleDateString('bn-BD')
 */
export function formatDateBanglaLocal(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  const timeStr = formatTz(dhakaDate, 'd/M/yyyy', { timeZone: getTimezone() });
  return toBanglaDigits(timeStr);
}

/**
 * Formats date as YYYY-MM-DD for HTML inputs
 */
export function formatDateInput(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  return formatTz(dhakaDate, 'yyyy-MM-dd', { timeZone: getTimezone() });
}
