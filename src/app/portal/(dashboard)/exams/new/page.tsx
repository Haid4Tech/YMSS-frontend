"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { PageHeader } from "@/components/general/page-header";
import { examsAPI } from "@/jotai/exams/exams";
import { subjectsAPI } from "@/jotai/subject/subject";
import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Subject } from "@/jotai/subject/subject-types";
import { Class } from "@/jotai/class/class-type";
import { Teacher } from "@/jotai/teachers/teachers-types";

import ExamForm, {
  ExamScheduleFormValues,
} from "@/components/portal/dashboards/exams/form";

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

  // Exam date/time are managed by their own react-hook-form instance
  // (FormDate/FormTime require a react-hook-form context), scoped just to
  // the schedule fields - the rest of the form stays on the existing
  // useState-driven formData above.
  const scheduleForm = useForm<ExamScheduleFormValues>({
    defaultValues: { date: undefined, startTime: "" },
    mode: "onChange",
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

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === "" ? "" : parseInt(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleValid = await scheduleForm.trigger();
    if (!scheduleValid) {
      toast.error("Please fix the schedule errors before submitting the form.");
      return;
    }
    const schedule = scheduleForm.getValues();

    setLoading(true);

    try {
      const examData = {
        title: formData.title,
        teacherId: parseInt(formData.teacherId),
        subjectId: parseInt(formData.subjectId),
        classId: formData.classId ? parseInt(formData.classId) : null,
        date: schedule.date ? schedule.date.toISOString() : "",
        startTime: schedule.startTime,
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

      <ExamForm
        loading={loading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleNumberChange={handleNumberChange}
        scheduleForm={scheduleForm}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        formData={formData}
        mode={"create"}
        cancelHref="/portal/exams"
      />
    </div>
  );
}
