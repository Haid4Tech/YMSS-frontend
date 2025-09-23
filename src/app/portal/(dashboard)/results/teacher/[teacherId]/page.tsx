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
// import { subjectsAPI } from "@/jotai/subject/subject";
import {
  // isParentAtom,
  // isStudentAtom,
  isTeacherAtom,
  isAdminAtom,
  userAtom,
} from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, TrendingUp, Award, Users, BarChart3 } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { Student } from "@/jotai/students/student-types";
import { Grade } from "@/jotai/grades/grades-types";
import { Subject } from "@/jotai/subject/subject-types";
import { PageHeader } from "@/components/general/page-header";
import { SelectItem } from "@/components/ui/select";
import { SelectField } from "@/components/ui/form-field";
// import { toast } from "sonner";

export default function TeacherResultsPage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = Number(params.teacherId);

  // const [teacher, setTeacher] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");

  // Role-based access control
  const [isTeacher] = useAtom(isTeacherAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const [user] = useAtom(userAtom);

  const [results] = useAtom(gradeListAtom);
  const [loading] = useAtom(gradeLoadingAtom);
  const [error] = useAtom(gradeErrorAtom);
  const [, getAllResults] = useAtom(gradesAPI.getAllResults);

  const [studentsData] = useAtom(studentListAtom);
  const [studentLoading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);

  // Access control
  const canViewResults = isTeacher || isAdmin;

  // Get teacher's assigned subjects
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      try {
        // Get all subjects and filter by teacher assignment
        const allSubjects = await getAllStudents();

        setSubjects(Array.isArray(allSubjects) ? allSubjects : []);
      } catch (error) {
        console.error("Error fetching teacher subjects:", error);
      }
    };

    if (canViewResults && user) {
      fetchTeacherSubjects();
    }
  }, [canViewResults, user]);

  // Load data
  useEffect(() => {
    if (canViewResults) {
      getAllResults();
      getAllStudents();
    }
  }, [canViewResults]);

  // Set students data
  useEffect(() => {
    if (studentsData?.students) {
      setStudents(studentsData.students);
    }
  }, [studentsData]);

  // Filter results for this teacher's subjects
  const teacherResults =
    results?.filter((result) => {
      const isAssignedSubject = subjects.some(
        (subject) => subject.id === result.subjectId
      );
      return (
        isAssignedSubject &&
        result.academicYear === academicYear &&
        result.term === term &&
        (!selectedSubject || result.subjectId === Number(selectedSubject))
      );
    }) || [];

  // Get selected subject data
  // const selectedSubjectData = selectedSubject
  //   ? subjects.find((s) => s.id.toString() === selectedSubject)
  //   : null;

  // Group results by subject
  const resultsBySubject = teacherResults.reduce((acc, result) => {
    const subjectName = result.subject?.name || "Unknown Subject";
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(result);
    return acc;
  }, {} as Record<string, Grade[]>);

  // Calculate overall statistics
  const overallStats = {
    totalSubjects: subjects.length,
    assignedSubjects: subjects.length,
    totalResults: teacherResults.length,
    averageScore:
      teacherResults.length > 0
        ? teacherResults.reduce(
            (sum, result) => sum + (result.overallScore || 0),
            0
          ) / teacherResults.length
        : 0,
    passRate:
      teacherResults.length > 0
        ? (teacherResults.filter((result) => (result.overallScore || 0) >= 50)
            .length /
            teacherResults.length) *
          100
        : 0,
    studentsTaught: new Set(teacherResults.map((result) => result.studentId))
      .size,
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

  // Check if teacher is viewing their own results
  if (isTeacher && user && teacherId !== user.id) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Access denied. You can only view your own teaching results.
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
      accessorKey: "student",
      header: "Student",
      cell: ({ row }) => {
        const result = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium">
                {result.student?.user?.firstname}{" "}
                {result.student?.user?.lastname}
              </p>
              <p className="text-sm text-gray-500">
                {result.student?.user?.email}
              </p>
            </div>
          </div>
        );
      },
    },
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
      <PageHeader
        title={"Results Dashboard"}
        subtitle={"View and manage results for subjects you teach"}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filter Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SelectField
                label="Academic Year"
                value={academicYear}
                onValueChange={(value) => setAcademicYear(value)}
                placeholder="Select academic year"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const currentYear = new Date().getFullYear();
                  const yearStart = currentYear + i;
                  const yearEnd = yearStart + 1;
                  return (
                    <SelectItem
                      key={yearStart}
                      value={`${yearStart}-${yearEnd}`}
                    >
                      {yearStart}/{yearEnd}
                    </SelectItem>
                  );
                })}
              </SelectField>
            </div>
            <div>
              <SelectField
                label="Term"
                value={term}
                onValueChange={(value: string) =>
                  setTerm(value as "FIRST" | "SECOND" | "THIRD")
                }
              >
                {["FIRST", "SECOND", "THIRD"].map((term, index) => (
                  <SelectItem key={index} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            <div>
              <SelectField
                label="Subject (Optional)"
                placeholder="All subjects"
                value={selectedSubject || ""}
                onValueChange={(value) => setSelectedSubject(value || null)}
              >
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold">
                  {overallStats.assignedSubjects}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold">
                  {overallStats.studentsTaught}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Average Score
                </p>
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
              <Award className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {overallStats.passRate.toFixed(1)}%
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
                    enableGlobalSearch={true}
                    searchKey="student.user.firstname"
                    searchPlaceholder="Search students..."
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
              {subjects.length === 0
                ? "No Subjects Assigned"
                : "No Results Found"}
            </h3>
            <p className="text-gray-500">
              {subjects.length === 0
                ? "You are not assigned to teach any subjects. Contact your administrator for subject assignments."
                : `No results available for ${academicYear} - ${term} Term.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
