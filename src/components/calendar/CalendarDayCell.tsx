import { CalendarDay, CalendarEvent } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { formatTime, getCategoryColor } from "@/utils/calendar";

interface CalendarDayCellProps {
  day: CalendarDay;
  onDayClick: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  canAddEvents?: boolean;
}

export function CalendarDayCell({
  day,
  onDayClick,
  onEventClick,
  className,
  canAddEvents = false
}: CalendarDayCellProps) {
  const handleDayClick = () => {
    onDayClick(day.date);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent day click when clicking on event
    onEventClick?.(event);
  };

  return (
    <div
      className={cn(
        "min-h-[120px] p-2 border border-border/40 cursor-pointer transition-colors hover:bg-muted/30",
        {
          // Current month styling
          "bg-background": day.isCurrentMonth,
          "bg-muted/20": !day.isCurrentMonth,
          
          // Today styling
          "ring-2 ring-primary ring-inset": day.isToday,
          
          // Selected styling
          "bg-primary/10": day.isSelected,
          
          // Text styling for non-current month
          "text-muted-foreground": !day.isCurrentMonth,
        },
        className
      )}
      onClick={handleDayClick}
    >
      {/* Day Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium",
            {
              "text-primary font-bold": day.isToday,
              "text-foreground": day.isCurrentMonth && !day.isToday,
              "text-muted-foreground": !day.isCurrentMonth,
            }
          )}
        >
          {day.dayNumber}
        </span>
        
        {/* Event count indicator for days with many events */}
        {day.events.length > 3 && (
          <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
            +{day.events.length - 3}
          </span>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-1">
        {day.events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="group relative cursor-pointer"
            onClick={(e) => handleEventClick(event, e)}
          >
            <div
              className="text-xs p-1 rounded text-white truncate group-hover:shadow-sm transition-shadow"
              style={{ backgroundColor: getCategoryColor(event.category) }}
              title={`${event.title}${event.startTime ? ` at ${formatTime(event.startTime)}` : ''}`}
            >
              <div className="flex items-center gap-1">
                {event.startTime && (
                  <span className="opacity-90 text-[10px]">
                    {formatTime(event.startTime)}
                  </span>
                )}
                <span className="truncate font-medium">
                  {event.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Hint */}
      {day.events.length === 0 && day.isCurrentMonth && canAddEvents && (
        <div className="flex items-center justify-center h-full text-muted-foreground/50">
          <span className="text-xs">Click to add event</span>
        </div>
      )}
    </div>
  );
} 