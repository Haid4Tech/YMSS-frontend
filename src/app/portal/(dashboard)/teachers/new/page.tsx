"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { subjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";

export default function AddTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("personal");
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  const [formData, setFormData] = useState({
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
    classesAssigned: [] as string[],
    maxClassesPerWeek: "",
    preferredGrades: "",

    // Additional Information
    skills: "",
    achievements: "",
    notes: "",
    photo: null as File | null,
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await getAllSubjects();
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/teachers">← Back to Teachers</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Teacher</h1>
            <p className="text-muted-foreground">
              Complete teacher registration form
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
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleInputChange("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
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
                    <Label htmlFor="emergencyContactName">
                      Emergency Contact Name
                    </Label>
                    <Input
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
                    <Label htmlFor="emergencyContactPhone">
                      Emergency Contact Phone
                    </Label>
                    <Input
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
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
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
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
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
                    <Label htmlFor="joinDate">Join Date *</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) =>
                        handleInputChange("joinDate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subjectSpecialization">
                      Subject Specialization
                    </Label>
                    <Select
                      value={formData.subjectSpecialization}
                      onValueChange={(value) =>
                        handleInputChange("subjectSpecialization", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem
                            key={subject.id}
                            value={subject.id.toString()}
                          >
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      min="0"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) =>
                        handleInputChange("employmentType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="substitute">Substitute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salary">Monthly Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        handleInputChange("salary", e.target.value)
                      }
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="previousInstitution">
                      Previous Institution
                    </Label>
                    <Input
                      id="previousInstitution"
                      value={formData.previousInstitution}
                      onChange={(e) =>
                        handleInputChange("previousInstitution", e.target.value)
                      }
                    />
                  </div>
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
                  <div>
                    <Label htmlFor="degree">Highest Degree *</Label>
                    <Select
                      value={formData.degree}
                      onValueChange={(value) =>
                        handleInputChange("degree", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bachelor">
                          Bachelor&apos;s Degree
                        </SelectItem>
                        <SelectItem value="master">
                          Master&apos;s Degree
                        </SelectItem>
                        <SelectItem value="doctorate">Doctorate</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="university">University/Institution</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) =>
                        handleInputChange("university", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) =>
                        handleInputChange("graduationYear", e.target.value)
                      }
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualification">
                      Teaching Qualification
                    </Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) =>
                        handleInputChange("qualification", e.target.value)
                      }
                      placeholder="e.g., B.Ed, M.Ed, TESOL"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="additionalCertifications">
                      Additional Certifications
                    </Label>
                    <Textarea
                      id="additionalCertifications"
                      value={formData.additionalCertifications}
                      onChange={(e) =>
                        handleInputChange(
                          "additionalCertifications",
                          e.target.value
                        )
                      }
                      placeholder="List any additional certifications, courses, or training"
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
                  <div>
                    <Label htmlFor="maxClassesPerWeek">
                      Max Classes Per Week
                    </Label>
                    <Input
                      id="maxClassesPerWeek"
                      type="number"
                      value={formData.maxClassesPerWeek}
                      onChange={(e) =>
                        handleInputChange("maxClassesPerWeek", e.target.value)
                      }
                      min="1"
                      max="40"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredGrades">
                      Preferred Grade Levels
                    </Label>
                    <Input
                      id="preferredGrades"
                      value={formData.preferredGrades}
                      onChange={(e) =>
                        handleInputChange("preferredGrades", e.target.value)
                      }
                      placeholder="e.g., Grade 9-12, Elementary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="skills">
                      Teaching Skills & Specialties
                    </Label>
                    <Textarea
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
                  <div>
                    <Label htmlFor="achievements">Achievements & Awards</Label>
                    <Textarea
                      id="achievements"
                      value={formData.achievements}
                      onChange={(e) =>
                        handleInputChange("achievements", e.target.value)
                      }
                      placeholder="List any teaching awards, publications, or notable achievements"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Any additional information about the teacher"
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
