import { useState, useCallback } from "react";
import { CalendarEvent, CalendarProps } from "@/types/calendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDayCell } from "./CalendarDayCell";
import {
  getMonthDays,
  getDayNames,
  getPreviousMonth,
  getNextMonth,
  // generateEventId,
} from "@/utils/calendar";
import { cn } from "@/lib/utils";

export function EventCalendar({
  events = [],
  onEventAdd,
  // onEventEdit,
  // onEventDelete,
  onDateSelect,
  className,
}: CalendarProps) {
  // Current date navigation
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calendar data
  const monthDays = getMonthDays(
    currentYear,
    currentMonth,
    events,
    selectedDate || undefined
  );
  const dayNames = getDayNames();

  // Check if user can add events
  const canAddEvents = !!onEventAdd;

  // Navigation handlers
  const handlePreviousMonth = useCallback(() => {
    const { year, month } = getPreviousMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
  }, [currentYear, currentMonth]);

  const handleNextMonth = useCallback(() => {
    const { year, month } = getNextMonth(currentYear, currentMonth);
    setCurrentYear(year);
    setCurrentMonth(month);
  }, [currentYear, currentMonth]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
    onDateSelect?.(today);
  }, [onDateSelect]);

  // Event handlers
  const handleDayClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      onDateSelect?.(date);
    },
    [onDateSelect]
  );

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedDate(event.date);
    // You can add event editing logic here
    console.log("Event clicked:", event);
  }, []);

  const handleAddEvent = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    // This would typically open an add event modal
    console.log("Add event for date:", today);
  }, []);

  return (
    <div
      className={cn(
        "bg-background border overflow-hidden rounded-lg shadow-sm",
        className
      )}
    >
      {/* Calendar Header */}
      <CalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onAddEvent={canAddEvents ? handleAddEvent : undefined}
        canAddEvents={canAddEvents}
      />

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="p-2 text-center text-sm font-medium text-muted-foreground bg-muted/30 rounded-sm"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
          {monthDays.map((day) => (
            <CalendarDayCell
              key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
              day={day}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
              canAddEvents={canAddEvents}
            />
          ))}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="p-4 border-t bg-muted/10">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
              <span>Selected</span>
            </div>
          </div>
          <div className="text-xs">Click on any date to select it</div>
        </div>
      </div>
    </div>
  );
}

// Export sub-components for advanced usage
export { CalendarHeader, CalendarDayCell };
