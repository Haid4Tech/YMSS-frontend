"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { toast } from "sonner";

import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { Class } from "@/jotai/class/class-type";
import { ClassFormInitialData } from "@/common/form";
import { IClassFormData } from "@/common/types";
import { extractErrorMessage } from "@/utils/helpers";

import { PageHeader } from "@/components/general/page-header";
import ClassForm from "@/components/portal/dashboards/class/form";

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [loading, setLoading] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] =
    useState<IClassFormData>(ClassFormInitialData);

  const [, getAllTeachers] = useAtom(teachersAPI.getAll);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classData, teachersData] = await Promise.all([
          classesAPI.getById(parseInt(classId)),
          getAllTeachers(),
        ]);

        setTeachers(
          Array.isArray(teachersData.teachers) ? teachersData.teachers : []
        );

        // Populate form with existing class data
        setFormData({
          name: classData?.name || "",
          gradeLevel: classData?.gradeLevel || "",
          capacity: classData?.capacity?.toString() || "",
          roomNumber: classData?.roomNumber || "",
          description: classData?.description || "",
          teacherId: classData?.teacher?.id?.toString() || "",
          academicYear: classData?.academicYear || "",
          schedule: {
            startDate: classData?.startDate || "",
            endDate: classData?.endDate || "",
            startTime: classData?.startTime || "",
            endTime: classData?.endTime || "",
            days: classData?.days || [],
          },
          subjects: [],
        });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        console.error("Failed to fetch class data:", error);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId, getAllTeachers]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Class),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDateChange =
    (dateType: "startDate" | "endDate") => (date: Date | undefined) => {
      setFormData((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [dateType]: date ? date.toISOString() : "",
        },
      }));
    };

  const handleArrayChange = (field: string, value: string[]) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Class),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const classData = {
        name: formData.name,
        capacity: parseInt(formData.capacity) || 0,
        gradeLevel: formData.gradeLevel,
        roomNumber: formData.roomNumber,
        description: formData.description,
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
        academicYear: formData.academicYear,
        schedule: {
          startDate: formData.schedule.startDate,
          endDate: formData.schedule.endDate,
          startTime: formData.schedule.startTime,
          endTime: formData.schedule.endTime,
          days: formData.schedule.days,
        },
        exams: [],
      };

      await classesAPI.update(parseInt(classId), classData);
      toast.success("Class updated successfully!");

      router.push(`/portal/classes/${classId}`);
    } catch (error) {
      console.error("Failed to update class:", error);
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to update class. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Class"
        subtitle="Update class information and settings"
        link={`/portal/classes/${classId}`}
      />

      <ClassForm
        loading={loading}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleArrayChange={handleArrayChange}
        teachers={teachers}
        formData={formData}
        mode="edit"
        cancelHref={`/portal/classes/${classId}`}
      />
    </div>
  );
}
