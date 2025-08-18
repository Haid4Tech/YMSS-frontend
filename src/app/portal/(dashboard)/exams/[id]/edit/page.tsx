"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAtom } from "jotai";
import { toast } from "sonner";

import { PageHeader } from "@/components/general/page-header";
import { examsAPI } from "@/jotai/exams/exams";
import { subjectsAPI } from "@/jotai/subject/subject";
import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Subject } from "@/jotai/subject/subject-types";
import { Class } from "@/jotai/class/class-type";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { IExamFormData } from "@/common/types";
import { ExamFormInitialData } from "@/common/form";
import { extractErrorMessage } from "@/utils/helpers";

import ExamForm from "@/components/portal/dashboards/exams/form";

export default function Page() {
  const params = useParams();
  const examId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);
  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);
  const [formData, setFormData] = useState<IExamFormData>(ExamFormInitialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examData, subjectsData, classesData, teachersData] =
          await Promise.all([
            examsAPI.getById(parseInt(examId)),
            getAllSubjects(),
            getAllClasses(),
            getAllTeachers(),
          ]);

        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setTeachers(
          Array.isArray(teachersData.teachers) ? teachersData.teachers : []
        );

        setFormData({
          title: examData?.title,
          teacherId: examData?.teacherId.toString(),
          subjectId: examData?.subjectId.toString(),
          classId: examData?.classId.toString(),
          date: examData?.date,
          startTime: examData?.startTime ?? "",
          duration: examData?.duration ?? "",
          examType: examData?.examType ?? "",
        });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
      }
    };

    fetchData();
  }, [examId, getAllClasses, getAllSubjects, getAllTeachers]);

  const handleInputChange = (field: string, value: string | Date | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      date: date ? date.toISOString() : "",
    }));
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === "" ? "" : parseInt(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
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
        duration:
          typeof formData.duration === "string"
            ? parseInt(formData.duration)
            : formData.duration,
        examType: formData.examType,
      };

      await examsAPI.update(parseInt(examId!), examData);
      toast.success("Successfully updated exam record!");

      router.push("/portal/exams");
    } catch (error) {
      console.error(`Failed to update exam:`, error);
      toast.error(`Failed to update exam. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Edit Exam"}
        subtitle={"Modify existing examination details"}
      />

      <ExamForm
        loading={loading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        formData={formData}
        mode={"edit"}
        cancelHref="/portal/exams"
      />
    </div>
  );
}
