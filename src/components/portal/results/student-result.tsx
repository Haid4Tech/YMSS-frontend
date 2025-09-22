"use client";

import { useAtom } from "jotai";
import { useEffect, useState, useTransition } from "react";
import { usersAPI } from "@/jotai/users/user";
import { userAtom } from "@/jotai/auth/auth";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { gradesAPI } from "@/jotai/grades/grades";
import { UserManagement } from "@/jotai/users/user-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Award, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Grade } from "@/jotai/grades/grades-types";
import { SelectItem } from "@/components/ui/select";

import { SelectField } from "@/components/ui/form-field";
import { generateAcademicYears } from "@/common/helper";

const StudentResult = () => {
  const [user] = useAtom(userAtom);
  const userId = user?.id;
  const [isPending, startTransition] = useTransition();

  const [studentData, setStudentData] = useState<UserManagement | null>(null);
  const [results, setResults] = useState<Grade[]>([]);
  const [studentResults, setStudentResults] = useState<Grade[]>([]);
  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");

  const [, getUserById] = useAtom(usersAPI.getById);
  const [, getAllResults] = useAtom(gradesAPI.getAllResults);

  useEffect(() => {
    startTransition(async function () {
      if (userId) {
        const [studentData, resultsData] = await Promise.all([
          getUserById(userId),
          getAllResults(),
        ]);
        if (studentData) {
          setStudentData(studentData as UserManagement);
        }

        setResults(Array.isArray(resultsData) ? resultsData : []);
      }
    });
  }, [userId]);

  // Filter results for this student
  useEffect(() => {
    if (results && studentData) {
      const studentGrades = results.filter(
        (result: Grade) =>
          result.studentId === studentData?.student?.id &&
          result.academicYear === academicYear &&
          result.term === term
      );
      setStudentResults(studentGrades);
    }
  }, [results, studentData, academicYear, term]);

  // Calculate overall statistics
  const overallStats = {
    totalSubjects: new Set(studentResults.map((result) => result.subjectId))
      .size,
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

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <div className="w-full text-left">
            <span>
              {`${result.subjectPosition}${getOrdinalSuffix(
                result.subjectPosition
              )}`}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
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
                {user?.firstname} {user?.lastname}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-medium">{studentData?.student?.class?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <SelectField
                label={"Academic Year"}
                value={academicYear}
                onValueChange={(value: string) => setAcademicYear(value)}
              >
                {generateAcademicYears(2023, 5).map((year, index) => (
                  <SelectItem key={index} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            <div>
              <SelectField
                label={"Term"}
                value={term}
                onValueChange={(value: string) =>
                  setTerm(value as "FIRST" | "SECOND" | "THIRD")
                }
              >
                {[
                  {
                    value: "FIRST",
                    label: "First Term",
                  },
                  {
                    value: "SECOND",
                    label: "Second Term",
                  },
                  {
                    value: "THIRD",
                    label: "Third Term",
                  },
                ].map((term, index) => (
                  <SelectItem key={index} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectField>
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

      {/* All Results in One Table */}
      {studentResults.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Subject Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              {studentResults.length} result(s) for {academicYear} - {term} Term
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={studentResults}
              enableGlobalSearch={true}
              searchKey="subject.name"
              searchPlaceholder="Search subjects..."
            />
          </CardContent>
        </Card>
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
};

export { StudentResult };
