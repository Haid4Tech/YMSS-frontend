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
  maxDate = new Date(new Date().getFullYear() + 10, 11, 31),
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
            onSelect={(d) => {
              if (d) {
                setDate(d);
                setOpen(false);
              }
            }}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            captionLayout="dropdown"
            defaultMonth={date || new Date()}
            startMonth={minDate || new Date(1900, 0)}
            endMonth={maxDate || new Date(new Date().getFullYear() + 10, 11)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
