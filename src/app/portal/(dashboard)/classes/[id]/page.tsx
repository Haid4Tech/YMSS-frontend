"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { enhancedClassesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";
import { enhancedStudentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { enhancedGradesAPI } from "@/jotai/grades/grades";
import { Grade } from "@/jotai/grades/grades-types";
import { enhancedAttendanceAPI } from "@/jotai/attendance/attendance";
import { Attendance } from "@/jotai/attendance/attendance-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const [classInfo, studentsData, gradesData, attendanceData] =
          await Promise.all([
            enhancedClassesAPI.getById(parseInt(classId)),
            enhancedStudentsAPI.getByClass
              ? enhancedStudentsAPI.getByClass(parseInt(classId))
              : [],
            enhancedGradesAPI.getByClass(parseInt(classId)),
            enhancedAttendanceAPI.getByClass(parseInt(classId)),
          ]);

        setClassData(classInfo);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error("Failed to fetch class data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  // Calculate class statistics
  const classStats = {
    totalStudents: students.length,
    averageGrade:
      grades.length > 0
        ? (
            grades.reduce((sum, grade) => sum + (grade.marks || 0), 0) /
            grades.length
          ).toFixed(1)
        : "N/A",
    attendanceRate:
      attendance.length > 0
        ? (
            (attendance.filter((a) => a.present).length / attendance.length) *
            100
          ).toFixed(1)
        : "N/A",
    capacity: classData?.capacity || 0,
  };

  // Grade distribution
  const gradeDistribution = grades.reduce((acc, grade) => {
    const gradeKey = grade.grade || "Ungraded";
    acc[gradeKey] = (acc[gradeKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gradeChartData = Object.entries(gradeDistribution).map(
    ([grade, count]) => ({
      grade,
      count,
      color:
        grade === "A"
          ? "#10B981"
          : grade === "B"
          ? "#3B82F6"
          : grade === "C"
          ? "#F59E0B"
          : grade === "D"
          ? "#EF4444"
          : "#6B7280",
    })
  );

  // Performance by subject
  const subjectPerformance = grades.reduce((acc, grade) => {
    const subject = grade.exam?.subject?.name || "Unknown";
    if (!acc[subject]) {
      acc[subject] = { subject, totalMarks: 0, count: 0 };
    }
    acc[subject].totalMarks += grade.marks || 0;
    acc[subject].count += 1;
    return acc;
  }, {} as Record<string, { subject: string; totalMarks: number; count: number }>);

  const subjectChart = Object.values(subjectPerformance).map((item) => ({
    subject: item.subject,
    average: (item.totalMarks / item.count).toFixed(1),
  }));

  // Monthly attendance trend
  const monthlyAttendance = attendance.reduce((acc, record) => {
    const month = record.date
      ? new Date(record.date).toLocaleDateString("en", { month: "short" })
      : "Unknown";
    if (!acc[month]) {
      acc[month] = { month, present: 0, total: 0 };
    }
    acc[month].total += 1;
    if (record.present) acc[month].present += 1;
    return acc;
  }, {} as Record<string, { month: string; present: number; total: number }>);

  const attendanceChart = Object.values(monthlyAttendance).map((item) => ({
    month: item.month,
    rate: ((item.present / item.total) * 100).toFixed(1),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Class not found</p>
        <Button asChild className="mt-4">
          <Link href="/portal/classes">Back to Classes</Link>
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
            <Link href="/portal/classes">← Back</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground">Class Details & Analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Class</Button>
          <Button>Add Student</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {classStats.totalStudents}
            </div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {classStats.averageGrade}
            </div>
            <p className="text-sm text-muted-foreground">Average Grade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {classStats.attendanceRate}%
            </div>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              {classStats.capacity}
            </div>
            <p className="text-sm text-muted-foreground">Class Capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "students", label: "Students Roster" },
            { id: "performance", label: "Academic Performance" },
            { id: "attendance", label: "Attendance Analytics" },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Information */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Class Name
                  </label>
                  <p className="text-sm">{classData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Grade Level
                  </label>
                  <p className="text-sm">
                    {classData.grade || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Capacity
                  </label>
                  <p className="text-sm">{classData.capacity || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Enrollment
                  </label>
                  <p className="text-sm">{students.length} students</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Available Spots
                  </label>
                  <p className="text-sm">
                    {(classData.capacity || 0) - students.length} remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {gradeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={gradeChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ grade, count }) => `${grade}: ${count}`}
                    >
                      {gradeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No grade data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>Students Roster</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{student.user.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        ID: {student.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {student.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Parent: {student.parent?.user.name || "Not assigned"}
                    </p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/portal/students/${student.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No students enrolled in this class yet
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="space-y-4">
                  {students
                    .map((student) => {
                      const studentGrades = grades.filter(
                        (g) => g.studentId === student.id
                      );
                      const avgGrade =
                        studentGrades.length > 0
                          ? studentGrades.reduce(
                              (sum, g) => sum + (g.marks || 0),
                              0
                            ) / studentGrades.length
                          : 0;
                      return { student, avgGrade };
                    })
                    .sort((a, b) => b.avgGrade - a.avgGrade)
                    .slice(0, 5)
                    .map(({ student, avgGrade }, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{student.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.user.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {avgGrade.toFixed(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Average
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Monthly Attendance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No attendance data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => {
                    const studentAttendance = attendance.filter(
                      (a) => a.studentId === student.id
                    );
                    const presentCount = studentAttendance.filter(
                      (a) => a.present
                    ).length;
                    const attendanceRate =
                      studentAttendance.length > 0
                        ? (
                            (presentCount / studentAttendance.length) *
                            100
                          ).toFixed(1)
                        : "0";

                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{student.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {presentCount}/{studentAttendance.length} classes
                            attended
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              parseFloat(attendanceRate) >= 90
                                ? "text-green-600"
                                : parseFloat(attendanceRate) >= 75
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {attendanceRate}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Attendance
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No attendance records available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
