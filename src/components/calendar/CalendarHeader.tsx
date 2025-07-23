import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthNames } from "@/utils/calendar";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onAddEvent?: () => void;
  canAddEvents?: boolean;
}

export function CalendarHeader({
  currentMonth,
  currentYear,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onAddEvent,
  canAddEvents = false
}: CalendarHeaderProps) {
  const monthNames = getMonthNames();
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="ml-2"
        >
          Today
        </Button>
      </div>
      
      {/* Month and Year Display */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {canAddEvents && onAddEvent && (
          <Button variant="default" size="sm" onClick={onAddEvent}>
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
} 