"use client";

import { useState, FC } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IDatePicker {
  label: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
}

const DatePicker: FC<IDatePicker> = ({
  label,
  date,
  setDate,
  minDate,
  maxDate,
  required,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="date" className="px-1">
        {label} {required ? "*" : ""}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="h-10 rounded-sm justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            fromDate={minDate}
            toDate={maxDate}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
