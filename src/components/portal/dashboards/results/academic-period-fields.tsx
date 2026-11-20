"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grade } from "@/jotai/grades/grades-types";

type AcademicPeriod = Pick<Grade, "academicYear" | "term">;

interface AcademicPeriodFieldsProps extends AcademicPeriod {
  onChange: (period: AcademicPeriod) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function AcademicPeriodFields({
  academicYear,
  term,
  onChange,
  disabled = false,
  compact = false,
}: AcademicPeriodFieldsProps) {
  const id = useId();
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(academicYear.split("/")[0]);
  // Keep nearby past and future sessions available as the selection advances.
  const firstYear = Math.min(selectedYear - 5, currentYear - 5);
  const lastYear = Math.max(selectedYear + 5, currentYear + 2);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const year = firstYear + index;
    return `${year}/${year + 1}`;
  });

  return (
    <div className={compact ? "grid grid-cols-2 gap-2 max-w-xl" : "grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl"}>
      <div className="space-y-2">
        <Label htmlFor={`${id}-year`}>Academic Year</Label>
        <Select
          value={academicYear}
          onValueChange={(value) => onChange({ academicYear: value, term })}
          disabled={disabled}
        >
          <SelectTrigger id={`${id}-year`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-term`}>Term</Label>
        <Select
          value={term}
          onValueChange={(value: Grade["term"]) => onChange({ academicYear, term: value })}
          disabled={disabled}
        >
          <SelectTrigger id={`${id}-term`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIRST">First Term</SelectItem>
            <SelectItem value="SECOND">Second Term</SelectItem>
            <SelectItem value="THIRD">Third Term</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
