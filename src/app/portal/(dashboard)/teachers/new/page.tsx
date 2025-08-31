"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  GraduationCap,
  House,
  BookOpenCheck,
  User,
  BriefcaseBusiness,
} from "lucide-react";
import { PageHeader } from "@/components/general/page-header";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { subjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";

import { TeacherFormInitialData } from "@/common/form";
import { ITeacherFormData } from "@/common/types";
import TeacherForm from "@/components/portal/dashboards/teacher/form";

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  const [date, setDate] = useState<{
    DOB: Date | undefined;
    hireDate: Date | undefined;
  }>({
    DOB: undefined,
    hireDate: undefined,
  });
  const [formData, setFormData] = useState<ITeacherFormData>(
    TeacherFormInitialData
  );

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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await getAllSubjects();
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [getAllSubjects]);

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
      const teacherData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: `${formData?.firstname?.toLowerCase()}${formData?.DOB?.replace(
          /-/g,
          ""
        )}`,
        role: "TEACHER",
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        zipcode: formData.zipcode,
        state: formData.state,
        experience: formData.experience,
        subjectId: formData.subjectSpecialization
          ? parseInt(formData.subjectSpecialization)
          : null,
        hireDate: formData.hireDate,
        DOB: formData.DOB,
        gender: formData.gender,
        nationality: formData.nationality,

        previousInstitution: formData.previousInstitution,
        salary: formData.salary,
        employmentType: formData.employmentType,

        degree: formData.degree,
        university: formData.university,
        graduationYear: formData?.graduationYear ?? 0,
      };

      await teachersAPI.create(teacherData);
      router.push("/portal/teachers");
    } catch (error) {
      console.error("Failed to create teacher:", error);
      alert("Failed to create teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", Icon: User },
    { id: "address", label: "Address", Icon: House },
    { id: "professional", label: "Professional", Icon: BriefcaseBusiness },
    { id: "education", label: "Education", Icon: GraduationCap },
    { id: "teaching", label: "Teaching", Icon: BookOpenCheck },
    { id: "finish" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Add New Teacher"}
        subtitle={"Complete teacher registration form"}
        btnTitle="Back to Teachers"
      />

      <TeacherForm
        type={"create"}
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
      />
    </div>
  );
}
