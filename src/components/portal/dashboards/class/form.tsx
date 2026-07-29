import { FC, useMemo } from "react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import { Form } from "@/components/ui/form";
import FormDate from "@/components/general/form-date";
import FormTime from "@/components/general/form-time";
import { SelectItem } from "@/components/ui/select";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { IClassFormData } from "@/common/types";
import { GRADE_LEVELS, SENIOR_SECONDARY_LEVELS } from "@/jotai/class/class-type";
import { SUBJECT_CATEGORIES } from "@/jotai/subject/subject-types";

export interface ClassScheduleFormValues {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
}

interface IClassForm {
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (field: string, value: string) => void;
  scheduleForm: UseFormReturn<ClassScheduleFormValues>;
  handleArrayChange: (field: string, value: string[]) => void;
  teachers: Array<Teacher>;
  formData: IClassFormData;
  mode: "create" | "edit";
  cancelHref?: string;
  // Sum of students currently added to this class (edit mode only).
  currentEnrollment?: number;
}

const ClassForm: FC<IClassForm> = ({
  loading,
  handleSubmit,
  handleInputChange,
  scheduleForm,
  handleArrayChange,
  teachers,
  formData,
  mode,
  cancelHref = "/portal/classes",
  currentEnrollment,
}) => {
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const dayOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  const handleDayToggle = (day: string) => {
    const currentDays = formData.schedule.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    handleArrayChange("schedule.days", newDays);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Class Name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter class name"
            />

            <SelectField
              label="Grade Level"
              required
              value={formData.gradeLevel}
              onValueChange={(value) => {
                handleInputChange("gradeLevel", value);
                // Stream only applies to Senior Secondary levels.
                if (!SENIOR_SECONDARY_LEVELS.includes(value)) {
                  handleInputChange("stream", "");
                }
              }}
              placeholder="Select grade"
            >
              {GRADE_LEVELS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectField>

            {SENIOR_SECONDARY_LEVELS.includes(formData.gradeLevel) && (
              <SelectField
                label="Stream"
                required
                value={formData.stream}
                onValueChange={(value) => handleInputChange("stream", value)}
                placeholder="Select stream"
              >
                {SUBJECT_CATEGORIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectField>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Room Number"
              value={formData.roomNumber}
              onChange={(e) => handleInputChange("roomNumber", e.target.value)}
              placeholder="Enter room number"
            />
            <div>
              <InputField
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                placeholder="Leave blank for no limit"
              />
              {currentEnrollment !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentEnrollment} student
                  {currentEnrollment !== 1 ? "s" : ""} currently enrolled
                  {formData.capacity
                    ? ` of ${formData.capacity}`
                    : " (no capacity limit set)"}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) =>
                handleInputChange("academicYear", e.target.value)
              }
              placeholder="e.g., 2024-2025"
            />
            <SelectField
              label="Class Teacher"
              value={formData.teacherId}
              onValueChange={(value) => handleInputChange("teacherId", value)}
            >
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                  {teacher.user.firstname} {teacher.user.lastname}
                </SelectItem>
              ))}
            </SelectField>
          </div>

          <TextareaField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter class description"
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...scheduleForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormDate
                name="startDate"
                label="Start Date"
                placeholder="Select start date"
                disableRule={
                  mode === "create"
                    ? (date) => date < todayStart
                    : () => false
                }
                rules={{
                  required: "Start date is required",
                  validate: (value: Date) => {
                    if (mode === "create" && value && value < todayStart) {
                      return "Start date must be today or later";
                    }
                    return true;
                  },
                }}
              />

              <FormDate
                name="endDate"
                label="End Date"
                placeholder="Select end date"
                disableRule={
                  mode === "create"
                    ? (date) => date < todayStart
                    : () => false
                }
                rules={{
                  required: "End date is required",
                  validate: (value: Date) => {
                    const start = scheduleForm.getValues("startDate");
                    if (start && value && value < start) {
                      return "End date cannot be before start date";
                    }
                    return true;
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTime
                name="startTime"
                label="Start Time"
                placeholder="Select start time"
                interval={30}
              />
              <FormTime
                name="endTime"
                label="End Time"
                placeholder="Select end time"
                interval={30}
              />
            </div>
          </Form>

          <div className="space-y-2">
            <label className="text-sm font-medium">Class Days</label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={
                    formData.schedule.days?.includes(day.value)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleDayToggle(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Class"
            : "Update Class"}
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;
