"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { Class } from "@/jotai/class/class-type";
import { ClassFormInitialData } from "@/common/form";
import { IClassFormData } from "@/common/types";
import { extractErrorMessage } from "@/utils/helpers";

import { PageHeader } from "@/components/general/page-header";
import ClassForm, {
  ClassScheduleFormValues,
} from "@/components/portal/dashboards/class/form";

export default function EditClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [loading, setLoading] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentEnrollment, setCurrentEnrollment] = useState<number>(0);
  const [formData, setFormData] =
    useState<IClassFormData>(ClassFormInitialData);

  // Start/end date and time are managed by their own react-hook-form
  // instance (FormDate/FormTime require a react-hook-form context), scoped
  // just to the schedule fields - the rest of the form stays on the
  // existing useState-driven formData above. Populated once the class data
  // loads (see fetchData below), since it arrives asynchronously after
  // mount.
  const scheduleForm = useForm<ClassScheduleFormValues>({
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      startTime: "",
      endTime: "",
    },
    mode: "onChange",
  });

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
        setCurrentEnrollment(classData?.students?.length ?? 0);

        // Populate form with existing class data
        setFormData({
          name: classData?.name || "",
          gradeLevel: classData?.gradeLevel || "",
          stream: classData?.stream || "",
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
        scheduleForm.reset({
          startDate: classData?.startDate
            ? new Date(classData.startDate)
            : undefined,
          endDate: classData?.endDate ? new Date(classData.endDate) : undefined,
          startTime: classData?.startTime || "",
          endTime: classData?.endTime || "",
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
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        gradeLevel: formData.gradeLevel,
        stream: formData.stream || null,
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
        scheduleForm={scheduleForm}
        handleArrayChange={handleArrayChange}
        teachers={teachers}
        formData={formData}
        mode="edit"
        cancelHref={`/portal/classes/${classId}`}
        currentEnrollment={currentEnrollment}
      />
    </div>
  );
}
