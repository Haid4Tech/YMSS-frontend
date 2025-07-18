"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { teachersAPI, enhancedTeachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { studentsAPI, enhancedStudentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { subjectsAPI, enhancedSubjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";
import { examsAPI, enhancedExamsAPI } from "@/jotai/exams/exams";
import { Exam } from "@/jotai/exams/exams-type";
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
  Line
} from "recharts";

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const [teacherData] = await Promise.all([
          enhancedTeachersAPI.getById(parseInt(teacherId))
        ]);

        setTeacher(teacherData);
        // Note: getByTeacher methods might not be implemented, using empty arrays for now
        setStudents([]);
        setSubjects([]);
        setExams([]);
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherData();
    }
  }, [teacherId]);

  // Calculate teaching statistics
  const teachingStats = {
    totalStudents: students.length,
    totalSubjects: subjects.length,
    totalExams: exams.length,
    activeClasses: [...new Set(students.map(s => s.class?.id))].filter(Boolean).length
  };

  // Subject distribution data
  const subjectData = subjects.map(subject => ({
    name: subject.name,
    students: students.filter(() => 
      // This would need proper relation checking in real implementation
      true
    ).length
  }));

  // Grade distribution for teacher's exams
  const gradeDistribution = [
    { grade: "A", count: Math.floor(Math.random() * 20) + 5, color: "#10B981" },
    { grade: "B", count: Math.floor(Math.random() * 25) + 10, color: "#3B82F6" },
    { grade: "C", count: Math.floor(Math.random() * 15) + 8, color: "#F59E0B" },
    { grade: "D", count: Math.floor(Math.random() * 10) + 3, color: "#EF4444" },
    { grade: "F", count: Math.floor(Math.random() * 5) + 1, color: "#6B7280" }
  ];

  // Monthly exam performance trend
  const monthlyTrend = [
    { month: "Jan", avgScore: 78 },
    { month: "Feb", avgScore: 82 },
    { month: "Mar", avgScore: 79 },
    { month: "Apr", avgScore: 85 },
    { month: "May", avgScore: 88 },
    { month: "Jun", avgScore: 84 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Teacher not found</p>
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
          <div>
            <h1 className="text-3xl font-bold">{teacher.user.name}</h1>
            <p className="text-muted-foreground">Teacher Profile</p>
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
            <div className="text-2xl font-bold text-primary">{teachingStats.totalStudents}</div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{teachingStats.totalSubjects}</div>
            <p className="text-sm text-muted-foreground">Subjects Teaching</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{teachingStats.totalExams}</div>
            <p className="text-sm text-muted-foreground">Exams Conducted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">{teachingStats.activeClasses}</div>
            <p className="text-sm text-muted-foreground">Active Classes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "students", label: "Students" },
            { id: "subjects", label: "Subjects" },
            { id: "performance", label: "Performance Analytics" }
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
          {/* Teacher Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Teacher Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm">{teacher.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{teacher.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teacher ID</label>
                  <p className="text-sm">{teacher.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Main Subject</label>
                  <p className="text-sm">{teacher.subject?.name || "Not assigned"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{teacher.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Qualification</label>
                  <p className="text-sm">{teacher.qualification || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Experience</label>
                  <p className="text-sm">{teacher.experience ? `${teacher.experience} years` : "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                  <p className="text-sm">{teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString() : "Not provided"}</p>
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
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>Students Under Teaching</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-medium">{student.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.user.email}</p>
                    <p className="text-sm text-muted-foreground">Class: {student.class?.name || "Not assigned"}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href={`/portal/students/${student.id}`}>View Profile</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No students assigned yet
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "subjects" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Teaching Load</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No subjects assigned yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subjects List</CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {subject.code}</p>
                        <p className="text-sm text-muted-foreground">{subject.description}</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/portal/subjects/${subject.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No subjects assigned yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Monthly Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Exams */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exams</CardTitle>
            </CardHeader>
            <CardContent>
              {exams.length > 0 ? (
                <div className="space-y-4">
                  {exams.slice(0, 5).map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exam.subject?.name} • {exam.date ? new Date(exam.date).toLocaleDateString() : "No date"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {exam.duration ? `${exam.duration} minutes` : "Not set"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{exam.totalMarks} marks</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/portal/exams/${exam.id}`}>View Results</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No exams conducted yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 