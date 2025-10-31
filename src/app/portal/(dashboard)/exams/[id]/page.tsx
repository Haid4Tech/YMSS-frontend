"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAtom } from "jotai";
import { Exam } from "@/jotai/exams/exams-type";
import { examsAPI } from "@/jotai/exams/exams";
import { Grade } from "@/jotai/grades/grades-types";
import { gradesAPI } from "@/jotai/grades/grades";
import { Student } from "@/jotai/students/student-types";
import { studentsAPI } from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageHeader } from "@/components/general/page-header";

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.id as string;
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [, getByExam] = useAtom(gradesAPI.getByExam);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const [examData, gradesData] = await Promise.all([
          examsAPI.getById(parseInt(examId)),
          getByExam(parseInt(examId)),
        ]);

        setExam(examData);
        setGrades(Array.isArray(gradesData) ? gradesData : []);

        // Get student details for each grade
        if (gradesData && Array.isArray(gradesData)) {
          const studentIds = [...new Set(gradesData.map((g) => g.studentId))];
          const studentsData = await Promise.all(
            studentIds.map((id) => studentsAPI.getById(id).catch(() => null))
          );
          setStudents(studentsData.filter(Boolean) as Student[]);
        }
      } catch (error) {
        console.error("Failed to fetch exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  // Calculate exam statistics
  const examStats = {
    totalStudents: grades.length,
    averageScore:
      grades.length > 0
        ? (
            grades.reduce((sum, grade) => sum + (grade.overallScore || grade.value || 0), 0) /
            grades.length
          ).toFixed(1)
        : "N/A",
    highestScore:
      grades.length > 0 ? Math.max(...grades.map((g) => g.overallScore || g.value || 0)) : "N/A",
    lowestScore:
      grades.length > 0 ? Math.min(...grades.map((g) => g.overallScore || g.value || 0)) : "N/A",
    passRate:
      grades.length > 0
        ? (
            (grades.filter((g) => (g.overallScore || g.value || 0) >= 100 * 0.6).length /
              grades.length) *
            100
          ).toFixed(1)
        : "N/A",
    median:
      grades.length > 0
        ? (() => {
            const sorted = grades
              .map((g) => g.overallScore || g.value || 0)
              .sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 0
              ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
              : sorted[mid].toFixed(1);
          })()
        : "N/A",
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
      percentage: ((count / grades.length) * 100).toFixed(1),
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

  // Score distribution in ranges
  const totalMarks = 100;
  const scoreRanges = [
    {
      range: `${Math.floor(totalMarks * 0.9)}-${totalMarks}`,
      count: grades.filter((g) => (g.overallScore || g.value || 0) >= totalMarks * 0.9).length,
      color: "#10B981",
    },
    {
      range: `${Math.floor(totalMarks * 0.8)}-${
        Math.floor(totalMarks * 0.9) - 1
      }`,
      count: grades.filter(
        (g) =>
          (g.overallScore || g.value || 0) >= totalMarks * 0.8 &&
          (g.overallScore || g.value || 0) < totalMarks * 0.9
      ).length,
      color: "#3B82F6",
    },
    {
      range: `${Math.floor(totalMarks * 0.7)}-${
        Math.floor(totalMarks * 0.8) - 1
      }`,
      count: grades.filter(
        (g) =>
          (g.overallScore || g.value || 0) >= totalMarks * 0.7 &&
          (g.overallScore || g.value || 0) < totalMarks * 0.8
      ).length,
      color: "#F59E0B",
    },
    {
      range: `${Math.floor(totalMarks * 0.6)}-${
        Math.floor(totalMarks * 0.7) - 1
      }`,
      count: grades.filter(
        (g) =>
          (g.overallScore || g.value || 0) >= totalMarks * 0.6 &&
          (g.overallScore || g.value || 0) < totalMarks * 0.7
      ).length,
      color: "#EF4444",
    },
    {
      range: `0-${Math.floor(totalMarks * 0.6) - 1}`,
      count: grades.filter((g) => (g.overallScore || g.value || 0) < totalMarks * 0.6).length,
      color: "#6B7280",
    },
  ];

  // Performance ranking
  const rankedResults = grades
    .map((grade) => {
      const student = students.find((s) => s.id === grade.studentId);
      return {
        grade,
        student,
      };
    })
    .filter((item) => item.student)
    .sort((a, b) => (b.grade.overallScore || b.grade.value || 0) - (a.grade.overallScore || a.grade.value || 0));

  // Statistical insights
  const standardDeviation =
    grades.length > 0
      ? (() => {
          const mean = parseFloat(examStats.averageScore);
          const variance =
            grades.reduce((sum, grade) => {
              return sum + Math.pow((grade.overallScore || grade.value || 0) - mean, 2);
            }, 0) / grades.length;
          return Math.sqrt(variance).toFixed(2);
        })()
      : "N/A";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Exam not found</p>
        <Button asChild className="mt-4">
          <Link href="/portal/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={exam.title}
        subtitle={"Exam Results & Analytics"}
        endBtns={
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`${examId}/edit`)}
              variant="outline"
            >
              Edit Exam
            </Button>
            <Button>Download Report</Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">
              {examStats.totalStudents}
            </div>
            <p className="text-sm text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {examStats.averageScore}
            </div>
            <p className="text-sm text-muted-foreground">Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {examStats.highestScore}
            </div>
            <p className="text-sm text-muted-foreground">Highest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {examStats.lowestScore}
            </div>
            <p className="text-sm text-muted-foreground">Lowest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">
              {examStats.passRate}%
            </div>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">
              {examStats.median}
            </div>
            <p className="text-sm text-muted-foreground">Median</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "analytics", label: "Performance Analytics" },
            { id: "results", label: "Individual Results" },
            // { id: "insights", label: "Statistical Insights" },
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
          {/* Exam Information */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Exam Title
                  </label>
                  <p className="text-sm">{exam.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Subject
                  </label>
                  <p className="text-sm">
                    {exam.subject?.name || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date
                  </label>
                  <p className="text-sm">
                    {exam.date
                      ? new Date(exam.date).toLocaleDateString()
                      : "Not scheduled"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </label>
                  <p className="text-sm">
                    {exam.duration ? `${exam.duration} minutes` : "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Total Marks
                  </label>
                  <p className="text-sm">{100}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Instructions
                  </label>
                  <p className="text-sm">
                    {exam.instructions || "No instructions provided"}
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
                      label={({ grade, percentage }) =>
                        `${grade}: ${percentage}%`
                      }
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

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution by Ranges</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Excellent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {
                    grades.filter((g) => (g.overallScore || g.value || 0) >= totalMarks * 0.9)
                      .length
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  Students scored 90%+
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Good Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {
                    grades.filter(
                      (g) =>
                        (g.overallScore || g.value || 0) >= totalMarks * 0.7 &&
                        (g.overallScore || g.value || 0) < totalMarks * 0.9
                    ).length
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  Students scored 70-89%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {
                    grades.filter((g) => (g.overallScore || g.value || 0) < totalMarks * 0.6)
                      .length
                  }
                </div>
                <p className="text-sm text-muted-foreground">
                  Students scored below 60%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Results (Ranked)</CardTitle>
          </CardHeader>
          <CardContent>
            {rankedResults.length > 0 ? (
              <div className="space-y-4">
                {rankedResults.map((result, index) => (
                  <div
                    key={result.grade.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-amber-600"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {`${result.student?.user.firstname ?? "Not"} ${
                            result?.student?.user?.lastname ?? "Available"
                          }`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {result.student?.user.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Class: {result.student?.class?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {result.grade.overallScore || result.grade.value}/{100}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          result.grade.grade === "A"
                            ? "text-green-600"
                            : result.grade.grade === "B"
                            ? "text-blue-600"
                            : result.grade.grade === "C"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        Grade: {result.grade.grade || "Ungraded"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No results available for this exam
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* Statistical Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Statistical Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {examStats.averageScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Mean Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {examStats.median}
                  </div>
                  <p className="text-sm text-muted-foreground">Median Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {standardDeviation}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Standard Deviation
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {examStats.passRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">
                    Class Performance
                  </h4>
                  <p className="text-sm text-blue-700">
                    {parseFloat(examStats.passRate) >= 80
                      ? "Excellent class performance! Most students have mastered the concepts."
                      : parseFloat(examStats.passRate) >= 60
                      ? "Good class performance with room for improvement in some areas."
                      : "Class needs additional support. Consider review sessions for key concepts."}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    Score Distribution
                  </h4>
                  <p className="text-sm text-green-700">
                    {parseFloat(standardDeviation) < 10
                      ? "Consistent performance across students with low variation in scores."
                      : parseFloat(standardDeviation) < 20
                      ? "Moderate variation in student performance."
                      : "High variation suggests diverse understanding levels among students."}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800">
                    Recommendations
                  </h4>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    <li>
                      Provide additional support for students who scored below
                      60%
                    </li>
                    <li>Consider enrichment activities for top performers</li>
                    <li>Review questions where most students struggled</li>
                    <li>
                      Adjust teaching methods based on performance patterns
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
