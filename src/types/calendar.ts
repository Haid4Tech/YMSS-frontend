// Calendar event types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string; // Format: "HH:MM"
  endTime?: string; // Format: "HH:MM"
  color?: string; // For visual categorization
  category?: string;
  createdById: number;
}

// Calendar view types
export type CalendarView = "month" | "week" | "day";

// Calendar navigation
export interface CalendarNavigation {
  currentDate: Date;
  currentMonth: number;
  currentYear: number;
  today: Date;
}

// Day cell information
export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
}

// Calendar component props
export interface CalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: Omit<CalendarEvent, "id">) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onDateSelect?: (date: Date) => void;
  className?: string;
  defaultView?: CalendarView;
}

// Event form data
export interface EventFormData {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  category: CalendarEvent["category"];
  color: string;
  createdById: number;
}

// Calendar utilities
export interface CalendarUtils {
  formatDate: (date: Date) => string;
  formatTime: (time: string) => string;
  generateEventId: () => string;
  getMonthDays: (year: number, month: number) => CalendarDay[];
  isSameDay: (date1: Date, date2: Date) => boolean;
  getDayEvents: (date: Date, events: CalendarEvent[]) => CalendarEvent[];
}
