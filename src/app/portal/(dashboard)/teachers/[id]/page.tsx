"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { enhancedTeachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { SafeRender } from "@/components/ui/safe-render";

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!teacherId || isNaN(parseInt(teacherId))) {
          throw new Error("Invalid teacher ID");
        }

        const teacherData = await enhancedTeachersAPI.getById(parseInt(teacherId));
        
        // Validate teacher data structure
        if (teacherData && typeof teacherData === "object") {
          setTeacher(teacherData);
        } else {
          throw new Error("Invalid teacher data received");
        }
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
        setError(error instanceof Error ? error.message : "Failed to load teacher data");
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !teacher?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error || "Teacher not found or data incomplete"}
        </p>
        <Button asChild className="mt-4">
          <Link href="/portal/teachers">Back to Teachers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/teachers">← Back</Link>
          </Button>
          <PersonAvatar
            name={teacher?.user?.name || "Unknown Teacher"}
            size="xl"
          />
          <div>
            <h1 className="text-3xl font-bold">
              <SafeRender fallback="Unknown Teacher">
                {teacher?.user?.name}
              </SafeRender>
            </h1>
            <p className="text-muted-foreground">Teacher Profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Profile</Button>
          <Button>Send Message</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {teacher?.experience || 0}
            </div>
            <p className="text-sm text-muted-foreground">Years Experience</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              <SafeRender fallback="Not assigned">
                {teacher?.subject?.name}
              </SafeRender>
            </div>
            <p className="text-sm text-muted-foreground">Main Subject</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              <SafeRender fallback="Not provided">
                {teacher?.employeeId}
              </SafeRender>
            </div>
            <p className="text-sm text-muted-foreground">Employee ID</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "professional", label: "Professional Details" },
            { id: "contact", label: "Contact Information" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.user?.name}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.user?.email}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Teacher ID
                </label>
                <p className="text-sm">{teacher?.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Main Subject
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not assigned">
                    {teacher?.subject?.name}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Experience
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.experience ? `${teacher.experience} years` : null}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Join Date
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.hireDate || teacher?.joinDate 
                      ? new Date(teacher.hireDate || teacher.joinDate!).toLocaleDateString()
                      : null}
                  </SafeRender>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "professional" && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Employee ID
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.employeeId}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Qualification
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.qualification}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.department}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Employment Type
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.employmentType}
                  </SafeRender>
                </p>
              </div>
              {teacher?.skills && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Skills
                  </label>
                  <p className="text-sm">{teacher.skills}</p>
                </div>
              )}
              {teacher?.achievements && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Achievements
                  </label>
                  <p className="text-sm">{teacher.achievements}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "contact" && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.phone}
                  </SafeRender>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm">
                  <SafeRender fallback="Not provided">
                    {teacher?.address}
                  </SafeRender>
                </p>
              </div>
              {teacher?.emergencyContact && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Emergency Contact Name
                    </label>
                    <p className="text-sm">
                      <SafeRender fallback="Not provided">
                        {teacher.emergencyContact.name}
                      </SafeRender>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Emergency Contact Phone
                    </label>
                    <p className="text-sm">
                      <SafeRender fallback="Not provided">
                        {teacher.emergencyContact.phone}
                      </SafeRender>
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
