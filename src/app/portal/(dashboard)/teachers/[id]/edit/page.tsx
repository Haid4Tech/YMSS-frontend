"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DynamicHeader } from "@/components/general/page-header";
import TeacherForm from "@/components/portal/dashboards/teacher/form";
import { ITeacherFormData } from "@/common/types";
import { TeacherFormInitialData } from "@/common/form";
import {
  GraduationCap,
  House,
  BookOpenCheck,
  User,
  BriefcaseBusiness,
} from "lucide-react";

import { Subject } from "@/jotai/subject/subject-types";
import { toast } from "sonner";
import { subjectsAPI } from "@/jotai/subject/subject";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { extractErrorMessage } from "@/utils/helpers";

const tabs = [
  { id: "personal", label: "Personal Info", Icon: User },
  { id: "address", label: "Address", Icon: House },
  { id: "professional", label: "Professional", Icon: BriefcaseBusiness },
  { id: "education", label: "Education", Icon: GraduationCap },
  { id: "teaching", label: "Teaching", Icon: BookOpenCheck },
  { id: "finish" },
];

export default function Page() {
  const params = useParams<{ id: string }>();
  const teacherId = parseInt(params.id);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("personal");

  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);
  const [formData, setFormData] = useState<ITeacherFormData>(
    TeacherFormInitialData
  );
  const [date, setDate] = useState<{
    DOB: Date | undefined;
    hireDate: Date | undefined;
  }>({
    DOB: undefined,
    hireDate: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [teacher, subjects] = await Promise.all([
        teachersAPI.getById(teacherId),
        getAllSubjects(),
      ]);

      // Check if subjects exists and set
      if (teacher.subjects.length > 0) {
        setSubjects(teacher.subjects);
      } else {
        setSubjects(subjects);
      }

      setDate({
        DOB: new Date(teacher.user.DOB),
        hireDate: new Date(teacher?.hireDate ?? ""),
      });

      setFormData({
        ...teacher.user,
        ...teacher,
        phone: teacher?.user?.phone ?? "",
        nationality: teacher?.user?.nationality ?? "",

        experience: teacher?.experience ?? "",
        hireDate: teacher?.hireDate ?? "",
        salary: teacher?.salary ?? 0,
        emergencyContactName: teacher?.emergencyContactName ?? "",
        emergencyContactPhone: teacher?.emergencyContactPhone ?? "",
        previousInstitution: teacher?.previousInstitution ?? "",

        employmentType: teacher?.employmentType ?? "",

        // subjectId: formData.subjectSpecialization
        //   ? parseInt(formData.subjectSpecialization)
        //   : null,

        degree: teacher.degree,
        university: teacher?.university ?? "",
        graduationYear: teacher?.graduationYear || 0,
      });
    };

    fetchData();
  }, [getAllSubjects, teacherId]);

  // Handle date changes for both DOB and Join Date
  const handleDateChange =
    (dateType: "DOB" | "hireDate") => (selectedDate: Date | undefined) => {
      // Update the date state
      setDate((prev) => ({
        ...prev,
        [dateType]: selectedDate,
      }));

      // Update form data with string format
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "";

      setFormData((prev) => ({
        ...prev,
        [dateType]: dateString,
      }));
    };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await teachersAPI.update(teacherId, formData);
      toast.success("Updated teachers successfully");
      router.back();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to update teacher. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"space-y-6"}>
      <DynamicHeader
        name={formData?.firstname ?? "Unknown Teacher"}
        title={`${formData?.firstname ?? "Unknown"} ${
          formData?.lastname ?? "Teacher"
        }`}
        subtitle="Teacher Profile"
      />

      <TeacherForm
        type={"update"}
        onSubmit={handleSubmit}
        tabs={tabs}
        subjects={subjects}
        loading={loading}
        date={date}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleFileChange={handleFileChange}
        formData={formData}
      />
    </div>
  );
}
