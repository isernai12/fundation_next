import { formatDate as formatDateTz, formatTimeBangla } from './date';
export function formatDate(date: string | Date | number | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return formatDateTz(d);
}

export function formatDateTime(date: string | Date | number | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return `${formatDateTz(d)}, ${formatTimeBangla(d)}`;
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return '0.00';
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  const fixed = Math.abs(num).toFixed(2);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (num < 0 ? '-' : '') + parts.join('.');
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function formatMonth(monthIndex: number): string {
  return months[monthIndex] || 'Unknown';
}

const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatShortMonth(monthIndex: number): string {
  return shortMonths[monthIndex] || 'Unknown';
}
