"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { DynamicHeader } from "@/components/general/page-header";
import StudentForm, {
  IStudentDateFormValues,
} from "@/components/portal/dashboards/student/form";
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
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parents, setParents] = useState<ParentStudentResponse[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [formData, setFormData] = useState<IStudentFormData>(
    StudentFormIntialData
  );

  // DOB/admission date are managed by their own react-hook-form instance
  // (FormDate requires a react-hook-form context), scoped just to those two
  // fields - the rest of the form stays on the existing useState-driven
  // formData above. Populated once the student data loads (see fetchData
  // below), since it arrives asynchronously after mount.
  const dateForm = useForm<IStudentDateFormValues>({
    defaultValues: { dob: undefined, admissionDate: undefined },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setError(null);

        const [student, parent] = await Promise.all([
          studentsAPI.getById(studentId),
          studentsAPI.getParents(studentId),
        ]);

        setParents(parent);

        // Handle class data - only fetch if student has a class
        if (student.classId) {
          try {
            const classData = await classesAPI.getById(parseInt(student.classId.toString()));
            setClasses([classData]);
          } catch (classError) {
            console.error("Failed to fetch class data:", classError);
            setClasses([]);
          }
        } else {
          setClasses([]);
        }

        setFormData({
          ...student.user,
          ...(student.user.medicalInfo || {}),
          classId: student.classId?.toString() || "",
        });

        dateForm.reset({
          dob: student.user.DOB ? new Date(student.user.DOB) : undefined,
          admissionDate: student.admissionDate
            ? new Date(student.admissionDate)
            : undefined,
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        setError("Failed to load student data. Please try again.");
        toast.error("Failed to load student data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateValid = await dateForm.trigger();
    if (!dateValid) {
      toast.error("Please fix the date errors before submitting the form.");
      return;
    }
    const { dob, admissionDate } = dateForm.getValues();

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        DOB: dob ? dob.toISOString().split("T")[0] : "",
        admissionDate: admissionDate
          ? admissionDate.toISOString().split("T")[0]
          : "",
      };
      await studentsAPI.update(studentId, updateData);
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

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

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
        dateForm={dateForm}
        isParent={parents.length > 0}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        formData={formData}
      />
    </div>
  );
}
