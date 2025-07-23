// Main calendar component
export { EventCalendar } from "./Calendar";

// Sub-components for advanced usage
export { CalendarHeader } from "./CalendarHeader";
export { CalendarDayCell } from "./CalendarDayCell";
export { AddEventModal } from "./AddEventModal";

// Re-export types for convenience
export type {
  CalendarEvent,
  CalendarProps,
  CalendarDay,
  CalendarView,
  EventFormData,
} from "@/types/calendar"; 