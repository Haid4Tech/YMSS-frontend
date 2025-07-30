"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputField,
  TextareaField,
  SelectField,
} from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import DatePicker from "@/components/general/date-picker";
import { GraduationCap, Users, House, ShieldPlus, User } from "lucide-react";
import { PageHeader } from "@/components/general/page-header";
import { StudentFormIntialData } from "@/common/form";
import ToggleItem from "@/components/general/toggle";
import { toast } from "sonner";

import { studentsAPI } from "@/jotai/students/student";
import { classesAPI } from "@/jotai/class/class";
import { parentsAPI } from "@/jotai/parent/parent";

import { Class } from "@/jotai/class/class-type";
import { Parent } from "@/jotai/parent/parent-types";

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [parentExist, setParentExist] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("personal");

  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [, getAllParents] = useAtom(parentsAPI.getAll);

  const [formData, setFormData] = useState(StudentFormIntialData);
  const [date, setDate] = useState<{
    dob: Date | undefined;
    admissionDate: Date | undefined;
  }>({
    dob: undefined,
    admissionDate: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classes = await getAllClasses();
        const parents = await getAllParents();

        setClasses(Array.isArray(classes) ? classes : []);
        setParents(Array.isArray(parents) ? parents : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [getAllClasses, getAllParents]);

  // Handle date changes for both DOB and Join Date
  const handleDateChange =
    (dateType: "dob" | "admissionDate") => (selectedDate: Date | undefined) => {
      // Update the date state
      setDate((prev) => ({
        ...prev,
        [dateType]: selectedDate,
      }));

      // Update form data with string format
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "";
      const formFieldName =
        dateType === "dob" ? "dateOfBirth" : "admissionDate";

      setFormData((prev) => ({
        ...prev,
        [formFieldName]: dateString,
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
    await handleCreateStudent();
  };

  const validateForm = () => {
    const requiredFields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.dateOfBirth,
      formData.gender,
      formData.address,
      formData.city,
      formData.state,
      formData.country,
      formData.admissionDate,
      formData.parentname,
      formData.parentemail,
      formData.parentphone,
      formData.relationship,
    ];
    return requiredFields.every((field) => field && field.trim() !== "");
  };

  const handleCreateStudent = async () => {
    setLoading(true);

    try {
      if (!validateForm()) {
        toast.error("Please fill out all required fields before submitting.");
        setLoading(false);
        return;
      }

      const studentData = {
        // User data
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: `${formData.firstName.toLowerCase()}${formData.dateOfBirth.replace(
          /-/g,
          ""
        )}`, // Temporary password
        DOB: formData.dateOfBirth,
        gender: formData.gender,
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        phone: formData.phone,
        nationality: formData.nationality,
        country: formData.country,
        religion: formData.religion,
        bloodGroup: formData.bloodGroup,
        photo: formData.photo,

        // Student specific data
        classId: parseInt(formData.classId) || null,
        parentId:
          formData.parentId && formData.parentId !== "N/A"
            ? parseInt(formData.parentId)
            : null,
        admissionDate: formData.admissionDate,
        previousSchool: formData.previousSchool || null,

        // Medical information
        medicalInfo: {
          conditions: formData.medicalConditions || null,
          allergies: formData.allergies || null,
          medications: formData.medications || null,
          doctorName: formData.doctorName || null,
          doctorPhone: formData.doctorPhone || null,
        },

        // Emergency contact
        parentsInfo: {
          parentName: formData.parentname,
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs
                .filter((tab) => tab.id !== "finish")
                .map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {tab.Icon && <tab.Icon size={15} />}
                    {tab.label}
                  </button>
                ))}
            </div>

            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label="First Name"
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label="Last Name"
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label={"Email Address"}
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <DatePicker
                      label={"Date of Birth"}
                      required
                      date={date.dob}
                      setDate={handleDateChange("dob")}
                    />
                  </div>
                  <div>
                    <SelectField
                      required
                      label={"Gender"}
                      placeholder="Select gender"
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      {["male", "female", "other"].map((item, index) => (
                        <SelectItem
                          className="capitalize"
                          key={index}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <InputField
                      label={"Phone Number"}
                      id="phone"
                      placeholder="e.g, 08099999999"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      label={"Nationality"}
                      id="nationality"
                      placeholder="Enter nationality"
                      value={formData.nationality}
                      onChange={(e) =>
                        handleInputChange("nationality", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      label={"Religion"}
                      id="religion"
                      placeholder="Enter religion"
                      value={formData.religion}
                      onChange={(e) =>
                        handleInputChange("religion", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <SelectField
                      label={"Blood Group"}
                      placeholder="Select blood group"
                      value={formData.bloodGroup}
                      onValueChange={(value) =>
                        handleInputChange("bloodGroup", value)
                      }
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (item, index) => (
                          <SelectItem
                            className="capitalize"
                            key={index}
                            value={item}
                          >
                            {item}
                          </SelectItem>
                        )
                      )}
                    </SelectField>
                  </div>
                  <div>
                    <InputField
                      label={"Student Photo"}
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address Information Tab */}
            {activeTab === "address" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <TextareaField
                      label={"Street Address"}
                      id="address"
                      placeholder="Enter street sddress"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label={"City"}
                      id="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label="State/Province"
                      id="state"
                      placeholder="Enter state or province"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label="ZIP/Postal Code"
                      id="zipCode"
                      placeholder="Enter region ZIP code"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      label={"Country"}
                      id="country"
                      placeholder={"Enter country"}
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Information Tab */}
            {activeTab === "academic" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SelectField
                      label={"Assign to Class"}
                      placeholder="Select class to assign"
                      value={formData.classId}
                      onValueChange={(value) =>
                        handleInputChange("classId", value)
                      }
                    >
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectField>
                  </div>

                  <DatePicker
                    label={"Admission Date"}
                    required
                    date={date.admissionDate}
                    setDate={handleDateChange("admissionDate")}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <SelectField
                    label="Current Grade"
                    value={formData.grade}
                    placeholder="Select grade"
                    onValueChange={(value) => handleInputChange("grade", value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                  </SelectField> */}

                  <InputField
                    label={"Previous School"}
                    id="previousSchool"
                    placeholder={"If none, write N/A"}
                    value={formData.previousSchool}
                    onChange={(e) =>
                      handleInputChange("previousSchool", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Parent/Guardian Information Tab */}
            {activeTab === "parent" && (
              <div className="space-y-4">
                <div className="space-y-2 pb-3">
                  <h3 className="text-lg font-semibold mb-4">
                    Parent/Guardian Information
                  </h3>

                  <ToggleItem
                    label="Does Parent/Guardian Exist?"
                    id="isparent"
                    value={parentExist}
                    setValue={setParentExist}
                  />
                </div>

                <div>
                  {parentExist ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField
                        label="Select Parent/Guardian"
                        placeholder="Select parent"
                        required
                        value={formData.parentId}
                        onValueChange={(value) =>
                          handleInputChange("parentId", value)
                        }
                      >
                        <SelectItem value="N/A">No parent assigned</SelectItem>
                        {parents.map((parent) => (
                          <SelectItem
                            key={parent.id}
                            value={parent.id.toString()}
                          >
                            {parent.user.name} - {parent.user.email}
                          </SelectItem>
                        ))}
                      </SelectField>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label={"Parent/Guardian Name"}
                        id="parentname"
                        placeholder="Enter Parent/Guardian name"
                        value={formData.parentname}
                        onChange={(e) =>
                          handleInputChange("parentname", e.target.value)
                        }
                        required
                      />
                      <InputField
                        label={"Parent/Guardian Email"}
                        id="parentemail"
                        placeholder="Enter Parent/Guardian Email"
                        value={formData.parentemail}
                        onChange={(e) =>
                          handleInputChange("parentemail", e.target.value)
                        }
                        required
                      />

                      <InputField
                        label="Parent/Guardian Phone"
                        id="parentphone"
                        placeholder="e.g 08055223344"
                        value={formData.parentphone}
                        onChange={(e) =>
                          handleInputChange("parentphone", e.target.value)
                        }
                        required
                      />

                      <SelectField
                        label={"Relationship"}
                        placeholder="Select relationship"
                        required
                        value={formData.relationship}
                        onValueChange={(value) =>
                          handleInputChange("relationship", value)
                        }
                      >
                        {[
                          "father",
                          "mother",
                          "brother",
                          "sister",
                          "guardian",
                          "grandparent",
                          "uncle",
                          "aunt",
                          "other",
                        ].map((item, index) => (
                          <SelectItem
                            className="capitalize"
                            key={index}
                            value={item}
                          >
                            {item}
                          </SelectItem>
                        ))}
                      </SelectField>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medical Information Tab */}
            {activeTab === "medical" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <TextareaField
                      label={"Medical Conditions"}
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        handleInputChange("medicalConditions", e.target.value)
                      }
                      placeholder="List any medical conditions or health issues"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextareaField
                      label={"Allergies"}
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) =>
                        handleInputChange("allergies", e.target.value)
                      }
                      placeholder="List any known allergies"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextareaField
                      label={"Current Medications"}
                      id="medications"
                      value={formData.medications}
                      onChange={(e) =>
                        handleInputChange("medications", e.target.value)
                      }
                      placeholder="List current medications and dosages"
                    />
                  </div>
                  <div>
                    <InputField
                      label="Family Doctor Name"
                      placeholder="Enter Doctors phone name"
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) =>
                        handleInputChange("doctorName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      label="Doctor's Phone"
                      id="doctorPhone"
                      placeholder="Enter Doctors phone number"
                      value={formData.doctorPhone}
                      onChange={(e) =>
                        handleInputChange("doctorPhone", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "finish" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
                <p>Please review the information before submitting the form.</p>
                {/* You can render a summary here */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/students">Cancel</Link>
          </Button>
          <div className="flex gap-2">
            {/* Navigation buttons */}
            <Button
              type="button"
              variant="outline"
              disabled={tabs.findIndex((tab) => tab.id === activeTab) === 0}
              onClick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.id === activeTab
                );
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].id);
                }
              }}
            >
              Previous
            </Button>
            {activeTab !== "finish" && (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (tab) => tab.id === activeTab
                  );
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
              >
                Next
              </Button>
            )}

            {/* Form submission trigger */}
            {activeTab === "finish" && (
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Student..." : "Create Student"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
