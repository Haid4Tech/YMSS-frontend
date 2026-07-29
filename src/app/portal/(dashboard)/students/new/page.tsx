"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import { PageHeader } from "@/components/general/page-header";
import { StudentFormIntialData } from "@/common/form";
import StudentForm, {
  IStudentDateFormValues,
} from "@/components/portal/dashboards/student/form";
import { GraduationCap, Users, House, ShieldPlus, User } from "lucide-react";

import { parentsAPI } from "@/jotai/parent/parent";
import { classesAPI } from "@/jotai/class/class";
import { studentsAPI } from "@/jotai/students/student";

import { Class } from "@/jotai/class/class-type";
// import { Parent } from "@/jotai/parent/parent-types";

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  // const [parents, setParents] = useState<Parent[]>([]);
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [, getAllParents] = useAtom(parentsAPI.getAll);

  const [formData, setFormData] = useState(StudentFormIntialData);

  // DOB/admission date are managed by their own react-hook-form instance
  // (FormDate requires a react-hook-form context), scoped just to those two
  // fields - the rest of the form stays on the existing useState-driven
  // formData above.
  const dateForm = useForm<IStudentDateFormValues>({
    defaultValues: { dob: undefined, admissionDate: undefined },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classes = await getAllClasses();
        // const parents = await getAllParents();

        setClasses(Array.isArray(classes) ? classes : []);
        // setParents(Array.isArray(parents) ? parents : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [getAllClasses, getAllParents]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateStudent();
  };

  const validateForm = (dobString: string, admissionDateString: string) => {
    const requiredFields = [
      formData.firstname,
      formData.lastname,
      formData.email,
      dobString,
      formData.gender,
      formData.street,
      formData.city,
      formData.state,
      formData.zipcode,
      formData.country,
      admissionDateString,
      formData.parentemail,
      formData.parentphone,
      formData.relationship,
    ];
    return requiredFields.every((field) => field && field.trim() !== "");
  };

  const handleCreateStudent = async () => {
    const dateValid = await dateForm.trigger();
    if (!dateValid) {
      toast.error("Please fix the date errors before submitting the form.");
      return;
    }
    const { dob, admissionDate } = dateForm.getValues();
    const dobString = dob ? dob.toISOString().split("T")[0] : "";
    const admissionDateString = admissionDate
      ? admissionDate.toISOString().split("T")[0]
      : "";

    setLoading(true);

    try {
      if (!validateForm(dobString, admissionDateString)) {
        toast.error("Please fill out all required fields before submitting.");
        setLoading(false);
        return;
      }

      const studentData = {
        // User data
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: `${formData.firstname
          .trim()
          .toLowerCase()}${dobString.replace(/-/g, "")}`, // Temporary password dateformat - yyyymmmmdd
        DOB: dobString,
        gender: formData.gender,
        street: formData.street,
        city: formData.city,
        zipcode: formData.zipcode,
        state: formData.state,
        phone: formData.phone,
        nationality: formData.nationality,
        country: formData.country,
        religion: formData.religion,
        bloodGroup: formData.bloodGroup,
        photo:
          "https://www.shutterstock.com/image-photo/young-womans-portrait-made-different-600nw-1658677039.jpg",

        // Student specific data
        classId: parseInt(formData.classId) || null,
        parentId:
          formData.parentId && formData.parentId !== "N/A"
            ? parseInt(formData.parentId)
            : null,
        admissionDate: admissionDateString,
        previousSchool: formData.previousSchool || null,

        // Medical information
        medicalInfo: {
          conditions: formData.conditions || null,
          allergies: formData.allergies || null,
          medications: formData.medications || null,
          doctorName: formData.doctorName || null,
          doctorPhone: formData.doctorPhone || null,
        },

        // Emergency contact
        parentsInfo: {
          parentfirstname: formData.parentfirstname,
          parentlastname: formData.parentlastname,
          parentPhone: formData.parentphone,
          parentEmail: formData.parentemail,
          relationship: formData.relationship,
        },
      };

      await studentsAPI.create(studentData);
      toast.success("Successfully created student record");
      router.push("/portal/students");
    } catch (error) {
      console.error("Failed to create student:", error);
      toast.error("Failed to create student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", Icon: User },
    { id: "address", label: "Address", Icon: House },
    { id: "academic", label: "Academic", Icon: GraduationCap },
    { id: "parent", label: "Parent/Guardian", Icon: Users },
    { id: "medical", label: "Medical", Icon: ShieldPlus },
    { id: "finish" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Add New Student"}
        subtitle={"Complete student registration form"}
        btnTitle="Back to Students"
      />

      <StudentForm
        type={"create"}
        onSubmit={handleSubmit}
        tabs={tabs}
        classes={classes}
        loading={loading}
        dateForm={dateForm}
        isParent={false}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        formData={formData}
      />
    </div>
  );
}
