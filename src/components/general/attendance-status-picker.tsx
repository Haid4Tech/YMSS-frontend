"use client";

import { cn } from "@/lib/utils";
import { AttendanceStatus } from "@/jotai/subject-attendance/subject-attendance-type";

const OPTIONS: { value: AttendanceStatus; label: string; activeClass: string }[] = [
  { value: AttendanceStatus.PRESENT, label: "P", activeClass: "bg-green-600 text-white border-green-600" },
  { value: AttendanceStatus.ABSENT, label: "A", activeClass: "bg-red-600 text-white border-red-600" },
  { value: AttendanceStatus.LATE, label: "L", activeClass: "bg-yellow-500 text-white border-yellow-500" },
  { value: AttendanceStatus.EXCUSED, label: "E", activeClass: "bg-blue-600 text-white border-blue-600" },
];

const FULL_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "Present",
  [AttendanceStatus.ABSENT]: "Absent",
  [AttendanceStatus.LATE]: "Late",
  [AttendanceStatus.EXCUSED]: "Excused",
};

interface AttendanceStatusPickerProps {
  value: AttendanceStatus | "NOT_MARKED";
  onChange: (status: AttendanceStatus) => void;
}

export function AttendanceStatusPicker({
  value,
  onChange,
}: AttendanceStatusPickerProps) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={FULL_LABELS[option.value]}
          aria-label={FULL_LABELS[option.value]}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 w-7 rounded-md border text-xs font-semibold cursor-pointer transition-colors",
            value === option.value
              ? option.activeClass
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
