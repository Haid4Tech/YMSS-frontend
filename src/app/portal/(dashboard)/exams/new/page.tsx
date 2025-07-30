"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/form-field";
import DatePicker from "@/components/general/date-picker";
import { formatDate, formatTime } from "@/utils/calendar";
import { toast } from "sonner";

import { SelectItem } from "@/components/ui/select";
import { PageHeader } from "@/components/general/page-header";
import { examsAPI } from "@/jotai/exams/exams";
import { subjectsAPI } from "@/jotai/subject/subject";
import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Subject } from "@/jotai/subject/subject-types";
import { Class } from "@/jotai/class/class-type";
import { Teacher } from "@/jotai/teachers/teachers-types";

export default function AddExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);
  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);

  const [formData, setFormData] = useState({
    title: "",
    teacherId: "",
    subjectId: "",
    classId: "",
    date: "",
    startTime: "",
    duration: "",
    examType: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, classesData, teachersData] = await Promise.all([
          getAllSubjects(),
          getAllClasses(),
          getAllTeachers(),
        ]);

        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setTeachers(
          Array.isArray(teachersData.teachers) ? teachersData.teachers : []
        );
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [getAllClasses, getAllSubjects, getAllTeachers]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const examData = {
        title: formData.title,
        teacherId: parseInt(formData.teacherId),
        subjectId: parseInt(formData.subjectId),
        classId: formData.classId ? parseInt(formData.classId) : null,
        date: formData.date,
        startTime: formData.startTime,
        duration: parseInt(formData.duration),
        examType: formData.examType,
      };

      await examsAPI.create(examData);
      toast.success("Successfully scheduled new exam record!");
      router.push("/portal/exams");
    } catch (error) {
      console.error("Failed to create exam:", error);
      toast.error("Failed to schedule exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Schedule New Exam"}
        subtitle={"Create and schedule an examination"}
      />

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
                  label={"Subject"}
                  placeholder="Select subject"
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    handleInputChange("subjectId", value)
                  }
                >
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>
              <div>
                <SelectField
                  label="Class"
                  placeholder="Select class"
                  value={formData.classId}
                  onValueChange={(value) => handleInputChange("classId", value)}
                >
                  {/* <SelectItem value="">All Classes</SelectItem> */}
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name}
                      {/* (Grade {cls.grade}) */}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>
              <div>
                <SelectField
                  label="Exam Type"
                  placeholder="Select exam type"
                  value={formData.examType}
                  onValueChange={(value) =>
                    handleInputChange("examType", value)
                  }
                >
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="midterm">Mid-term Exam</SelectItem>
                  <SelectItem value="final">Final Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="practical">Practical Exam</SelectItem>
                </SelectField>
              </div>
              <div>
                <DatePicker
                  required
                  label={"Exam Date"}
                  date={formData.date ? new Date(formData.date) : undefined}
                  setDate={(date: Date | undefined) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: date ? date.toISOString() : "",
                    }))
                  }
                  minDate={new Date()}
                />
              </div>
              <div>
                <InputField
                  label={"Start Time"}
                  id="startTime"
                  type="time"
                  value={formData.startTime ? formData.startTime : "10:30:00"}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  required
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
              <div>
                <InputField
                  label="Duration (minutes)"
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  min="15"
                  max="480"
                  required
                />
              </div>
              {/* <div>
                  <InputField
                    label="Total Marks"
                    id="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      handleInputChange("totalMarks", e.target.value)
                    }
                    min="1"
                    max="1000"
                    required
                  />
                </div>
                <div>
                  <InputField
                    label="Passing Marks"
                    id="passingMarks"
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) =>
                      handleInputChange("passingMarks", e.target.value)
                    }
                    min="1"
                    max={formData.totalMarks || "1000"}
                    required
                  />
                </div> */}
              {/* <div>
                <InputField
                  label={"Room/Venue"}
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    handleInputChange("roomNumber", e.target.value)
                  }
                  placeholder="e.g., Room 101, Lab A, Auditorium"
                />
              </div> */}

              <div>
                <SelectField
                  label={"Supervisor/Invigilator"}
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    handleInputChange("teacherId", value)
                  }
                  placeholder="Name of supervising teacher"
                >
                  {teachers.map((teacher, index) => (
                    <SelectItem key={index} value={teacher.id.toString()}>
                      {teacher.user.name}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Content */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Exam Content & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <TextareaField
                label="Syllabus Topics"
                id="syllabusTopics"
                value={formData.syllabusTopics}
                onChange={(e) =>
                  handleInputChange("syllabusTopics", e.target.value)
                }
                placeholder="List the topics/chapters covered in this exam"
              />
            </div>
            <div>
              <TextareaField
                label="Exam Instructions"
                id="instructions"
                value={formData.instructions}
                onChange={(e) =>
                  handleInputChange("instructions", e.target.value)
                }
                placeholder="Special instructions for students (e.g., calculator allowed, open book, etc.)"
              />
            </div>
            <div>
              <TextareaField
                label="Required Materials"
                id="materials"
                value={formData.materials}
                onChange={(e) => handleInputChange("materials", e.target.value)}
                placeholder="List materials students need to bring (e.g., calculator, ruler, colored pencils)"
              />
            </div>
            <div>
              <TextareaField
                label="Grading Criteria"
                id="gradingCriteria"
                value={formData.gradingCriteria}
                onChange={(e) =>
                  handleInputChange("gradingCriteria", e.target.value)
                }
                placeholder="Describe how the exam will be graded and weighted"
              />
            </div>
          </CardContent>
        </Card> */}

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
                  {formData.date
                    ? formatDate(new Date(formData.date))
                    : "-- --"}{" "}
                  at{" "}
                  {formData.startTime
                    ? formatTime(formData.startTime)
                    : "-- --"}
                </p>
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {formData.duration ? formData.duration : "-- --"} minutes
                </p>
              </div>
              {/* <div className="space-y-2">
                <p>
                  <span className="font-medium">Total Marks:</span>{" "}
                  {formData.totalMarks}
                </p>
                <p>
                  <span className="font-medium">Passing Marks:</span>{" "}
                  {formData.passingMarks}
                </p>
                <p>
                  <span className="font-medium">Pass Percentage:</span>{" "}
                  {formData.totalMarks && formData.passingMarks
                    ? (
                        (parseInt(formData.passingMarks) /
                          parseInt(formData.totalMarks)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/exams">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Scheduling Exam..." : "Schedule Exam"}
          </Button>
        </div>
      </form>
    </div>
  );
}
