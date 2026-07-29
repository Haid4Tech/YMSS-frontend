"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import {
  GraduationCap,
  House,
  BookOpenCheck,
  User,
  BriefcaseBusiness,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/general/page-header";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { subjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";

import { TeacherFormInitialData } from "@/common/form";
import { ITeacherFormData } from "@/common/types";
import TeacherForm, {
  ITeacherDateFormValues,
} from "@/components/portal/dashboards/teacher/form";
import { extractErrorMessage } from "@/utils/helpers";

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  // DOB/hireDate are managed by their own react-hook-form instance
  // (FormDate requires a react-hook-form context), scoped just to those two
  // fields - the rest of the form stays on the existing useState-driven
  // formData below.
  const dateForm = useForm<ITeacherDateFormValues>({
    defaultValues: { DOB: undefined, hireDate: undefined },
    mode: "onChange",
  });
  const [formData, setFormData] = useState<ITeacherFormData>(
    TeacherFormInitialData
  );

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

  const handleSubjectsChange = (subjectIds: number[]) => {
    setFormData((prev) => ({ ...prev, subjectIds }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateValid = await dateForm.trigger();
    if (!dateValid) {
      toast.error("Please fix the date errors before submitting the form.");
      return;
    }
    const { DOB, hireDate } = dateForm.getValues();
    const dobString = DOB ? DOB.toISOString().split("T")[0] : "";
    const hireDateString = hireDate ? hireDate.toISOString().split("T")[0] : "";

    setLoading(true);

    try {
      const password = `${formData?.firstname?.trim().toLowerCase()}${formData?.lastname}`;
      console.log("PW ", password) 
      const teacherData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: password,
        role: "TEACHER",
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        zipcode: formData.zipcode,
        state: formData.state,
        experience: formData.experience,
        subjectIds: formData.subjectIds ?? [],
        hireDate: hireDateString,
        DOB: dobString,
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
      toast.success("Teacher created successfully");
      router.push("/portal/teachers");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to create teacher. ${errorMessage}`);
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
        dateForm={dateForm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        onSubjectsChange={handleSubjectsChange}
        formData={formData}
      />
    </div>
  );
}
