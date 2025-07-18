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
  }, []);

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
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "address", label: "Address", icon: "🏠" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "parent", label: "Parent/Guardian", icon: "👨‍👩‍👧‍👦" },
    { id: "medical", label: "Medical", icon: "🏥" },
    { id: "additional", label: "Additional", icon: "📝" },
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
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
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
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) =>
                        handleInputChange("religion", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(value) =>
                        handleInputChange("bloodGroup", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="photo">Student Photo</Label>
                    <Input
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
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      required
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
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
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
                    <Label htmlFor="classId">Assign to Class *</Label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) =>
                        handleInputChange("classId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name} (Grade?)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
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
                    <Label htmlFor="admissionDate">Admission Date *</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) =>
                        handleInputChange("admissionDate", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Current Grade</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) =>
                        handleInputChange("grade", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Grade {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="previousSchool">Previous School</Label>
                    <Input
                      id="previousSchool"
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
                    <Label htmlFor="parentId">Select Parent/Guardian</Label>
                    <Select
                      value={formData.parentId}
                      onValueChange={(value) =>
                        handleInputChange("parentId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No parent assigned</SelectItem>
                        {parents.map((parent) => (
                          <SelectItem
                            key={parent.id}
                            value={parent.id.toString()}
                          >
                            {parent.user.name} - {parent.user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactName">
                      Emergency Contact Name *
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">
                      Emergency Contact Phone *
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
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelation">
                      Relationship *
                    </Label>
                    <Select
                      value={formData.emergencyContactRelation}
                      onValueChange={(value) =>
                        handleInputChange("emergencyContactRelation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        <SelectItem value="uncle">Uncle</SelectItem>
                        <SelectItem value="aunt">Aunt</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="medicalConditions">
                      Medical Conditions
                    </Label>
                    <Textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) =>
                        handleInputChange("medicalConditions", e.target.value)
                      }
                      placeholder="List any medical conditions or health issues"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) =>
                        handleInputChange("allergies", e.target.value)
                      }
                      placeholder="List any known allergies"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      value={formData.medications}
                      onChange={(e) =>
                        handleInputChange("medications", e.target.value)
                      }
                      placeholder="List current medications and dosages"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctorName">Family Doctor Name</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) =>
                        handleInputChange("doctorName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctorPhone">Doctor&apos;s Phone</Label>
                    <Input
                      id="doctorPhone"
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
                    <Label htmlFor="transportationMethod">
                      Transportation Method
                    </Label>
                    <Select
                      value={formData.transportationMethod}
                      onValueChange={(value) =>
                        handleInputChange("transportationMethod", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transportation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_bus">School Bus</SelectItem>
                        <SelectItem value="private_car">Private Car</SelectItem>
                        <SelectItem value="public_transport">
                          Public Transport
                        </SelectItem>
                        <SelectItem value="walking">Walking</SelectItem>
                        <SelectItem value="bicycle">Bicycle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hobbies">Hobbies & Interests</Label>
                    <Input
                      id="hobbies"
                      value={formData.hobbies}
                      onChange={(e) =>
                        handleInputChange("hobbies", e.target.value)
                      }
                      placeholder="e.g., Reading, Sports, Music"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
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
