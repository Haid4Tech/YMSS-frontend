"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { HTMLProps, useState } from "react";
import { useFormContext, type RegisterOptions } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FormDateProps extends Omit<HTMLProps<HTMLInputElement>, "ref"> {
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  shouldValidate?: boolean;
  disableRule?: (date: Date) => boolean;
  rules?: RegisterOptions;
}

// Date picker for react-hook-form-based forms. Wires a shadcn Calendar +
// Popover into <FormField>.
const FormDate = ({
  label,
  name,
  placeholder,
  disabled,
  shouldValidate = false,
  disableRule,
  rules,
}: FormDateProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { control, setValue } = useFormContext();

  const defaultDisableRule = (date: Date) =>
    date > new Date() || date < new Date("1900-01-01");

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col gap-2">
          <FormLabel>{label}</FormLabel>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  className={cn(
                    "h-10 w-full justify-between rounded-sm font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                  variant="outline"
                >
                  {field.value ? (
                    format(field.value, "dd/MM/yyyy")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                autoFocus
                disabled={disableRule ?? defaultDisableRule}
                startMonth={new Date(2000, 0)}
                endMonth={new Date(new Date().getFullYear() + 10, 11)}
                mode="single"
                selected={field.value}
                showOutsideDays={false}
                onSelect={(date) => {
                  field.onChange(date);
                  setValue(name, date, {
                    shouldTouch: true,
                    shouldDirty: true,
                    shouldValidate: shouldValidate,
                  });
                  setIsPopoverOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormDate;
