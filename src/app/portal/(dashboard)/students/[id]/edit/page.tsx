"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicHeader } from "@/components/general/page-header";
import StudentForm from "@/components/portal/dashboards/student/form";
import { GraduationCap, Users, House, ShieldPlus, User } from "lucide-react";
import { studentsAPI } from "@/jotai/students/student";
import { classesAPI } from "@/jotai/class/class";

import { toast } from "sonner";
import { Class } from "@/jotai/class/class-type";
import { ParentStudentResponse } from "@/jotai/parent/parent-types";
import { StudentFormIntialData } from "@/common/form";
import { IStudentFormData } from "@/common/types";
import { extractErrorMessage } from "@/utils/helpers";

const tabs = [
  { id: "personal", label: "Personal Info", Icon: User },
  { id: "address", label: "Address", Icon: House },
  { id: "academic", label: "Academic", Icon: GraduationCap },
  { id: "parent", label: "Parent/Guardian", Icon: Users },
  { id: "medical", label: "Medical", Icon: ShieldPlus },
  { id: "finish" },
];

export default function Page() {
  const params = useParams<{ id: string }>();
  const studentId = parseInt(params.id);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState<ParentStudentResponse[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [formData, setFormData] = useState<IStudentFormData>(
    StudentFormIntialData
  );
  const [date, setDate] = useState<{
    dob: Date | undefined;
    admissionDate: Date | undefined;
  }>({
    dob: undefined,
    admissionDate: undefined,
  });

  console.log("FORM DATA ", formData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [student, parent] = await Promise.all([
          studentsAPI.getById(studentId),
          studentsAPI.getParents(studentId),
        ]);
        const classData = await classesAPI.getById(parseInt(student.classId));

        setParents(parent);
        setClasses([classData]);

        setFormData({
          ...student.user,
          ...student.user.medicalInfo,
          classId: student.classId,
        });

        setDate({
          dob: new Date(student.user.DOB),
          admissionDate: new Date(student.admissionDate),
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      }
    };

    fetchData();
  }, [studentId]);

  const handleDateChange =
    (dateType: "dob" | "admissionDate") => (selectedDate: Date | undefined) => {
      const dateString = selectedDate?.toISOString().split("T")[0] || "";
      const formFieldName =
        dateType === "dob" ? "dateOfBirth" : "admissionDate";

      setDate((prev) => ({ ...prev, [dateType]: selectedDate }));
      setFormData((prev) => ({ ...prev, [formFieldName]: dateString }));
    };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await await studentsAPI.update(studentId, formData);
      toast.success("Updated Successfully");
      router.back();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.log("Failed to update students ", error);
      toast.error(`Update failed. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DynamicHeader
        name={formData?.firstname ?? "Unknown Student"}
        title={`${formData?.firstname ?? "Unknown"} ${
          formData?.lastname ?? "Student"
        }`}
        subtitle="Student Profile"
      />

      <StudentForm
        type="update"
        onSubmit={handleSubmit}
        tabs={tabs}
        classes={classes}
        parents={parents}
        loading={loading}
        date={date}
        isParent={parents.length > 0}
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
