export interface CalendarCell {
  value: number;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function buildCalendar(referenceDate: Date): CalendarCell[] {
  const firstDayOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const mondayBasedOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(firstDayOfMonth.getDate() - mondayBasedOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);

    return {
      value: current.getDate(),
      iso: current.toISOString(),
      isCurrentMonth: current.getMonth() === referenceDate.getMonth(),
      isToday: isSameDay(current, referenceDate)
    };
  });
}

export function buildWeekRow(referenceDate: Date): CalendarCell[] {
  const currentDay = referenceDate.getDay();
  const mondayBasedOffset = (currentDay + 6) % 7;
  const gridStart = new Date(referenceDate);
  gridStart.setDate(referenceDate.getDate() - mondayBasedOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);

    return {
      value: current.getDate(),
      iso: current.toISOString(),
      isCurrentMonth: current.getMonth() === referenceDate.getMonth(),
      isToday: isSameDay(current, referenceDate)
    };
  });
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(date);
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).format(date);
}

export function calculateDaysUntil(targetDate: string, fromDate = new Date()) {
  const target = new Date(targetDate);
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = end.getTime() - start.getTime();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const weekHeaders = ["一", "二", "三", "四", "五", "六", "日"];
