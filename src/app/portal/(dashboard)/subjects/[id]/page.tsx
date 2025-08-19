"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Subject } from "@/jotai/subject/subject-types";
import { formatDate } from "@/common/helper";
import { Plus, Users, BookOpen, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { enrollmentsAPI } from "@/jotai/enrollment/enrollment";
import { Enrollment } from "@/jotai/enrollment/enrollment-types";

import { subjectsAPI } from "@/jotai/subject/subject";

import { subjectTeacherAPI } from "@/jotai/subject-teacher/subject-teacher";
import { SubjectTeacher } from "@/jotai/subject-teacher/subject-teacher-type";

import { subjectAttendanceAPI } from "@/jotai/subject-attendance/subject-attendance";
import { SubjectAttendance } from "@/jotai/subject-attendance/subject-attendance-type";

import { DynamicHeader } from "@/components/general/page-header";
import { AssignteacherForm } from "@/components/portal/dashboards/teacher/assign-teacher-form";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null
  );
  const [states, setStates] = useState<{
    assignTeacher: boolean;
    deleteTeacher: boolean;
  }>({
    assignTeacher: false,
    deleteTeacher: false,
  });

  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [addTeacher, setAddTeacher] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const [subjectData, enrollmentsData, teachersData, attendanceData] =
          await Promise.all([
            subjectsAPI.getById(parseInt(subjectId)),
            enrollmentsAPI.getBySubject(parseInt(subjectId)),
            subjectTeacherAPI.getBySubject(parseInt(subjectId)),
            subjectAttendanceAPI.getBySubject(parseInt(subjectId)),
            // studentsAPI.getBySubject(subjectId),
          ]);

        setSubject(subjectData);
        setEnrollments(enrollmentsData);
        setSubjectTeachers(teachersData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Failed to fetch subject data:", error);
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId && !isNaN(parseInt(subjectId))) {
      fetchSubjectData();
    } else {
      setLoading(false);
    }
  }, [subjectId, states]);

  const handleAssignTeacherToSubject = async () => {
    setStates((prev) => ({
      ...prev,
      assignTeacher: true,
    }));
    try {
      if (selectedTeacherId) {
        await subjectTeacherAPI.create({
          subjectId: parseInt(subjectId),
          teacherId: selectedTeacherId,
        });

        toast.success(`Assigned teacher to subject`);
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setStates((prev) => ({
        ...prev,
        assignTeacher: false,
      }));
    }
  };

  const deleteTeacher = async (subjectId: number, teacherId: number) => {
    setStates((prev) => ({
      ...prev,
      deleteTeacher: true,
    }));
    try {
      await subjectTeacherAPI.delete({ subjectId, teacherId });
      toast.success("Teacher removed from subject successfully!");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error("Failed to delete teacher.", {
        description: errorMessage,
      });
    } finally {
      setStates((prev) => ({
        ...prev,
        deleteTeacher: false,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Subject not found</p>
        <Button asChild className="mt-4">
          <Link href="/portal/subjects">Back to Subjects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DynamicHeader
        name={subject.name}
        title={subject.name}
        subtitle={"Subject Information"}
        endBtns={
          <div className="flex gap-2">
            <Button variant="outline">Edit Subject</Button>
            <Button>Schedule Exam</Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {enrollments.length}
            </div>
            <p className="text-sm text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {subjectTeachers.length}
            </div>
            <p className="text-sm text-muted-foreground">Assigned Teachers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {attendance.length}
            </div>
            <p className="text-sm text-muted-foreground">Attendance Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">N/A</div>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "enrollments", label: "Enrollments" },
            { id: "teachers", label: "Teachers" },
            { id: "attendance", label: "Attendance" },
            { id: "details", label: "Subject Details" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
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
            <CardTitle>Subject Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subject Name
                </label>
                <p className="text-sm">{subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subject Code
                </label>
                <p className="text-sm">{subject.code || "Not set"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm">
                  {subject.description || "No description provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Assigned Teacher
                </label>
                <div className="text-sm">
                  {subject?.teachers && subject.teachers.length > 0
                    ? subject.teachers.map((teacher, index) => (
                        <span
                          key={index}
                        >{`${teacher?.teacher?.user?.firstname} ${teacher?.teacher?.user?.lastname}`}</span>
                      ))
                    : "Not Assigned"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Credits
                </label>
                <p className="text-sm">{subject.credits || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "enrollments" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Enrolled Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No students enrolled in this subject
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex flex-row flex-wrap items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {enrollment.student.user.firstname}{" "}
                        {enrollment.student.user.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Class: {enrollment.student.class.name} | Enrolled:{" "}
                        {formatDate(new Date(enrollment.enrolledAt))}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "teachers" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Assigned Teachers</span>

              <Button
                variant={addTeacher ? "outline" : "default"}
                onClick={() => setAddTeacher((prev) => !prev)}
                size="sm"
              >
                {addTeacher ? (
                  <p>Cancel</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus size={15} />
                    Assign Teacher
                  </div>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addTeacher ? (
              <div className={"space-y-8"}>
                <p className="">
                  Assign teacher to{" "}
                  <span className={"font-semibold"}>{subject.name}</span>
                </p>

                <div className="flex flex-row items-end gap-2">
                  <AssignteacherForm setTeacherId={setSelectedTeacherId} />
                  <Button
                    size={"lg"}
                    onClick={() => handleAssignTeacherToSubject()}
                    className="flex flex-row gap-1 items-center"
                  >
                    <Plus size={15} />
                    <p>Add</p>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {subjectTeachers.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No teachers assigned to this subject
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjectTeachers.map((subjectTeacher) => (
                      <div
                        key={subjectTeacher.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {subjectTeacher.teacher.user.firstname}{" "}
                            {subjectTeacher.teacher.user.lastname}
                          </p>
                          <p className="capitalize text-sm text-muted-foreground">
                            Holder Degree:{" "}
                            {subjectTeacher.teacher.degree ||
                              "No degree specified"}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            deleteTeacher(subject.id, subjectTeacher.teacherId)
                          }
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "attendance" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attendance Records</span>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Mark Attendance
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No attendance records for this subject
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {record.enrollment.student.user.firstname}{" "}
                        {record.enrollment.student.user.lastname}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(record.date).toLocaleDateString()} |
                        Status: {record.status}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : record.status === "ABSENT"
                          ? "bg-red-100 text-red-800"
                          : record.status === "LATE"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {record.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Advanced subject analytics and performance tracking are currently
              under development.
            </p>
            <p className="text-sm text-muted-foreground">
              Features like grade distribution, performance trends, and student
              analytics will be available soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
