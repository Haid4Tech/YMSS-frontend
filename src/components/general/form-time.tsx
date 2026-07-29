"use client";

import { HTMLProps, memo, useEffect, useMemo, useState } from "react";
import { useFormContext, type RegisterOptions } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface FormTimeProps extends Omit<HTMLProps<HTMLSelectElement>, "ref"> {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  shouldValidate?: boolean;
  baseDate?: Date;
  disableRule?: (date: Date) => boolean;
  interval?: number;
  /**
   * How option labels are displayed: '12' => "1:00 PM", '24' => "13:00"
   * Default: '12'
   */
  displayFormat?: "12" | "24";
  /**
   * How the selected value is returned to the form:
   * '12' => "1:00 PM", '24' => "13:00"
   * Default: '24' (keeps previous behavior of returning "HH:MM")
   */
  valueFormat?: "12" | "24";
  rules?: RegisterOptions;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Time-of-day select for react-hook-form-based forms, generating options at
// a fixed interval (default hourly) with independent display/value formats
// and optional per-slot disabling (e.g. no times before "now" on the
// current day).
const FormTime = ({
  label,
  name,
  placeholder = "Select time",
  disabled,
  defaultValue,
  className,
  shouldValidate = true,
  baseDate,
  disableRule,
  interval = 60,
  displayFormat = "12",
  valueFormat = "24",
  rules,
}: FormTimeProps) => {
  const { control, setValue } = useFormContext();
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    (defaultValue as string) ?? undefined
  );

  const hasBaseDate = Boolean(baseDate);

  const anchorDay = useMemo(() => {
    if (!hasBaseDate) return null;
    const d = new Date(baseDate as Date);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return day;
  }, [baseDate, hasBaseDate]);

  const formatLabel = (h: number, m: number, fmt: "12" | "24") => {
    if (fmt === "24") {
      return `${pad(h)}:${pad(m)}`;
    }
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12}:${pad(m)} ${ampm}`;
  };

  const formatValue = (h: number, m: number, fmt: "12" | "24") => {
    if (fmt === "24") {
      return `${pad(h)}:${pad(m)}`;
    }
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12}:${pad(m)} ${ampm}`;
  };

  const generateOptions = (
    intervalMinutes = 60,
    displayFmt: "12" | "24" = "12",
    valueFmt: "12" | "24" = "24"
  ) => {
    const out: {
      value: string;
      label: string;
      hour: number;
      minute: number;
    }[] = [];

    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const value = formatValue(h, m, valueFmt);
        const label = formatLabel(h, m, displayFmt);

        out.push({ value, label, hour: h, minute: m });
      }
    }

    return out;
  };

  const options = useMemo(
    () => generateOptions(interval, displayFormat, valueFormat),
    [interval, displayFormat, valueFormat]
  );

  const disabledMap = useMemo(() => {
    const map = new Map<string, boolean>();

    // If no baseDate was provided, make the date "free for all" (no automatic disabling).
    // This follows the requested behavior: when baseDate is undefined, return all time values.
    if (!hasBaseDate) {
      for (const opt of options) {
        map.set(opt.value, false);
      }
      return map;
    }

    const now = new Date();

    for (const opt of options) {
      const candidate = new Date(anchorDay as Date);
      candidate.setHours(opt.hour, opt.minute, 0, 0);

      let isDisabled = false;

      if (disableRule) {
        // If a custom disableRule is provided and baseDate is present, use it.
        isDisabled = disableRule(candidate);
      } else {
        // Default behavior: if baseDate is today, disable times earlier than "now".
        const isSameDay =
          candidate.getFullYear() === now.getFullYear() &&
          candidate.getMonth() === now.getMonth() &&
          candidate.getDate() === now.getDate();

        if (isSameDay) {
          // For today, disable times earlier than or equal to "now"
          isDisabled = candidate.getTime() <= now.getTime();
        } else if (candidate < (anchorDay as Date)) {
          // If somehow before baseDate's anchorDay, disable
          isDisabled = true;
        }
      }

      map.set(opt.value, Boolean(isDisabled));
    }

    return map;
  }, [options, anchorDay, disableRule, hasBaseDate]);

  useEffect(() => {
    if (!selectedValue) return;

    if (disabledMap.get(selectedValue)) {
      setSelectedValue(undefined);
      setValue(name, undefined, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: shouldValidate,
      });
    }
  }, [baseDate, disabledMap, selectedValue, name, setValue, shouldValidate]);

  const handleChange = (val: string) => {
    if (disabledMap.get(val)) return;
    setSelectedValue(val);
    setValue(name, val, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: shouldValidate,
    });
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={() => (
        <FormItem className="gap-2">
          <FormLabel>{label}</FormLabel>
          <Select
            disabled={disabled}
            value={selectedValue !== undefined ? String(selectedValue) : ""}
            onValueChange={handleChange}
          >
            <FormControl>
              <SelectTrigger className={cn("h-10 w-full", className)}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent
              position="popper"
              className="max-h-[250px] w-[--radix-select-trigger-width] overflow-y-auto"
            >
              {options.map((opt) => {
                const isDisabled = Boolean(disabledMap.get(opt.value));

                return (
                  <SelectItem
                    key={opt.value}
                    aria-disabled={isDisabled}
                    className={
                      isDisabled ? "pointer-events-none opacity-50" : undefined
                    }
                    disabled={isDisabled}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default memo(FormTime);
