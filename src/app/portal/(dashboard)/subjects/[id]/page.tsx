"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Subject } from "@/jotai/subject/subject-types";
import { formatDate } from "@/common/helper";
import {
  Plus,
  Users,
  BookOpen,
  Calendar,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();

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

  // Column definitions for enrollments table
  const enrollmentColumns: ColumnDef<Enrollment>[] = [
    {
      accessorKey: "student.user.firstname",
      header: "First Name",
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <div className="font-medium">{enrollment.student.user.firstname}</div>
        );
      },
    },
    {
      accessorKey: "student.user.lastname",
      header: "Last Name",
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <div className="font-medium">{enrollment.student.user.lastname}</div>
        );
      },
    },
    {
      accessorKey: "student.class.name",
      header: "Class",
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {enrollment.student.class?.name || "Not assigned"}
          </div>
        );
      },
    },
    {
      accessorKey: "enrolledAt",
      header: "Enrolled Date",
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <div className="text-sm">
            {formatDate(new Date(enrollment.enrolledAt))}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const enrollment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="border h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(enrollment.id.toString())
                }
              >
                Copy enrollment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/portal/students/${enrollment.student.id}`)
                }
              >
                View student
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove enrollment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Column definitions for teachers table
  const teacherColumns: ColumnDef<SubjectTeacher>[] = [
    {
      accessorKey: "teacher.user.firstname",
      header: "First Name",
      cell: ({ row }) => {
        const subjectTeacher = row.original;
        return (
          <div className="font-medium">
            {subjectTeacher.teacher.user.firstname}
          </div>
        );
      },
    },
    {
      accessorKey: "teacher.user.lastname",
      header: "Last Name",
      cell: ({ row }) => {
        const subjectTeacher = row.original;
        return (
          <div className="font-medium">
            {subjectTeacher.teacher.user.lastname}
          </div>
        );
      },
    },
    {
      accessorKey: "teacher.degree",
      header: "Degree",
      cell: ({ row }) => {
        const subjectTeacher = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {subjectTeacher.teacher.degree || "No degree specified"}
          </div>
        );
      },
    },
    {
      accessorKey: "teacher.employmentType",
      header: "Employment Type",
      cell: ({ row }) => {
        const subjectTeacher = row.original;
        return (
          <div className="text-sm">
            {subjectTeacher.teacher.employmentType || "Not specified"}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subjectTeacher = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="border h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(subjectTeacher.id.toString())
                }
              >
                Copy assignment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/portal/teachers/${subjectTeacher.teacher.id}`)
                }
              >
                View teacher
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() =>
                  subject && deleteTeacher(subject.id, subjectTeacher.teacherId)
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from subject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate attendance summary for each student
  const calculateAttendanceSummary = () => {
    const studentAttendanceMap = new Map();
    
    attendance.forEach((record) => {
      const studentId = record.enrollment.student.id;
      const studentName = `${record.enrollment.student.user.firstname} ${record.enrollment.student.user.lastname}`;
      
      if (!studentAttendanceMap.has(studentId)) {
        studentAttendanceMap.set(studentId, {
          studentId,
          studentName,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          excusedDays: 0,
          attendancePercentage: 0,
        });
      }
      
      const summary = studentAttendanceMap.get(studentId);
      summary.totalDays++;
      
      switch (record.status) {
        case "PRESENT":
          summary.presentDays++;
          break;
        case "ABSENT":
          summary.absentDays++;
          break;
        case "LATE":
          summary.lateDays++;
          break;
        case "EXCUSED":
          summary.excusedDays++;
          break;
      }
    });
    
    // Calculate percentages
    studentAttendanceMap.forEach((summary) => {
      summary.attendancePercentage = summary.totalDays > 0 
        ? Math.round((summary.presentDays / summary.totalDays) * 100)
        : 0;
    });
    
    return Array.from(studentAttendanceMap.values());
  };

  const attendanceSummary = calculateAttendanceSummary();

  // Column definitions for attendance summary table
  const attendanceColumns: ColumnDef<any>[] = [
    {
      accessorKey: "studentName",
      header: "Student Name",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="font-medium">
            {summary.studentName}
          </div>
        );
      },
    },
    {
      accessorKey: "totalDays",
      header: "Total Days",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-sm text-muted-foreground">
            {summary.totalDays}
          </div>
        );
      },
    },
    {
      accessorKey: "presentDays",
      header: "Present",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-sm text-green-600 font-medium">
            {summary.presentDays}
          </div>
        );
      },
    },
    {
      accessorKey: "absentDays",
      header: "Absent",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-sm text-red-600 font-medium">
            {summary.absentDays}
          </div>
        );
      },
    },
    {
      accessorKey: "lateDays",
      header: "Late",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-sm text-yellow-600 font-medium">
            {summary.lateDays}
          </div>
        );
      },
    },
    {
      accessorKey: "excusedDays",
      header: "Excused",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-sm text-blue-600 font-medium">
            {summary.excusedDays}
          </div>
        );
      },
    },
    {
      accessorKey: "attendancePercentage",
      header: "Attendance %",
      cell: ({ row }) => {
        const summary = row.original;
        const percentage = summary.attendancePercentage;
        const colorClass = percentage >= 80 
          ? "text-green-600" 
          : percentage >= 60 
          ? "text-yellow-600" 
          : "text-red-600";
        
        return (
          <div className={`text-sm font-bold ${colorClass}`}>
            {percentage}%
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="border h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(summary.studentId.toString())
                }
              >
                Copy student ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/portal/students/${summary.studentId}`)
                }
              >
                View student
              </DropdownMenuItem>
              <DropdownMenuItem className="text-blue-600">
                View detailed attendance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const [subjectData, enrollmentsData, teachersData, attendanceData] =
          await Promise.allSettled([
            subjectsAPI.getById(parseInt(subjectId)),
            enrollmentsAPI.getBySubject(parseInt(subjectId)),
            subjectTeacherAPI.getBySubject(parseInt(subjectId)),
            subjectAttendanceAPI.getBySubject(parseInt(subjectId)),
            // studentsAPI.getBySubject(subjectId),
          ]);

        if (subjectData.status === "fulfilled") setSubject(subjectData.value);
        if (enrollmentsData.status === "fulfilled")
          setEnrollments(enrollmentsData.value);
        if (teachersData.status === "fulfilled")
          setSubjectTeachers(teachersData.value);
        if (attendanceData.status === "fulfilled")
          setAttendance(attendanceData.value);
      } catch (error) {
        console.error("Failed to fetch subject data:", error);
        console.error("Error details:", error);
        toast.error("Failed to load subject data. Please try again.");
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
            <Button
              variant="outline"
              onClick={() => router.push(`/portal/subjects/${subjectId}/edit`)}
            >
              Edit Subject
            </Button>
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
                  Class
                </label>
                <p className="text-sm">{subject.class?.name || "Not set"}</p>
              </div>

              <div>
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
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "enrollments" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Enrolled Students</span>
              <div className="text-sm text-muted-foreground">
                {enrollments.length} student
                {enrollments.length !== 1 ? "s" : ""} enrolled
              </div>
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
              <DataTable
                columns={enrollmentColumns}
                data={enrollments}
                searchPlaceholder="Search students..."
                searchKey="student.user.firstname"
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "teachers" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Assigned Teachers</span>
                <div className="text-sm text-muted-foreground">
                  {subjectTeachers.length} teacher
                  {subjectTeachers.length !== 1 ? "s" : ""} assigned
                </div>
              </div>

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
                  <DataTable
                    columns={teacherColumns}
                    data={subjectTeachers}
                    searchPlaceholder="Search teachers..."
                    searchKey="teacher.user.firstname"
                  />
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
              <div className="flex items-center gap-4">
                <span>Attendance Summary</span>
                <div className="text-sm text-muted-foreground">
                  {attendanceSummary.length} student{attendanceSummary.length !== 1 ? "s" : ""}{" "}
                  with attendance records
                </div>
              </div>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Mark Attendance
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceSummary.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No attendance records for this subject
                </p>
              </div>
            ) : (
              <DataTable
                columns={attendanceColumns}
                data={attendanceSummary}
                searchPlaceholder="Search students..."
                searchKey="studentName"
              />
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
