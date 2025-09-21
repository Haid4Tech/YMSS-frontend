"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  gradesAPI,
  gradeLoadingAtom,
  gradeErrorAtom,
} from "@/jotai/grades/grades";
import { 
  classesAPI,
  getAllClassAtom,
  classLoadingAtom,
} from "@/jotai/class/class";
import { 
  subjectsAPI,
  subjectListAtom,
  subjectLoadingAtom,
} from "@/jotai/subject/subject";
import { 
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";
import { BulkGradeData } from "@/jotai/grades/grades-types";

export default function BulkGradingPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<BulkGradeData[]>([]);

  const [loading] = useAtom(gradeLoadingAtom);
  const [error] = useAtom(gradeErrorAtom);
  const [, bulkCreateOrUpdateResults] = useAtom(gradesAPI.bulkCreateOrUpdateResults);

  const [classes] = useAtom(getAllClassAtom);
  const [classLoading] = useAtom(classLoadingAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [subjects] = useAtom(subjectListAtom);
  const [subjectLoading] = useAtom(subjectLoadingAtom);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  const [allStudents] = useAtom(studentListAtom);
  const [studentLoading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);

  useEffect(() => {
    getAllClasses();
    getAllSubjects();
    getAllStudents();
  }, [getAllClasses, getAllSubjects, getAllStudents]);

  // Filter subjects by selected class
  const filteredSubjects = Array.isArray(subjects)
    ? subjects.filter(subject => subject.classId?.toString() === selectedClass)
    : [];

  // Filter students by selected class
  const filteredStudents = Array.isArray(allStudents?.students)
    ? allStudents.students.filter((student: any) => student.classId?.toString() === selectedClass)
    : [];

  // Initialize results when students change
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const initialResults = filteredStudents.map((student: any) => ({
        studentId: student.id,
        ca1: undefined,
        ca2: undefined,
        examScore: undefined,
        ltc: undefined,
        remark: "",
      }));
      setResults(initialResults);
    }
  }, [filteredStudents]);

  const updateResult = (studentId: number, field: keyof BulkGradeData, value: any) => {
    setResults(prev => 
      prev.map(result => 
        result.studentId === studentId 
          ? { ...result, [field]: value }
          : result
      )
    );
  };

  const getStudentName = (studentId: number) => {
    const student = filteredStudents.find((s: any) => s.id === studentId);
    return student ? `${student.user?.firstname} ${student.user?.lastname}` : "Unknown";
  };

  const getStudentEmail = (studentId: number) => {
    const student = filteredStudents.find((s: any) => s.id === studentId);
    return student?.user?.email || "";
  };

  const columns: ColumnDef<BulkGradeData>[] = [
    {
      accessorKey: "studentId",
      header: "Student",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return (
          <div>
            <div className="font-medium">{getStudentName(studentId)}</div>
            <div className="text-sm text-muted-foreground">{getStudentEmail(studentId)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "ca1",
      header: "CA1",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return (
          <Input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={row.original.ca1 || ""}
            onChange={(e) => updateResult(studentId, "ca1", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-20"
          />
        );
      },
    },
    {
      accessorKey: "ca2",
      header: "CA2",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return (
          <Input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={row.original.ca2 || ""}
            onChange={(e) => updateResult(studentId, "ca2", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-20"
          />
        );
      },
    },
    {
      accessorKey: "examScore",
      header: "Exam",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return (
          <Input
            type="number"
            min="0"
            max="60"
            step="0.1"
            value={row.original.examScore || ""}
            onChange={(e) => updateResult(studentId, "examScore", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-20"
          />
        );
      },
    },
    {
      accessorKey: "ltc",
      header: "LTC",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return (
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={row.original.ltc || ""}
            onChange={(e) => updateResult(studentId, "ltc", e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-20"
          />
        );
      },
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        return (
          <Input
            value={row.original.remark || ""}
            onChange={(e) => updateResult(studentId, "remark", e.target.value)}
            placeholder="Enter remark..."
            className="w-32"
          />
        );
      },
    },
  ];

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject) {
      toast.error("Please select both class and subject");
      return;
    }

    if (results.length === 0) {
      toast.error("No students found for the selected class");
      return;
    }

    try {
      await bulkCreateOrUpdateResults({
        classId: parseInt(selectedClass),
        subjectId: parseInt(selectedSubject),
        academicYear,
        term,
        results,
      });

      toast.success("Results saved successfully");
      router.push("/portal/results");
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    }
  };

  const isFormValid = selectedClass && selectedSubject && results.length > 0;

  if (classLoading || subjectLoading || studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Bulk Grading</h1>
            <p className="text-muted-foreground">
              Grade students for a specific subject and class
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Results
        </Button>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class and Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(classes) && classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id.toString()}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={term} onValueChange={(value: "FIRST" | "SECOND" | "THIRD") => setTerm(value)}>
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

      {/* Grading Table */}
      {selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle>
              Grade Students ({filteredStudents.length} students)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              CA1 & CA2: 0-20 each | Exam: 0-60 | LTC: 0-100
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={results}
              searchPlaceholder="Search students..."
              searchKey="studentId"
              enableGlobalSearch={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Grading Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>CA1 & CA2:</strong> Continuous Assessment scores (0-20 each)</p>
            <p><strong>Exam:</strong> Final examination score (0-60)</p>
            <p><strong>LTC:</strong> Long Term Continuous Assessment (0-100)</p>
            <p><strong>Total Score:</strong> Automatically calculated as (CA1 + CA2 + Exam)</p>
            <p><strong>Overall Score:</strong> Automatically calculated as (Total Score + LTC) / 2</p>
            <p><strong>Grade:</strong> Automatically assigned based on overall score (A: 80+, B: 65-79, C: 50-64, D: 40-49, F: 0-39)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
