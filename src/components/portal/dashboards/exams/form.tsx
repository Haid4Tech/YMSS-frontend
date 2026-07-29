import { FC, useMemo } from "react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/form-field";
import { Form } from "@/components/ui/form";
import FormDate from "@/components/general/form-date";
import FormTime from "@/components/general/form-time";
import { formatDate, formatTime } from "@/utils/calendar";

import { SelectItem } from "@/components/ui/select";
import { Class } from "@/jotai/class/class-type";
import { Subject } from "@/jotai/subject/subject-types";

import { IExamFormData } from "@/common/types";
import { Teacher } from "@/jotai/teachers/teachers-types";

export interface ExamScheduleFormValues {
  date: Date | undefined;
  startTime: string;
}

interface IExamForm {
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (field: string, value: string) => void;
  handleNumberChange: (field: string, value: string) => void;
  scheduleForm: UseFormReturn<ExamScheduleFormValues>;
  classes: Array<Class>;
  subjects: Array<Subject>;
  teachers: Array<Teacher>;
  formData: IExamFormData;
  mode: "create" | "edit";
  cancelHref?: string;
}

const ExamForm: FC<IExamForm> = ({
  loading,
  classes,
  teachers,
  subjects,
  handleSubmit,
  handleInputChange,
  handleNumberChange,
  scheduleForm,
  formData,
  mode,
  cancelHref = "/portal/exams",
}) => {
  const isEditMode = mode === "edit";
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const watchedDate = scheduleForm.watch("date");
  const watchedStartTime = scheduleForm.watch("startTime");
  // Only offer subjects that belong to the selected class, since each
  // subject is tied to exactly one class/stream.
  const subjectsForClass = formData.classId
    ? subjects.filter((subject) => subject.classId?.toString() === formData.classId)
    : subjects;
  const submitButtonText = loading
    ? isEditMode
      ? "Updating Exam..."
      : "Scheduling Exam..."
    : isEditMode
    ? "Update Exam"
    : "Schedule Exam";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label={"Exam Title"}
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Mathematics Mid-term Exam"
                required
              />
            </div>
            <div>
              <SelectField
                label="Class"
                placeholder="Select class"
                value={formData.classId}
                onValueChange={(value) => {
                  handleInputChange("classId", value);
                  // The previously selected subject may not belong to the
                  // newly selected class, so clear it.
                  handleInputChange("subjectId", "");
                }}
              >
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            <div>
              <SelectField
                label={"Subject"}
                placeholder={
                  formData.classId ? "Select subject" : "Select a class first"
                }
                value={formData.subjectId}
                onValueChange={(value) => handleInputChange("subjectId", value)}
              >
                {subjectsForClass.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            <div>
              <SelectField
                label="Exam Type"
                placeholder="Select exam type"
                value={formData.examType}
                onValueChange={(value) => handleInputChange("examType", value)}
              >
                {[
                  "Quiz",
                  "Mid-term Exam",
                  "Final Exam",
                  "Assignment",
                  "Practical Exam",
                ].map((item, index) => (
                  <SelectItem className="capitalize" key={index} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            <Form {...scheduleForm}>
              <div>
                <FormDate
                  name="date"
                  label="Exam Date"
                  placeholder="Select exam date"
                  disableRule={
                    isEditMode ? undefined : (date) => date < todayStart
                  }
                  rules={{ required: "Exam date is required" }}
                />
              </div>
              <div>
                <FormTime
                  name="startTime"
                  label="Start Time"
                  placeholder="Select start time"
                  interval={15}
                  rules={{ required: "Start time is required" }}
                />
              </div>
            </Form>
            <div>
              <InputField
                label="Duration (minutes)"
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleNumberChange("duration", e.target.value)}
                min="15"
                max="480"
                required
              />
            </div>

            <div>
              <SelectField
                label={"Supervisor/Invigilator"}
                value={formData.teacherId}
                onValueChange={(value) => handleInputChange("teacherId", value)}
                placeholder="Name of supervising teacher"
              >
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {`${teacher.user.firstname ?? "Not"} ${
                      teacher.user.lastname ?? "Available"
                    }`}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Subject:</span>{" "}
                {subjects.find((s) => s.id.toString() === formData.subjectId)
                  ?.name || "Not selected"}
              </p>
              <p>
                <span className="font-medium">Date & Time:</span>{" "}
                {watchedDate ? formatDate(watchedDate) : "-- --"} at{" "}
                {watchedStartTime ? formatTime(watchedStartTime) : "-- --"}
              </p>
              <p>
                <span className="font-medium">Duration:</span>{" "}
                {formData.duration ? formData.duration : "-- --"} minutes
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Class:</span>{" "}
                {classes.find((c) => c.id.toString() === formData.classId)
                  ?.name || "Not selected"}
              </p>
              <p>
                <span className="font-medium">Supervisor:</span>{" "}
                {teachers.find((t) => t.id.toString() === formData.teacherId)
                  ? `${
                      teachers.find(
                        (t) => t.id.toString() === formData.teacherId
                      )?.user.firstname ?? ""
                    } ${
                      teachers.find(
                        (t) => t.id.toString() === formData.teacherId
                      )?.user.lastname ?? ""
                    }`.trim() || "Not selected"
                  : "Not selected"}
              </p>
              <p>
                <span className="font-medium">Exam Type:</span>{" "}
                {formData.examType || "Not selected"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ExamForm;
