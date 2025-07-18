"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { enhancedStudentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { enhancedGradesAPI } from "@/jotai/grades/grades";
import { Grade } from "@/jotai/grades/grades-types";
import {
  // attendanceAPI,
  enhancedAttendanceAPI,
} from "@/jotai/attendance/attendance";
import { Attendance } from "@/jotai/attendance/attendance-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonAvatar } from "@/components/ui/person-avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        console.log("Fetching student data for ID:", studentId);

        const [studentData, gradesData, attendanceData] = await Promise.all([
          enhancedStudentsAPI.getById(parseInt(studentId)),
          enhancedGradesAPI.getByStudent(parseInt(studentId)),
          enhancedAttendanceAPI.getByStudent(parseInt(studentId)),
        ]);

        console.log("Student data received:", studentData);

        // Validate student data structure
        if (studentData && typeof studentData === "object") {
          setStudent(studentData);
        } else {
          console.error("Invalid student data structure:", studentData);
          setStudent(null);
        }

        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
        setStudent(null);
        setGrades([]);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && !isNaN(parseInt(studentId))) {
      fetchStudentData();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  // Calculate academic statistics - safely
  const academicStats = {
    averageGrade:
      Array.isArray(grades) && grades.length > 0
        ? (
            grades.reduce((sum, grade) => sum + (grade?.value || 0), 0) /
            grades.length
          ).toFixed(1)
        : "N/A",
    totalExams: Array.isArray(grades) ? grades.length : 0,
    attendanceRate:
      Array.isArray(attendance) && attendance.length > 0
        ? (
            (attendance.filter((a) => a?.present === true).length /
              attendance.length) *
            100
          ).toFixed(1)
        : "N/A",
    totalClasses: Array.isArray(attendance) ? attendance.length : 0,
  };

  // Prepare chart data - only if grades is valid array
  const gradeChartData = Array.isArray(grades)
    ? grades.map((grade, index) => ({
        exam: grade?.exam?.title || `Exam ${index + 1}`,
        marks: grade?.value || 0,
        totalMarks: 100, // Default total marks since it's not in Exam type
        percentage: (((grade?.value || 0) / 100) * 100).toFixed(1),
      }))
    : [];

  const subjectPerformanceData = Array.isArray(grades)
    ? grades.reduce((acc, grade) => {
        const subject = grade?.exam?.subject?.name || "Unknown";
        if (!acc[subject]) {
          acc[subject] = { subject, totalMarks: 0, count: 0 };
        }
        acc[subject].totalMarks += grade?.value || 0;
        acc[subject].count += 1;
        return acc;
      }, {} as Record<string, { subject: string; totalMarks: number; count: number }>)
    : {};

  const subjectChart = Object.values(subjectPerformanceData).map((item) => ({
    subject: item.subject,
    average: (item.totalMarks / item.count).toFixed(1),
  }));

  const attendancePieData = Array.isArray(attendance)
    ? [
        {
          name: "Present",
          value: attendance.filter((a) => a?.present === true).length,
          color: "#10B981",
        },
        {
          name: "Absent",
          value: attendance.filter((a) => a?.present === false).length,
          color: "#EF4444",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student || !student.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {!student ? "Student not found" : "Student data incomplete"}
        </p>
        <Button onClick={() => router.back()} asChild className="mt-4">
          Back to Students
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
            <Link href="/portal/students">← Back</Link>
          </Button>
          <PersonAvatar
            name={student?.user?.name || "Unknown Student"}
            size="xl"
          />
          <div>
            <h1 className="text-3xl font-bold">
              {student?.user?.name || "Unknown Student"}
            </h1>
            <p className="text-muted-foreground">Student Profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Profile</Button>
          <Button>Send Message</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {academicStats.averageGrade}
            </div>
            <p className="text-sm text-muted-foreground">Average Grade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {academicStats.totalExams}
            </div>
            <p className="text-sm text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {academicStats.attendanceRate}%
            </div>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              {academicStats.totalClasses}
            </div>
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "academics", label: "Academic Performance" },
            { id: "attendance", label: "Attendance" },
            { id: "grades", label: "Grades & Results" },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-sm">{student.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">{student.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Student ID
                  </label>
                  <p className="text-sm">{student.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Class
                  </label>
                  <p className="text-sm">
                    {student.class?.name || "Not assigned"}
                  </p>
                </div>
                {/* TODO: Uncomment when dateOfBirth is added to Student schema */}
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </label>
                  <p className="text-sm">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div> */}

                {/* TODO: Uncomment when phone is added to Student schema */}
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <p className="text-sm">{student.phone || "Not provided"}</p>
                </div> */}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <p className="text-sm">{student.user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </label>
                  <p className="text-sm">
                    {new Date(student.user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {/* TODO: Uncomment when address is added to Student schema */}
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Address
                  </label>
                  <p className="text-sm">{student.address || "Not provided"}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parent
                  </label>
                  <p className="text-sm">
                    {student?.parent?.user?.name || "Not assigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {attendancePieData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No attendance data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "academics" && (
        <div className="space-y-6">
          {/* Grade Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {gradeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={gradeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exam" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="marks"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No grade data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No subject performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "attendance" && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length > 0 ? (
              <div className="space-y-4">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {/* TODO: Uncomment when lesson is added to Attendance schema */}
                        {/* {record.lesson?.title || "Unknown Lesson"} */}
                        Attendance Record
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.present
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.present ? "Present" : "Absent"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No attendance records available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "grades" && (
        <Card>
          <CardHeader>
            <CardTitle>Grades & Results</CardTitle>
          </CardHeader>
          <CardContent>
            {grades.length > 0 ? (
              <div className="space-y-4">
                {grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {grade.exam?.title || "Unknown Exam"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {grade.exam?.subject?.name || "Unknown Subject"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {/* TODO: Uncomment when totalMarks is added to Exam schema */}
                        {/* {grade.marks || 0}/{grade.exam?.totalMarks || 100} */}
                        {grade.value || 0}/100
                      </p>
                      {/* TODO: Uncomment when letter grade is added to Grade schema */}
                      {/* <p
                        className={`text-sm font-medium ${
                          grade.grade === "A"
                            ? "text-green-600"
                            : grade.grade === "B"
                            ? "text-blue-600"
                            : grade.grade === "C"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        Grade: {grade.grade || "Not graded"}
                      </p> */}
                      <p className="text-sm font-medium text-blue-600">
                        Score: {grade.value || 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No grade records available
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
