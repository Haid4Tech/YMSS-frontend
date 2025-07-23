import { CalendarEvent, CalendarDay } from "@/types/calendar";

/**
 * Calendar utility functions
 * These pure functions handle all calendar calculations and date manipulations
 */

/**
 * Generate a unique ID for events
 */
export const generateEventId = (): string => {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time string to readable format
 */
export const formatTime = (time: string): string => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Get events for a specific date
 */
export const getDayEvents = (
  date: Date,
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter((event) => isSameDay(event.date, date));
};

/**
 * Get the first day of the month
 */
export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * Get the last day of the month
 */
export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};

/**
 * Get the number of days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the day of week (0 = Sunday, 6 = Saturday)
 */
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

/**
 * Generate calendar days for a given month
 * This includes days from previous/next month to fill the grid
 */
export const getMonthDays = (
  year: number,
  month: number,
  events: CalendarEvent[] = [],
  selectedDate?: Date
): CalendarDay[] => {
  const today = new Date();
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getDayOfWeek(firstDay);

  const days: CalendarDay[] = [];

  // Add days from previous month to fill the first week
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, dayNumber);

    days.push({
      date,
      dayNumber,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: getDayEvents(date, events),
    });
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: getDayEvents(date, events),
    });
  }

  // Add days from next month to fill the last week
  const totalCells = 42; // 6 weeks × 7 days
  const remainingCells = totalCells - days.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(nextYear, nextMonth, day);

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: getDayEvents(date, events),
    });
  }

  return days;
};

/**
 * Get month names
 */
export const getMonthNames = (): string[] => {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
};

/**
 * Get day names
 */
export const getDayNames = (): string[] => {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
};

/**
 * Navigate to previous month
 */
export const getPreviousMonth = (
  year: number,
  month: number
): { year: number; month: number } => {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
};

/**
 * Navigate to next month
 */
export const getNextMonth = (
  year: number,
  month: number
): { year: number; month: number } => {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
};

/**
 * Get category colors
 */
export const getCategories = () => {
  const categories = [
    { label: "Work", color: "#3b82f6" },
    { label: "Exams", color: "#254138ff" },
    { label: "Christmas break", color: "#8b5cf6" },
    { label: "Easter break", color: "#f59e0b" },
    { label: "Long Holiday", color: "#62c696ff" },
    { label: "Other", color: "#6b7280" },
  ];
  return categories;
};

/**
 * Get category color by label
 */
export const getCategoryColor = (categoryLabel?: string): string => {
  const categories = getCategories();
  const category = categories.find((cat) => cat.label === categoryLabel);
  return (
    category?.color ||
    categories.find((cat) => cat.label === "Other")?.color ||
    "#6b7280"
  );
};

/**
 * Find category by label
 */
export const findCategoryByLabel = (label: string) => {
  const categories = getCategories();
  return categories.find((cat) => cat.label === label);
};
