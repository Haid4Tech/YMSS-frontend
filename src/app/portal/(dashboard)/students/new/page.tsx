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
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import DatePicker from "@/components/general/date-picker";
import {
  GraduationCap,
  Users,
  House,
  ShieldPlus,
  BookPlus,
  User,
} from "lucide-react";

import { studentsAPI } from "@/jotai/students/student";

import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";

import { parentsAPI } from "@/jotai/parent/parent";
import { Parent } from "@/jotai/parent/parent-types";

export default function AddStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [activeTab, setActiveTab] = useState("personal");

  const [classesData] = useAtom(classesAPI.getAll);
  const [parentsData] = useAtom(parentsAPI.getAll);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    religion: "",
    bloodGroup: "",
    phone: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",

    // Academic Information
    classId: "",
    studentId: "",
    admissionDate: "",
    previousSchool: "",
    grade: "",

    // Parent/Guardian Information
    parentId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Medical Information
    medicalConditions: "",
    allergies: "",
    medications: "",
    doctorName: "",
    doctorPhone: "",

    // Additional Information
    notes: "",
    hobbies: "",
    transportationMethod: "",
    photo: null as File | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setClasses(Array.isArray(classesData) ? classesData : []);
        setParents(Array.isArray(parentsData) ? parentsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [classesData, parentsData]);

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
      const studentData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: `${formData.firstName.toLowerCase()}${formData.dateOfBirth.replace(
          /-/g,
          ""
        )}`, // Temporary password
        role: "STUDENT",
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        classId: parseInt(formData.classId),
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        studentId: formData.studentId,
        admissionDate: formData.admissionDate,
        gender: formData.gender,
        nationality: formData.nationality,
        religion: formData.religion,
        bloodGroup: formData.bloodGroup,
        previousSchool: formData.previousSchool,
        medicalInfo: {
          conditions: formData.medicalConditions,
          allergies: formData.allergies,
          medications: formData.medications,
          doctorName: formData.doctorName,
          doctorPhone: formData.doctorPhone,
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        notes: formData.notes,
        hobbies: formData.hobbies,
        transportationMethod: formData.transportationMethod,
      };

      await studentsAPI.create(studentData);
      router.push("/portal/students");
    } catch (error) {
      console.error("Failed to create student:", error);
      alert("Failed to create student. Please try again.");
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
    { id: "additional", label: "Additional", Icon: BookPlus },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/students">← Back to Students</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Student</h1>
            <p className="text-muted-foreground">
              Complete student registration form
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  type="button"
                  variant={"outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary hover:bg-primary/50 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <tab.Icon size={15} />
                  {tab.label}
                </Button>
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
                      date={
                        formData.dateOfBirth
                          ? new Date(formData.dateOfBirth)
                          : undefined
                      }
                      setDate={(date: Date | undefined) =>
                        setFormData((prev) => ({
                          ...prev,
                          dateOfBirth: date ? date.toISOString() : "",
                        }))
                      }
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
                          {cls.name} (Grade?)
                        </SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div>
                    <InputField
                      label={"Student ID"}
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                      placeholder="e.g., STU2024001"
                      required
                    />
                  </div>
                  <div>
                    <DatePicker
                      label={"Admission Date"}
                      required
                      date={
                        formData.admissionDate
                          ? new Date(formData.admissionDate)
                          : undefined
                      }
                      setDate={(date: Date | undefined) =>
                        setFormData((prev) => ({
                          ...prev,
                          admissionDate: date ? date.toISOString() : "",
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade"></Label>
                    <SelectField
                      label="Current Grade"
                      value={formData.grade}
                      placeholder="Select grade"
                      onValueChange={(value) =>
                        handleInputChange("grade", value)
                      }
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Grade {i + 1}
                        </SelectItem>
                      ))}
                    </SelectField>
                  </div>
                  <div className="md:col-span-2">
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
              </div>
            )}

            {/* Parent/Guardian Information Tab */}
            {activeTab === "parent" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SelectField
                      label="Select Parent/Guardian"
                      placeholder="Select parent"
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
                  <div>
                    <InputField
                      label={"Emergency Contact Name"}
                      id="emergencyContactName"
                      placeholder="Enter Emergency contact name"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label="Emergency Contact Phone"
                      id="emergencyContactPhone"
                      placeholder="e.g 08055223344"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <SelectField
                      label={"Relationship"}
                      placeholder="Select relationship"
                      value={formData.emergencyContactRelation}
                      onValueChange={(value) =>
                        handleInputChange("emergencyContactRelation", value)
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

            {/* Additional Information Tab */}
            {activeTab === "additional" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <SelectField
                      label="Transportation Method"
                      placeholder="Select transportation"
                      value={formData.transportationMethod}
                      onValueChange={(value) =>
                        handleInputChange("transportationMethod", value)
                      }
                    >
                      <SelectItem value="school_bus">School Bus</SelectItem>
                      <SelectItem value="private_car">Private Car</SelectItem>
                      <SelectItem value="public_transport">
                        Public Transport
                      </SelectItem>
                      <SelectItem value="walking">Walking</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectField>
                  </div>
                  <div>
                    <InputField
                      label={"Hobbies & Interests"}
                      id="hobbies"
                      value={formData.hobbies}
                      onChange={(e) =>
                        handleInputChange("hobbies", e.target.value)
                      }
                      placeholder="e.g., Reading, Sports, Music"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextareaField
                      label={"Additional Notes"}
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Any additional information about the student"
                    />
                  </div>
                </div>
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
            <Button
              type="button"
              variant="outline"
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
            {activeTab !== "additional" ? (
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
            ) : (
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
