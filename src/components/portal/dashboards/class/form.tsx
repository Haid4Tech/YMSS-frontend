import { FC } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import DatePicker from "@/components/general/date-picker";
import { SelectItem } from "@/components/ui/select";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { IClassFormData } from "@/common/types";

interface IClassForm {
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (field: string, value: string) => void;
  handleDateChange: (
    dateType: "startDate" | "endDate"
  ) => (date: Date | undefined) => void;
  handleArrayChange: (field: string, value: string[]) => void;
  teachers: Array<Teacher>;
  formData: IClassFormData;
  mode: "create" | "edit";
  cancelHref?: string;
}

const ClassForm: FC<IClassForm> = ({
  loading,
  handleSubmit,
  handleInputChange,
  handleDateChange,
  handleArrayChange,
  teachers,
  formData,
  mode,
  cancelHref = "/portal/classes",
}) => {
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
              onValueChange={(value) => handleInputChange("gradeLevel", value)}
              placeholder="Select grade"
            >
              {Array.from({ length: 6 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Grade {i + 1}
                </SelectItem>
              ))}
            </SelectField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Room Number"
              value={formData.roomNumber}
              onChange={(e) => handleInputChange("roomNumber", e.target.value)}
              placeholder="Enter room number"
            />
            <InputField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              placeholder="Enter maximum capacity"
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label={"Start Date"}
              date={
                formData.schedule.startDate
                  ? new Date(formData.schedule.startDate)
                  : undefined
              }
              setDate={handleDateChange("startDate")}
            />

            <DatePicker
              label={"End Date"}
              date={
                formData.schedule.endDate
                  ? new Date(formData.schedule.endDate)
                  : undefined
              }
              setDate={handleDateChange("endDate")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Start Time"
              type="time"
              value={formData.schedule.startTime}
              onChange={(e) =>
                handleInputChange("schedule.startTime", e.target.value)
              }
              placeholder="HH:MM"
            />
            <InputField
              label="End Time"
              type="time"
              value={formData.schedule.endTime}
              onChange={(e) =>
                handleInputChange("schedule.endTime", e.target.value)
              }
              placeholder="HH:MM"
            />
          </div>

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
