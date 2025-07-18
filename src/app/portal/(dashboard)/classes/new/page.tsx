"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";

import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";

import DatePicker from "@/components/general/date-picker";

export default function AddClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);

  // Date states for DatePicker components (expects Date objects)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Validation state for dates
  const [dateError, setDateError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    capacity: "",
    roomNumber: "",
    description: "",
    classTeacherId: "",
    academicYear: "",
    schedule: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      days: [] as string[],
    },
    subjects: [] as string[],
  });

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

  // Validate date range
  const validateDates = (start: Date | undefined, end: Date | undefined) => {
    if (start && end && start > end) {
      setDateError("Start date cannot be later than end date");
      return false;
    }
    setDateError("");
    return true;
  };

  // Handle start date changes and sync with form data
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);

    // Always validate and set error state
    const isValid = validateDates(date, endDate);

    // Only update form data if dates are valid
    if (isValid) {
      const dateString = date ? date.toISOString().split("T")[0] : "";
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          startDate: dateString,
        },
      }));
    }
  };

  // Handle end date changes and sync with form data
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);

    // Always validate and set error state
    const isValid = validateDates(startDate, date);

    // Only update form data if dates are valid
    if (isValid) {
      const dateString = date ? date.toISOString().split("T")[0] : "";
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          endDate: dateString,
        },
      }));
    }
  };

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

    // Validate dates before submission
    if (dateError) {
      alert("Please fix the date errors before submitting the form.");
      return;
    }

    // Validate that both dates are provided if one is provided
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setDateError(
        "Both start date and end date are required if using date range."
      );
      return;
    }

    setLoading(true);

    try {
      const classData = {
        name: formData.name,
        grade: parseInt(formData.grade) || null,
        section: formData.section,
        capacity: parseInt(formData.capacity) || null,
        roomNumber: formData.roomNumber,
        description: formData.description,
        classTeacherId: formData.classTeacherId
          ? parseInt(formData.classTeacherId)
          : null,
        academicYear: formData.academicYear,
        schedule: formData.schedule,
      };

      await classesAPI.create(classData);
      router.push("/portal/classes");
    } catch (error) {
      console.error("Failed to create class:", error);
      alert("Failed to create class. Please try again.");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/classes">← Back to Classes</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Class</h1>
            <p className="text-muted-foreground">
              Set up a new class with all details
            </p>
          </div>
        </div>
      </div>

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
                value={formData.grade}
                onValueChange={(value) => handleInputChange("grade", value)}
                placeholder="Select grade"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Grade {i + 1}
                  </SelectItem>
                ))}
                <SelectItem value="kindergarten">Kindergarten</SelectItem>
                <SelectItem value="pre-k">Pre-K</SelectItem>
              </SelectField>

              <SelectField
                label="Section"
                value={formData.section}
                onValueChange={(value) => handleInputChange("section", value)}
                placeholder="Select section"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <SelectItem
                    key={String.fromCharCode(65 + i)}
                    value={String.fromCharCode(65 + i)}
                  >
                    Section {String.fromCharCode(65 + i)}
                  </SelectItem>
                ))}
              </SelectField>

              <InputField
                label="Student Capacity"
                required
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                min="1"
                max="100"
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
                value={formData.classTeacherId}
                onValueChange={(value) =>
                  handleInputChange("classTeacherId", value)
                }
                placeholder="Select class teacher"
              >
                <SelectItem value="none">No Class Teacher</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.user.name}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                date={startDate}
                setDate={handleStartDateChange}
                maxDate={endDate}
              />

              <DatePicker
                label="End Date"
                date={endDate}
                setDate={handleEndDateChange}
                minDate={startDate}
              />
            </div>

            {/* Date validation error */}
            {dateError && (
              <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                {dateError}
              </div>
            )}

            <div>
              <Label>Class Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
