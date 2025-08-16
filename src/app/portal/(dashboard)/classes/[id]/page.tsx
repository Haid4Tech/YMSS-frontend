"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";
import { studentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { enhancedGradesAPI } from "@/jotai/grades/grades";
import { Grade } from "@/jotai/grades/grades-types";
// import { enhancedSubjectAttendanceAPI } from "@/jotai/subject-attendance/subject-attendance";
// import { SubjectAttendance } from "@/jotai/subject-attendance/subject-attendance-type";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/general/page-header";
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
  // LineChart,
  // Line,
} from "recharts";

import { StudentRosterCard } from "@/components/portal/dashboards/class/student-roster-card";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;
  const router = useRouter();

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  // const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const studentsData = studentsAPI.getStudentsByClass(parseInt(classId));
        const [classInfo, gradesData] = await Promise.all([
          classesAPI.getById(parseInt(classId)),
          enhancedGradesAPI.getByClass(parseInt(classId)),
          // enhancedSubjectAttendanceAPI.getByClass(parseInt(classId)),
        ]);

        setClassData(classInfo);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        // setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
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
    totalStudents: classData?.students?.length,
    averageGrade:
      grades.length > 0
        ? (
            grades.reduce((sum, grade) => sum + (grade.marks || 0), 0) /
            grades.length
          ).toFixed(1)
        : "N/A",
    // attendanceRate:
    //   attendance.length > 0
    //     ? (
    //         (attendance.filter((a) => a.status).length / attendance.length) *
    //         100
    //       ).toFixed(1)
    //     : "N/A",
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
  // const monthlyAttendance = attendance.reduce((acc, record) => {
  //   const month = record.date
  //     ? new Date(record.date).toLocaleDateString("en", { month: "short" })
  //     : "Unknown";
  //   if (!acc[month]) {
  //     acc[month] = { month, present: 0, total: 0 };
  //   }
  //   acc[month].total += 1;
  //   if (record.status) acc[month].present += 1;
  //   return acc;
  // }, {} as Record<string, { month: string; present: number; total: number }>);

  // const attendanceChart = Object.values(monthlyAttendance).map((item) => ({
  //   month: item.month,
  //   rate: ((item.present / item.total) * 100).toFixed(1),
  // }));

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
      <PageHeader
        title={classData.name}
        subtitle={"Class Details & Analytics"}
        link="/portal/classes"
        endBtns={
          <div className="flex gap-2">
            <Button variant="outline">Edit Class</Button>
            <Button onClick={() => router.push(`${classId}/students`)}>
              Students
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        {/* <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {classStats.attendanceRate}%
            </div>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card> */}
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
            // { id: "attendance", label: "Attendance Analytics" },
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
            {classData?.students?.length > 0 ? (
              <StudentRosterCard classData={classData} />
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
                            <p className="font-medium">{`${student.user.firstname} ${student.user.lastname}`}</p>
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
    </div>
  );
}
