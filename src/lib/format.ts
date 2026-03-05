export function formatSAR(amount: number): string {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseDateInput(date: string | Date): Date {
  if (date instanceof Date) return date;

  // Keep YYYY-MM-DD stable across timezones for user-facing date labels.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
}

export function formatMonthDayYear(date: string | Date): string {
  const parsed = parseDateInput(date);
  const month = parsed.toLocaleString("en-US", { month: "long" });
  return `${month} ${parsed.getDate()} ${parsed.getFullYear()}`;
}

export function formatDate(date: string | Date): string {
  return formatMonthDayYear(date);
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-SA", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function formatMessageDate(date: string): string {
  return formatMonthDayYear(date);
}

export function formatMessageTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  // Mask middle digits: +966 5xx xxx xx3
  if (phone.length > 6) {
    return phone.slice(0, 4) + "xx xxx xx" + phone.slice(-1);
  }
  return phone;
}

export function formatPhoneFull(phone: string): string {
  return phone;
}
