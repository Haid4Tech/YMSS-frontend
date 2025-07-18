"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { subjectsAPI, enhancedSubjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";
import { gradesAPI, enhancedGradesAPI } from "@/jotai/grades/grades";
import { Grade } from "@/jotai/grades/grades-types";
import { examsAPI, enhancedExamsAPI } from "@/jotai/exams/exams";
import { Exam } from "@/jotai/exams/exams-type";
import { studentsAPI, enhancedStudentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
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
  Area,
  AreaChart
} from "recharts";

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.id as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const [subjectData, gradesData, examsData, studentsData] = await Promise.all([
          subjectsAPI.getById(parseInt(subjectId)),
          gradesAPI.getBySubject(parseInt(subjectId)),
          examsAPI.getBySubject(parseInt(subjectId)),
          studentsAPI.getBySubject(parseInt(subjectId))
        ]);

        setSubject(subjectData);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setExams(Array.isArray(examsData) ? examsData : []);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (error) {
        console.error("Failed to fetch subject data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchSubjectData();
    }
  }, [subjectId]);

  // Calculate subject statistics
  const subjectStats = {
    totalStudents: students.length,
    totalExams: exams.length,
    averageScore: grades.length > 0 
      ? (grades.reduce((sum, grade) => sum + (grade.marks || 0), 0) / grades.length).toFixed(1)
      : "N/A",
    passRate: grades.length > 0 
      ? ((grades.filter(g => (g.marks || 0) >= 60).length / grades.length) * 100).toFixed(1)
      : "N/A"
  };

  // Grade distribution
  const gradeDistribution = grades.reduce((acc, grade) => {
    const gradeKey = grade.grade || 'Ungraded';
    acc[gradeKey] = (acc[gradeKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gradeChartData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    grade,
    count,
    percentage: ((count / grades.length) * 100).toFixed(1),
    color: grade === 'A' ? '#10B981' : 
           grade === 'B' ? '#3B82F6' : 
           grade === 'C' ? '#F59E0B' : 
           grade === 'D' ? '#EF4444' : '#6B7280'
  }));

  // Performance trend over exams
  const examTrend = exams
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
    .map(exam => {
      const examGrades = grades.filter(g => g.examId === exam.id);
      const averageScore = examGrades.length > 0 
        ? examGrades.reduce((sum, g) => sum + (g.marks || 0), 0) / examGrades.length
        : 0;
      return {
        exam: exam.title,
        date: exam.date ? new Date(exam.date).toLocaleDateString() : 'No date',
        averageScore: averageScore.toFixed(1),
        totalStudents: examGrades.length
      };
    });

  // Score distribution ranges
  const scoreRanges = [
    { range: "90-100", count: grades.filter(g => (g.marks || 0) >= 90).length, color: "#10B981" },
    { range: "80-89", count: grades.filter(g => (g.marks || 0) >= 80 && (g.marks || 0) < 90).length, color: "#3B82F6" },
    { range: "70-79", count: grades.filter(g => (g.marks || 0) >= 70 && (g.marks || 0) < 80).length, color: "#F59E0B" },
    { range: "60-69", count: grades.filter(g => (g.marks || 0) >= 60 && (g.marks || 0) < 70).length, color: "#EF4444" },
    { range: "Below 60", count: grades.filter(g => (g.marks || 0) < 60).length, color: "#6B7280" }
  ];

  // Top performers
  const topPerformers = students
    .map(student => {
      const studentGrades = grades.filter(g => g.studentId === student.id);
      const avgScore = studentGrades.length > 0 
        ? studentGrades.reduce((sum, g) => sum + (g.marks || 0), 0) / studentGrades.length
        : 0;
      return { student, avgScore, gradeCount: studentGrades.length };
    })
    .filter(item => item.gradeCount > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/subjects">← Back</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{subject.name}</h1>
            <p className="text-muted-foreground">Subject Analytics & Performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Subject</Button>
          <Button>Schedule Exam</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">{subjectStats.totalStudents}</div>
            <p className="text-sm text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{subjectStats.totalExams}</div>
            <p className="text-sm text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{subjectStats.averageScore}</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">{subjectStats.passRate}%</div>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "performance", label: "Performance Analytics" },
            { id: "exams", label: "Exams & Assessments" },
            { id: "students", label: "Student Performance" }
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
          {/* Subject Information */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject Name</label>
                  <p className="text-sm">{subject.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject Code</label>
                  <p className="text-sm">{subject.code || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{subject.description || "No description provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned Teacher</label>
                  <p className="text-sm">{subject.teacher?.user?.name || "Not assigned"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credits</label>
                  <p className="text-sm">{subject.credits || "Not specified"}</p>
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
                      label={({ grade, percentage }) => `${grade}: ${percentage}%`}
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

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {examTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={examTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exam" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="averageScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No performance trend data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution Ranges</CardTitle>
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
        </div>
      )}

      {activeTab === "exams" && (
        <Card>
          <CardHeader>
            <CardTitle>Exams & Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const examGrades = grades.filter(g => g.examId === exam.id);
                  const avgScore = examGrades.length > 0 
                    ? (examGrades.reduce((sum, g) => sum + (g.marks || 0), 0) / examGrades.length).toFixed(1)
                    : "N/A";
                  
                  return (
                    <div key={exam.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-lg">{exam.title}</h3>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/portal/exams/${exam.id}`}>View Details</Link>
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Date:</span>
                          <p>{exam.date ? new Date(exam.date).toLocaleDateString() : "Not scheduled"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Duration:</span>
                          <p>{exam.duration ? `${exam.duration} minutes` : "Not set"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Total Marks:</span>
                          <p>{exam.totalMarks || "Not set"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Average Score:</span>
                          <p className="font-bold">{avgScore}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No exams scheduled for this subject yet
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map(({ student, avgScore }, index) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{student.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Class: {student.class?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{avgScore.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link href={`/portal/students/${student.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No student performance data available
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 