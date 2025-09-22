"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useParams, useRouter } from "next/navigation";
import {
  gradesAPI,
  gradeListAtom,
  gradeLoadingAtom,
  gradeErrorAtom,
} from "@/jotai/grades/grades";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { isStudentAtom, isAdminAtom, userAtom } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Award,
  User,
  Calendar,
} from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { Student } from "@/jotai/students/student-types";
import { Grade } from "@/jotai/grades/grades-types";
// import { toast } from "sonner";
// import { PageHeader } from "@/components/general/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = Number(params.studentId);

  const [student, setStudent] = useState<Student | null>(null);
  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");

  // Role-based access control
  const [isStudent] = useAtom(isStudentAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const [user] = useAtom(userAtom);

  const [results] = useAtom(gradeListAtom);
  const [loading] = useAtom(gradeLoadingAtom);
  const [error] = useAtom(gradeErrorAtom);
  const [, getAllResults] = useAtom(gradesAPI.getAllResults);

  const [students] = useAtom(studentListAtom);
  const [studentLoading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);

  // Access control
  const canViewResults = isStudent || isAdmin;

  // Get student information
  useEffect(() => {
    if (students?.students) {
      const studentData = students.students.find((s) => s.id === studentId);
      setStudent(studentData || null);
    }
  }, [students, studentId]);

  // Load data
  useEffect(() => {
    if (canViewResults) {
      getAllResults();
      getAllStudents();
    }
  }, [canViewResults]);

  // Filter results for this student
  const studentResults =
    results?.filter(
      (result) =>
        result.studentId === studentId &&
        result.academicYear === academicYear &&
        result.term === term
    ) || [];

  // Group results by subject
  const resultsBySubject = studentResults.reduce((acc, result) => {
    const subjectName = result.subject?.name || "Unknown Subject";
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(result);
    return acc;
  }, {} as Record<string, Grade[]>);

  // Calculate overall statistics
  const overallStats = {
    totalSubjects: Object.keys(resultsBySubject).length,
    averageScore:
      studentResults.length > 0
        ? studentResults.reduce(
            (sum, result) => sum + (result.overallScore || 0),
            0
          ) / studentResults.length
        : 0,
    totalResults: studentResults.length,
    passRate:
      studentResults.length > 0
        ? (studentResults.filter((result) => (result.overallScore || 0) >= 50)
            .length /
            studentResults.length) *
          100
        : 0,
    highestScore:
      studentResults.length > 0
        ? Math.max(...studentResults.map((result) => result.overallScore || 0))
        : 0,
    lowestScore:
      studentResults.length > 0
        ? Math.min(...studentResults.map((result) => result.overallScore || 0))
        : 0,
  };

  // Access control check
  if (!canViewResults) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Access denied. You don&apos;t have permission to view results.
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Check if student is viewing their own results
  if (isStudent && user && student?.userId !== user.id) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Access denied. You can only view your own results.
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (loading || studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{extractErrorMessage(error)}</p>
        <Button onClick={() => getAllResults()}>Retry</Button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Student not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Table columns for results
  const columns: ColumnDef<Grade>[] = [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <div>
            <p className="font-medium">{result.subject?.name}</p>
            <p className="text-sm text-gray-500">{result.subject?.code}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "ca1",
      header: "CA1",
      cell: ({ row }) => {
        const result = row.original;
        return <span>{result.ca1 ? result.ca1.toFixed(1) : "-"}</span>;
      },
    },
    {
      accessorKey: "ca2",
      header: "CA2",
      cell: ({ row }) => {
        const result = row.original;
        return <span>{result.ca2 ? result.ca2.toFixed(1) : "-"}</span>;
      },
    },
    {
      accessorKey: "examScore",
      header: "Exam",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <span>{result.examScore ? result.examScore.toFixed(1) : "-"}</span>
        );
      },
    },
    {
      accessorKey: "ltc",
      header: "LTC",
      cell: ({ row }) => {
        const result = row.original;
        return <span>{result.ltc ? result.ltc.toFixed(1) : "-"}</span>;
      },
    },
    {
      accessorKey: "overallScore",
      header: "Overall",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <span className="font-semibold">
            {result.overallScore ? result.overallScore.toFixed(1) + "%" : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => {
        const result = row.original;
        return result.grade ? (
          <Badge className={cn(getGradeColor(result.grade))}>
            {result.grade}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "subjectPosition",
      header: "Position",
      cell: ({ row }) => {
        const result = row.original;
        return result.subjectPosition ? (
          <span>
            {`${result.subjectPosition}${getOrdinalSuffix(
              result.subjectPosition
            )}`}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Academic Results</h1>
            <p className="text-muted-foreground">
              {student.user?.firstname} {student.user?.lastname} -{" "}
              {student.class?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Term Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="e.g., 2024/2025"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Term</label>
              <Select
                value={term}
                onValueChange={(value: "FIRST" | "SECOND" | "THIRD") =>
                  setTerm(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Term</SelectItem>
                  <SelectItem value="SECOND">Second Term</SelectItem>
                  <SelectItem value="THIRD">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Student Name</p>
              <p className="font-medium">
                {student.user?.firstname} {student.user?.lastname}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-medium">{student.class?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{student.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold">
                  {overallStats.totalSubjects}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average</p>
                <p className="text-2xl font-bold">
                  {overallStats.averageScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {overallStats.passRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest</p>
                <p className="text-2xl font-bold">
                  {overallStats.highestScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lowest</p>
                <p className="text-2xl font-bold">
                  {overallStats.lowestScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results by Subject */}
      {Object.keys(resultsBySubject).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(resultsBySubject).map(
            ([subjectName, subjectResults]) => (
              <Card key={subjectName}>
                <CardHeader>
                  <CardTitle>{subjectName} Results</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {subjectResults.length} result(s) for this subject
                  </p>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={subjectResults}
                    enableGlobalSearch={false}
                  />
                </CardContent>
              </Card>
            )
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500">
              No results available for {academicYear} - {term} Term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
