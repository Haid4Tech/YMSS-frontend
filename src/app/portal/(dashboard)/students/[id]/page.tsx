"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAtom } from "jotai";
import { studentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { gradesAPI, reportCardAtom } from "@/jotai/grades/grades";
import { Grade } from "@/jotai/grades/grades-types";
import { enhancedSubjectAttendanceAPI } from "@/jotai/subject-attendance/subject-attendance";
import { SubjectAttendance } from "@/jotai/subject-attendance/subject-attendance-type";
import { Button } from "@/components/ui/button";
import { DynamicHeader } from "@/components/general/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputField, SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { ReportCardSheet } from "@/components/portal/students/report-card-sheet";
import {
  formatFeeInput,
  formatNaira,
  formatTermDate,
} from "@/components/portal/students/report-fees";
import { generateAcademicYears } from "@/common/helper";
import { Printer } from "lucide-react";
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
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [, getByStudent] = useAtom(gradesAPI.getByStudent);

  // Report card (compiled result for a specific term) + cumulative
  // performance (every term/year on record for this student).
  const [reportCard] = useAtom(reportCardAtom);
  const [, getReportCard] = useAtom(gradesAPI.getReportCard);
  const [, getResultsByStudent] = useAtom(gradesAPI.getResultsByStudent);
  const [reportCardLoading, setReportCardLoading] = useState(false);
  const [allTimeResults, setAllTimeResults] = useState<Grade[]>([]);
  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");
  // FEES section values printed on this student's report card, collected via a
  // prompt when the admin chooses to print.
  const [nextTermFee, setNextTermFee] = useState<string>("");
  const [nextTermDate, setNextTermDate] = useState<string>("");
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  // Close the fee prompt, then print once the sheet has re-rendered with the
  // entered values.
  const handlePrintReport = () => {
    setPrintDialogOpen(false);
    setTimeout(() => window.print(), 150);
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);

        const [studentData, gradesData, attendanceData] = await Promise.all([
          studentsAPI.getById(parseInt(studentId)),
          getByStudent(parseInt(studentId)),
          enhancedSubjectAttendanceAPI.getByStudent(parseInt(studentId)),
        ]);

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
  }, [studentId, getByStudent]);

  // Compiled result / report card for the selected term.
  useEffect(() => {
    const fetchReportCard = async () => {
      if (!studentId || isNaN(parseInt(studentId))) return;
      setReportCardLoading(true);
      try {
        await getReportCard(parseInt(studentId), academicYear, term);
      } catch (error) {
        console.error("Failed to fetch report card:", error);
      } finally {
        setReportCardLoading(false);
      }
    };

    fetchReportCard();
  }, [studentId, academicYear, term, getReportCard]);

  // Full result history (every term/year on record) for cumulative performance.
  useEffect(() => {
    const fetchAllTimeResults = async () => {
      if (!studentId || isNaN(parseInt(studentId))) return;
      try {
        const data = await getResultsByStudent(parseInt(studentId));
        setAllTimeResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch result history:", error);
        setAllTimeResults([]);
      }
    };

    fetchAllTimeResults();
  }, [studentId, getResultsByStudent]);

  // Cumulative performance: average overall score per academic year/term.
  const cumulativePerformance = Object.values(
    allTimeResults.reduce((acc, result) => {
      const key = `${result.academicYear}-${result.term}`;
      if (!acc[key]) {
        acc[key] = {
          period: `${result.academicYear} ${result.term}`,
          academicYear: result.academicYear,
          term: result.term,
          totalScore: 0,
          count: 0,
        };
      }
      acc[key].totalScore += result.overallScore || 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { period: string; academicYear: string; term: string; totalScore: number; count: number }>)
  )
    .map((entry) => ({
      period: entry.period,
      average: entry.count > 0 ? entry.totalScore / entry.count : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

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
            (attendance.filter((a) => a?.status === "PRESENT").length /
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
          value: attendance.filter((a) => a?.status === "PRESENT").length,
          color: "#10B981",
        },
        {
          name: "Absent",
          value: attendance.filter((a) => a?.status === "ABSENT").length,
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

  if (!student?.user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {!student ? "Student not found" : "Student data incomplete"}
        </p>
        <Button asChild className="mt-4">
          <Link href="/portal/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="print:hidden">
        <DynamicHeader
          profileImg={student?.user?.photo ?? ""}
          name={`${student?.user.firstname ?? "Unknown"} ${
            student?.user?.lastname ?? "Student"
          }`}
          title={`${student?.user.firstname ?? "Unknown"} ${
            student?.user?.lastname ?? "Student"
          }`}
          subtitle={"Student Profile"}
          endBtns={
            <Button
              onClick={() => router.push(`${studentId}/edit`)}
              variant="default"
            >
              Edit Profile
            </Button>
          }
        />
      </div>

      {/* Quick Stats */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="border-b print:hidden">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "academics", label: "Academic Performance" },
            { id: "attendance", label: "Attendance" },
            { id: "grades", label: "Report Card" },
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
                  <p className="text-sm">{`${
                    student?.user.firstname ?? "Unknown"
                  } ${student?.user?.lastname ?? "Student"}`}</p>
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
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Parent
                  </label>
                  {student?.parents?.map((parent, index) => (
                    <div key={index}>
                      <p className="text-sm">
                        {parent?.parent?.user?.firstname +
                          " " +
                          parent?.parent.user?.lastname || "Not assigned"}
                      </p>
                    </div>
                  ))}
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
                      <p className="font-medium">Attendance Record</p>
                      <p className="text-sm text-muted-foreground">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === "PRESENT"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status === "PRESENT" ? "Present" : "Absent"}
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
        <div className="space-y-6">
          {/* Academic period + print */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Academic Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
                <SelectField
                  label="Academic Year"
                  value={academicYear}
                  onValueChange={(value: string) => setAcademicYear(value)}
                >
                  {generateAcademicYears(2023, 5).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectField>
                <SelectField
                  label="Term"
                  value={term}
                  onValueChange={(value: string) =>
                    setTerm(value as "FIRST" | "SECOND" | "THIRD")
                  }
                >
                  {[
                    { value: "FIRST", label: "First Term" },
                    { value: "SECOND", label: "Second Term" },
                    { value: "THIRD", label: "Third Term" },
                  ].map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectField>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setPrintDialogOpen(true)}
                  disabled={!reportCard || reportCard.results.length === 0}
                >
                  <Printer className="h-4 w-4" />
                  Print Report Card
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fee prompt shown before printing this student's report card */}
          <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Print Report Card</DialogTitle>
                <DialogDescription>
                  These values appear in the FEES section of the printed report.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  id="next-term-fee"
                  type="text"
                  inputMode="decimal"
                  label="Next term's fee (₦)"
                  placeholder="e.g. 33,000.00"
                  value={nextTermFee}
                  onChange={(e) =>
                    setNextTermFee(formatFeeInput(e.target.value))
                  }
                />
                <InputField
                  id="next-term-date"
                  type="date"
                  label="Next term commences"
                  value={nextTermDate}
                  onChange={(e) => setNextTermDate(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPrintDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={handlePrintReport}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {reportCardLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : !reportCard || reportCard.results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No results available for {academicYear} - {term} Term.
              </CardContent>
            </Card>
          ) : (
            <ReportCardSheet
              student={student}
              reportCard={reportCard}
              academicYear={academicYear}
              term={term}
              nextTermFee={formatNaira(nextTermFee)}
              nextTermBegins={formatTermDate(nextTermDate)}
            />
          )}

          {/* Cumulative Performance across every term/year on record */}
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Cumulative Performance</CardTitle>
              <p className="text-sm text-muted-foreground">
                Average score across every term on record
              </p>
            </CardHeader>
            <CardContent>
              {cumulativePerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={cumulativePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No historical results available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
