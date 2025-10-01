"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import { classesAPI } from "@/jotai/class/class";
import { studentsAPI } from "@/jotai/students/student";
import { subjectsAPI } from "@/jotai/subject/subject";
import { attendanceAPI } from "@/jotai/attendance/attendance";
import { gradesAPI } from "@/jotai/grades/grades";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/general/page-header";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Class } from "@/jotai/class/class-type";
import { Subject } from "@/jotai/subject/subject-types";
import { Download, Printer, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface StudentRecordRow {
  studentId: number;
  studentName: string;
  studentNumber: string;
  [key: string]: string | number; // Dynamic subject scores
  attendancePercentage: number;
  totalScore: number;
  averageScore: number;
}

export default function ClassRecordsPage() {
  const params = useParams<{ id: string }>();
  const classId = parseInt(params.id);

  const [classData, setClassData] = useState<Class | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<{ id: number; user?: { firstname?: string; lastname?: string } }[]>([]);
  const [tableData, setTableData] = useState<StudentRecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, getResultsByClass] = useAtom(gradesAPI.getResultsByClass);
  const [, getAllAttendanceAtom] = useAtom(attendanceAPI.getAll);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch class data
      const classResponse = await classesAPI.getById(classId);
      setClassData(classResponse);

      // Fetch related data
      const [studentsData, subjectsData, gradesData, attendanceData] =
        await Promise.allSettled([
          studentsAPI.getStudentsByClass(classId),
          subjectsAPI.getSubjectByClassID(classId),
          getResultsByClass(classId),
          getAllAttendanceAtom(),
        ]);

      const studentsResult =
        studentsData.status === "fulfilled" && Array.isArray(studentsData.value)
          ? studentsData.value
          : [];
      const subjectsResult =
        subjectsData.status === "fulfilled" && Array.isArray(subjectsData.value)
          ? subjectsData.value
          : [];
      const gradesResult =
        gradesData.status === "fulfilled" && Array.isArray(gradesData.value)
          ? gradesData.value
          : [];
      const attendanceResult =
        attendanceData.status === "fulfilled" &&
        Array.isArray(attendanceData.value)
          ? attendanceData.value
          : [];

      setStudents(studentsResult);
      setSubjects(subjectsResult);

      // Filter attendance for students in this class
      const classAttendance = attendanceResult.filter((record) =>
        studentsResult.some((student) => student.id === record.studentId)
      );

      // Build table data
      const tableRows: StudentRecordRow[] = studentsResult.map((student) => {
        const row: StudentRecordRow = {
          studentId: student.id,
          studentName: `${student.user?.firstname || ""} ${
            student.user?.lastname || ""
          }`.trim(),
          studentNumber: student.id.toString(),
          attendancePercentage: 0,
          totalScore: 0,
          averageScore: 0,
        };

        let totalScore = 0;
        let subjectCount = 0;

        // Add subject scores as columns
        subjectsResult.forEach((subject) => {
          const studentGrade = gradesResult.find(
            (grade) =>
              grade.studentId === student.id && grade.subjectId === subject.id
          );

          // Use totalScore if available, otherwise use overallScore or value
          const score =
            studentGrade?.totalScore ??
            studentGrade?.overallScore ??
            studentGrade?.value;

          if (typeof score === "number") {
            row[`subject_${subject.id}`] = score;
            totalScore += score;
            subjectCount++;
          } else {
            row[`subject_${subject.id}`] = "-";
          }
        });

        // Calculate totals
        row.totalScore = totalScore;
        row.averageScore =
          subjectCount > 0
            ? Math.round((totalScore / subjectCount) * 10) / 10
            : 0;

        // Calculate attendance
        const studentAttendance = classAttendance.filter(
          (record) => record.studentId === student.id
        );
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(
          (record) => record.status === "PRESENT"
        ).length;

        row.attendancePercentage =
          totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        return row;
      });

      setTableData(tableRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch class data");
      toast.error("Failed to load class records");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  const handlePrint = () => {
    window.print();
  };

  // Define columns dynamically based on subjects
  const columns: ColumnDef<StudentRecordRow>[] = useMemo(() => {
    const baseColumns: ColumnDef<StudentRecordRow>[] = [
      {
        accessorKey: "studentName",
        header: () => <div className="text-left">Student</div>,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.studentName}</div>
        ),
      },
      {
        accessorKey: "studentNumber",
        header: () => <div className="text-center">ID</div>,
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground text-center">
            {row.original.studentNumber}
          </div>
        ),
      },
    ];

    // Add dynamic subject columns
    const subjectColumns: ColumnDef<StudentRecordRow>[] = subjects.map(
      (subject) => ({
        accessorKey: `subject_${subject.id}`,
        header: () => <div className="text-center">{subject.name}</div>,
        cell: ({ row }) => {
          const score = row.original[`subject_${subject.id}`];
          const isNumber = typeof score === "number";
          const scoreValue = isNumber ? (score as number) : 0;
          const colorClass = isNumber
            ? scoreValue >= 70
              ? "text-green-600 font-semibold"
              : scoreValue >= 50
              ? "text-yellow-600 font-semibold"
              : scoreValue > 0
              ? "text-red-600 font-semibold"
              : "text-gray-400"
            : "text-gray-400";

          return <div className={`text-center ${colorClass}`}>{score}</div>;
        },
      })
    );

    const summaryColumns: ColumnDef<StudentRecordRow>[] = [
      {
        accessorKey: "totalScore",
        header: () => <div className="text-center">Total</div>,
        cell: ({ row }) => (
          <div className="text-center font-bold bg-blue-50 p-2 rounded">
            {row.original.totalScore}
          </div>
        ),
      },
      {
        accessorKey: "averageScore",
        header: () => <div className="text-center">Average</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1 font-bold bg-blue-50 p-2 rounded">
            {row.original.averageScore}
            {row.original.averageScore >= 70 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : row.original.averageScore >= 50 ? (
              <span className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "attendancePercentage",
        header: () => <div className="text-center">Attendance %</div>,
        cell: ({ row }) => {
          const percentage = row.original.attendancePercentage;
          const colorClass =
            percentage >= 80
              ? "text-green-600"
              : percentage >= 60
              ? "text-yellow-600"
              : "text-red-600";

          return (
            <div
              className={`text-center font-bold bg-green-50 p-2 rounded ${colorClass}`}
            >
              {percentage}%
            </div>
          );
        },
      },
    ];

    return [...baseColumns, ...subjectColumns, ...summaryColumns];
  }, [subjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load class records. {error}
        </p>
        <Button onClick={fetchClassData}>Retry</Button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Class not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <PageHeader
            title={`Academic Records - ${classData.name}`}
            subtitle={`Comprehensive records for ${students.length} students across ${subjects.length} subjects`}
          />
        </div>
      </div>

      {/* Class Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Class Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Teacher: {classData.teacher?.user?.firstname}{" "}
                {classData.teacher?.user?.lastname} | Room:{" "}
                {classData.roomNumber || "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Academic Records</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing all students with subject scores and attendance
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tableData}
            searchPlaceholder="Search students..."
            searchKey="studentName"
          />
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {tableData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {students.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {subjects.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    tableData.reduce((acc, row) => acc + row.averageScore, 0) /
                      tableData.length
                  ) || 0}
                </div>
                <p className="text-sm text-muted-foreground">Class Average</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(
                    tableData.reduce(
                      (acc, row) => acc + row.attendancePercentage,
                      0
                    ) / tableData.length
                  ) || 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
