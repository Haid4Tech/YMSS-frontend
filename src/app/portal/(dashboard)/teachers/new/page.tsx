"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem } from "@/components/ui/select";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import PageHeader from "@/components/general/page-header";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { subjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";
import DatePicker from "@/components/general/date-picker";

interface TeacherFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Professional Information
  employeeId: string;
  joinDate: string;
  subjectSpecialization: string;
  qualification: string;
  experience: string;
  previousInstitution: string;
  salary: string;
  employmentType: string;

  // Educational Background
  degree: string;
  university: string;
  graduationYear: string;
  additionalCertifications: string;

  // Teaching Information
  classesAssigned: string[];
  maxClassesPerWeek: string;
  preferredGrades: string;

  // Additional Information
  skills: string;
  achievements: string;
  notes: string;
  photo: File | null;
}

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);
  const [date, setDate] = useState<{
    dob: Date | undefined;
    joinDate: Date | undefined;
  }>({
    dob: undefined,
    joinDate: undefined,
  });

  const [formData, setFormData] = useState<TeacherFormData>({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",

    // Professional Information
    employeeId: "",
    joinDate: "",
    subjectSpecialization: "",
    qualification: "",
    experience: "",
    previousInstitution: "",
    salary: "",
    employmentType: "",

    // Educational Background
    degree: "",
    university: "",
    graduationYear: "",
    additionalCertifications: "",

    // Teaching Information
    classesAssigned: [],
    maxClassesPerWeek: "",
    preferredGrades: "",

    // Additional Information
    skills: "",
    achievements: "",
    notes: "",
    photo: null,
  });

  // Handle date changes for both DOB and Join Date
  const handleDateChange =
    (dateType: "dob" | "joinDate") => (selectedDate: Date | undefined) => {
      // Update the date state
      setDate((prev) => ({
        ...prev,
        [dateType]: selectedDate,
      }));

      // Update form data with string format
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "";
      const formFieldName = dateType === "dob" ? "dateOfBirth" : "joinDate";

      setFormData((prev) => ({
        ...prev,
        [formFieldName]: dateString,
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

  const handleInputChange = (field: keyof TeacherFormData, value: string) => {
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
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: `${formData.firstName.toLowerCase()}${formData.dateOfBirth.replace(
          /-/g,
          ""
        )}`,
        role: "TEACHER",
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        qualification: formData.qualification,
        experience: parseInt(formData.experience) || 0,
        subjectId: formData.subjectSpecialization
          ? parseInt(formData.subjectSpecialization)
          : null,
        employeeId: formData.employeeId,
        hireDate: formData.joinDate,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
        },
        salary: parseFloat(formData.salary) || 0,
        employmentType: formData.employmentType,
        education: {
          degree: formData.degree,
          university: formData.university,
          graduationYear: parseInt(formData.graduationYear) || null,
          certifications: formData.additionalCertifications,
        },
        skills: formData.skills,
        achievements: formData.achievements,
        notes: formData.notes,
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
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "address", label: "Address", icon: "🏠" },
    { id: "professional", label: "Professional", icon: "💼" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "teaching", label: "Teaching", icon: "📚" },
    { id: "additional", label: "Additional", icon: "📝" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Add New Teacher"}
        subtitle={"Complete teacher registration form"}
        btnTitle="Back to Teachers"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <span>{tab.icon}</span>
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
                  <InputField
                    label="First Name"
                    required
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />

                  <InputField
                    label="Last Name"
                    required
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />

                  <InputField
                    label="Email Address"
                    required
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />

                  <InputField
                    label="Phone Number"
                    required
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                  <div>
                    <DatePicker
                      label={"Date of Birth"}
                      date={date.dob}
                      setDate={handleDateChange("dob")}
                    />
                  </div>
                  <div>
                    <SelectField
                      label={"Gender"}
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                      placeholder="Select gender"
                    >
                      <SelectContent>
                        {["male", "female", "other"].map((item, index) => (
                          <SelectItem
                            className="capitalize"
                            key={index}
                            value={item}
                          >
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectField>
                  </div>
                  <div>
                    <InputField
                      label="Nationality"
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) =>
                        handleInputChange("nationality", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo">Profile Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <InputField
                      label="Emergency Contact Name"
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      label=" Emergency Contact Phone"
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
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
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      id="city"
                      label={"City"}
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <InputField
                      label={"State/Province"}
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <InputField
                      label={"ZIP/Postal Code"}
                      id="zipCode"
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
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Professional Information Tab */}
            {activeTab === "professional" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label={"Employee ID"}
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) =>
                        handleInputChange("employeeId", e.target.value)
                      }
                      placeholder="e.g., TCH2024001"
                      required
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="Join Date"
                      date={date.joinDate}
                      setDate={handleDateChange("joinDate")}
                    />
                  </div>
                  <SelectField
                    label="Subject Specialization"
                    value={formData.subjectSpecialization}
                    onValueChange={(value) =>
                      handleInputChange("subjectSpecialization", value)
                    }
                    placeholder="Select subject"
                  >
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectField>

                  <InputField
                    label="Years of Experience"
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    min="0"
                    max="50"
                    placeholder="e.g., 5"
                  />

                  <SelectField
                    label="Employment Type"
                    value={formData.employmentType}
                    onValueChange={(value) =>
                      handleInputChange("employmentType", value)
                    }
                    placeholder="Select employment type"
                  >
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="substitute">Substitute</SelectItem>
                  </SelectField>

                  <InputField
                    label="Monthly Salary"
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) =>
                      handleInputChange("salary", e.target.value)
                    }
                    min="0"
                    step="0.01"
                    placeholder="e.g., 5000"
                  />

                  <InputField
                    label="Previous Institution"
                    id="previousInstitution"
                    value={formData.previousInstitution}
                    onChange={(e) =>
                      handleInputChange("previousInstitution", e.target.value)
                    }
                    placeholder="e.g., ABC High School"
                  />
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Educational Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Highest Degree"
                    required
                    value={formData.degree}
                    onValueChange={(value) =>
                      handleInputChange("degree", value)
                    }
                    placeholder="Select degree"
                  >
                    <SelectItem value="bachelor">
                      Bachelor&apos;s Degree
                    </SelectItem>
                    <SelectItem value="master">Master&apos;s Degree</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectField>

                  <InputField
                    label="University/Institution"
                    id="university"
                    value={formData.university}
                    onChange={(e) =>
                      handleInputChange("university", e.target.value)
                    }
                    placeholder="e.g., Harvard University"
                  />

                  <InputField
                    label="Graduation Year"
                    id="graduationYear"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) =>
                      handleInputChange("graduationYear", e.target.value)
                    }
                    min="1950"
                    max={new Date().getFullYear()}
                    placeholder="e.g., 2020"
                  />

                  <InputField
                    label="Teaching Qualification"
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) =>
                      handleInputChange("qualification", e.target.value)
                    }
                    placeholder="e.g., B.Ed, M.Ed, TESOL"
                  />

                  <div className="md:col-span-2">
                    <TextareaField
                      label="Additional Certifications"
                      id="additionalCertifications"
                      value={formData.additionalCertifications}
                      onChange={(e) =>
                        handleInputChange(
                          "additionalCertifications",
                          e.target.value
                        )
                      }
                      placeholder="List any additional certifications, workshops, or professional development courses"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Teaching Information Tab */}
            {activeTab === "teaching" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">
                  Teaching Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Max Classes Per Week"
                    id="maxClassesPerWeek"
                    type="number"
                    value={formData.maxClassesPerWeek}
                    onChange={(e) =>
                      handleInputChange("maxClassesPerWeek", e.target.value)
                    }
                    min="1"
                    max="40"
                    placeholder="e.g., 20"
                  />

                  <InputField
                    label="Preferred Grade Levels"
                    id="preferredGrades"
                    value={formData.preferredGrades}
                    onChange={(e) =>
                      handleInputChange("preferredGrades", e.target.value)
                    }
                    placeholder="e.g., Grade 9-12, Elementary"
                  />

                  <div className="md:col-span-2">
                    <TextareaField
                      label="Teaching Skills & Specialties"
                      id="skills"
                      value={formData.skills}
                      onChange={(e) =>
                        handleInputChange("skills", e.target.value)
                      }
                      placeholder="List teaching methods, technologies, and special skills"
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
                <div className="grid grid-cols-1 gap-4">
                  <TextareaField
                    label="Achievements & Awards"
                    id="achievements"
                    value={formData.achievements}
                    onChange={(e) =>
                      handleInputChange("achievements", e.target.value)
                    }
                    placeholder="List any teaching awards, publications, or notable achievements"
                  />

                  <TextareaField
                    label="Additional Notes"
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional information about the teacher"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/teachers">Cancel</Link>
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
                {loading ? "Creating Teacher..." : "Create Teacher"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
