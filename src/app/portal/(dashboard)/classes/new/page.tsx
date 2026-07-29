"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/general/page-header";

import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import FormDate from "@/components/general/form-date";
import FormTime from "@/components/general/form-time";
import { ClassFormInitialData } from "@/common/form";
import { IClassFormData } from "@/common/types";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { GRADE_LEVELS, SENIOR_SECONDARY_LEVELS } from "@/jotai/class/class-type";
import { SUBJECT_CATEGORIES } from "@/jotai/subject/subject-types";

interface ScheduleFormValues {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
}

export default function AddClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);

  const [formData, setFormData] =
    useState<IClassFormData>(ClassFormInitialData);

  // Start/end date and time are managed by their own react-hook-form
  // instance (FormDate/FormTime require a react-hook-form context), scoped
  // just to the schedule fields - the rest of the form stays on the
  // existing useState-driven formData above.
  const scheduleForm = useForm<ScheduleFormValues>({
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      startTime: "",
      endTime: "",
    },
    mode: "onChange",
  });

  // Start/end date must be today or later - a class can't be scheduled to
  // start in the past. Recomputed per render is fine (cheap), but memoized
  // to keep a stable reference for the disableRule/validate callbacks below.
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersData = await getAllTeachers();
        setTeachers(teachersData !== null ? teachersData.teachers : []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, [getAllTeachers]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter((d) => d !== day)
          : [...prev.schedule.days, day],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the schedule fields (required dates, end >= start) before
    // submitting - errors render inline under each FormDate/FormTime field.
    const scheduleValid = await scheduleForm.trigger();
    if (!scheduleValid) {
      toast.error("Please fix the schedule errors before submitting the form.");
      return;
    }

    const schedule = scheduleForm.getValues();
    const toDateString = (date: Date | undefined) =>
      date ? date.toISOString().split("T")[0] : "";

    setLoading(true);

    try {
      const classData = {
        name: formData.name,
        gradeLevel: formData.gradeLevel,
        stream: formData.stream || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        roomNumber: formData.roomNumber,
        description: formData.description,
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
        academicYear: formData.academicYear,
        schedule: {
          startDate: toDateString(schedule.startDate),
          endDate: toDateString(schedule.endDate),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          days: formData.schedule.days,
        },
      };

      await classesAPI.create(classData);
      toast.success("Class created successfully");
      router.push("/portal/classes");
    } catch (error) {
      console.error("Failed to create class:", error);
      const errorMessage = extractErrorMessage(error);
      toast.error("Failed to create class", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Add New Class"}
        subtitle={"Set up a new class with all details"}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Class Name"
                required
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Grade 10-A, Science Class"
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

              <InputField
                label="Student Capacity"
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                min="1"
                max="100"
                placeholder="Leave blank for no limit"
              />

              <InputField
                label="Room Number"
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) =>
                  handleInputChange("roomNumber", e.target.value)
                }
                placeholder="e.g., Room 101, Lab A"
              />

              <SelectField
                label="Academic Year"
                value={formData.academicYear}
                onValueChange={(value) =>
                  handleInputChange("academicYear", value)
                }
                placeholder="Select academic year"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const currentYear = new Date().getFullYear();
                  const yearStart = currentYear + i;
                  const yearEnd = yearStart + 1;
                  return (
                    <SelectItem
                      key={yearStart}
                      value={`${yearStart}-${yearEnd}`}
                    >
                      {yearStart}/{yearEnd}
                    </SelectItem>
                  );
                })}
              </SelectField>

              <SelectField
                label="Class Teacher"
                value={formData.teacherId}
                onValueChange={(value) => handleInputChange("teacherId", value)}
                placeholder="Select class teacher"
              >
                <SelectItem value="none">No Class Teacher</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {`${teacher.user.firstname ?? "Not"} ${
                      teacher.user.lastname ?? "Available"
                    }`}
                  </SelectItem>
                ))}
              </SelectField>

              <div className="md:col-span-2">
                <TextareaField
                  label="Description"
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Brief description of the class, special programs, or notes"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
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
                  disableRule={(date) => date < todayStart}
                  rules={{
                    required: "Start date is required",
                    validate: (value: Date) => {
                      if (value && value < todayStart) {
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
                  disableRule={(date) => date < todayStart}
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
                  label="Class Start Time"
                  placeholder="Select start time"
                  interval={30}
                />

                <FormTime
                  name="endTime"
                  label="Class End Time"
                  placeholder="Select end time"
                  interval={30}
                />
              </div>
            </Form>

            <div>
              <Label>Class Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                      formData.schedule.days.includes(day)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/classes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Class..." : "Create Class"}
          </Button>
        </div>
      </form>
    </div>
  );
}
