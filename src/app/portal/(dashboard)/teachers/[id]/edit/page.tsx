"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { DynamicHeader } from "@/components/general/page-header";
import TeacherForm, {
  ITeacherDateFormValues,
} from "@/components/portal/dashboards/teacher/form";
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

  // DOB/hireDate are managed by their own react-hook-form instance
  // (FormDate requires a react-hook-form context), scoped just to those two
  // fields - the rest of the form stays on the existing useState-driven
  // formData above. Populated once the teacher data loads (see fetchData
  // below), since it arrives asynchronously after mount.
  const dateForm = useForm<ITeacherDateFormValues>({
    defaultValues: { DOB: undefined, hireDate: undefined },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [teacher, subjects] = await Promise.all([
        teachersAPI.getById(teacherId),
        getAllSubjects(),
      ]);

      // Always show every subject so the teacher can be assigned to more
      // than one, not just the one(s) they're already teaching.
      setSubjects(Array.isArray(subjects) ? subjects : []);

      dateForm.reset({
        DOB: teacher.user.DOB ? new Date(teacher.user.DOB) : undefined,
        hireDate: teacher?.hireDate ? new Date(teacher.hireDate) : undefined,
      });

      setFormData({
        ...teacher.user,
        ...teacher,
        phone: teacher?.user?.phone ?? "",
        nationality: teacher?.user?.nationality ?? "",

        experience: teacher?.experience ?? "",
        hireDate: teacher?.hireDate ?? "",
        salary: teacher?.salary ?? 0,
        previousInstitution: teacher?.previousInstitution ?? "",

        employmentType: teacher?.employmentType ?? "",
        degree: teacher.degree,
        university: teacher?.university ?? "",
        graduationYear: teacher?.graduationYear || 0,
        // teacher.subjects comes back as SubjectTeacher join rows
        // ({ id, subjectId, teacherId }), not Subject records - the
        // subject's own id lives in subjectId, not id.
        subjectIds:
          teacher?.subjects?.map(
            (subject) => (subject as unknown as { subjectId: number }).subjectId
          ) ?? [],
      });
    };

    fetchData();
  }, [getAllSubjects, teacherId]);

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

    setLoading(true);

    try {
      const updateData = {
        ...formData,
        DOB: DOB ? DOB.toISOString().split("T")[0] : "",
        hireDate: hireDate ? hireDate.toISOString().split("T")[0] : "",
      };
      await teachersAPI.update(teacherId, updateData);
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
