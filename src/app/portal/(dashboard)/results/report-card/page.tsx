"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import {
  gradesAPI,
  reportCardAtom,
  reportCardLoadingAtom,
  reportCardErrorAtom,
} from "@/jotai/grades/grades";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Student } from "@/jotai/students/student-types";
// import { extractErrorMessage } from "@/utils/helpers";

export default function ReportCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");

  const [reportCard] = useAtom(reportCardAtom);
  const [loading] = useAtom(reportCardLoadingAtom);
  const [error] = useAtom(reportCardErrorAtom);
  const [, getReportCard] = useAtom(gradesAPI.getReportCard);

  const [students] = useAtom(studentListAtom);
  const [studentLoading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);

  useEffect(() => {
    getAllStudents();

    // Pre-fill from URL params
    const studentId = searchParams.get("studentId");
    const year = searchParams.get("academicYear");
    const termParam = searchParams.get("term");

    if (studentId) setSelectedStudent(studentId);
    if (year) setAcademicYear(year);
    if (termParam && ["FIRST", "SECOND", "THIRD"].includes(termParam)) {
      setTerm(termParam as "FIRST" | "SECOND" | "THIRD");
    }
  }, [getAllStudents, searchParams]);

  useEffect(() => {
    if (selectedStudent) {
      getReportCard(parseInt(selectedStudent), academicYear, term);
    }
  }, [selectedStudent, academicYear, term, getReportCard]);

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

  const getGradeRemark = (grade: string) => {
    switch (grade) {
      case "A":
        return "Excellent";
      case "B":
        return "Very Good";
      case "C":
        return "Good";
      case "D":
        return "Weak Pass";
      case "F":
        return "Fail";
      default:
        return "Not Graded";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    toast.info("PDF download feature coming soon");
  };

  if (studentLoading) {
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
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Report Card</h1>
            <p className="text-muted-foreground">
              View student academic performance
            </p>
          </div>
        </div>

        {reportCard && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        )}
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student and Term</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(students?.students) &&
                    students.students.map((student: Student) => (
                      <SelectItem
                        key={student.id}
                        value={student.id.toString()}
                      >
                        {student.user?.firstname} {student.user?.lastname}
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

      {/* Report Card */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <Button
              onClick={() =>
                selectedStudent &&
                getReportCard(parseInt(selectedStudent), academicYear, term)
              }
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {reportCard && !loading && (
        <div className="print:bg-white print:text-black">
          {/* School Header */}
          <Card className="print:shadow-none print:border-2">
            <CardContent className="text-center py-8">
              <h1 className="text-2xl font-bold mb-2">YOLA MODEL SCHOOL</h1>
              <p className="text-lg">Yola-Town, P.O. Box 3432, Adamawa State</p>
              <h2 className="text-xl font-semibold mt-4">
                STUDENT&apos;S CONTINUOUS ASSESSMENT REPORT SHEET
              </h2>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card className="print:shadow-none print:border-2">
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">NAME:</span>{" "}
                  {reportCard.student?.user?.firstname}{" "}
                  {reportCard.student?.user?.lastname}
                </div>
                <div>
                  <span className="font-semibold">CLASS:</span>{" "}
                  {reportCard.class?.name}
                </div>
                <div>
                  <span className="font-semibold">SESSION:</span>{" "}
                  {reportCard.academicYear}
                </div>
                <div>
                  <span className="font-semibold">TERM:</span> {reportCard.term}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="print:shadow-none print:border-2">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 print:bg-gray-100">
                      <th className="border p-2 text-left">Subject</th>
                      <th className="border p-2 text-center">1st CA</th>
                      <th className="border p-2 text-center">2nd CA</th>
                      <th className="border p-2 text-center">Total (a+b)</th>
                      <th className="border p-2 text-center">Exams</th>
                      <th className="border p-2 text-center">Total (c+d)</th>
                      <th className="border p-2 text-center">LTC</th>
                      <th className="border p-2 text-center">
                        Overall (c+f)/2
                      </th>
                      <th className="border p-2 text-center">Class Average</th>
                      <th className="border p-2 text-center">Grade</th>
                      <th className="border p-2 text-center">Position</th>
                      <th className="border p-2 text-center">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportCard.results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">
                          {result.subject?.name}
                        </td>
                        <td className="border p-2 text-center">
                          {result.ca1?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.ca2?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.caTotal?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.examScore?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.totalScore?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.ltc?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center font-semibold">
                          {result.overallScore?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.classAverage?.toFixed(1) || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.grade && (
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          )}
                        </td>
                        <td className="border p-2 text-center">
                          {result.subjectPosition
                            ? `${result.subjectPosition}${getOrdinalSuffix(
                                result.subjectPosition
                              )}`
                            : "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {result.remark || getGradeRemark(result.grade || "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="print:shadow-none print:border-2">
            <CardContent className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Number of Subjects:</span>{" "}
                  {reportCard.summary.numberOfSubjects}
                </div>
                <div>
                  <span className="font-semibold">Marks Obtainable:</span>{" "}
                  {reportCard.summary.marksObtainable}
                </div>
                <div>
                  <span className="font-semibold">Total Marks Obtained:</span>{" "}
                  {reportCard.summary.totalMarksObtained.toFixed(0)}
                </div>
                <div>
                  <span className="font-semibold">Average:</span>{" "}
                  {reportCard.summary.average.toFixed(1)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grading Scale */}
          <Card className="print:shadow-none print:border-2">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4">Grading Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>0 - 39.99: F</div>
                <div>40 - 49.99: D</div>
                <div>50 - 64.99: C</div>
                <div>65 - 79.99: B</div>
                <div>80 - 100: A</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!reportCard && !loading && !error && selectedStudent && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              No results found for this student and term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getOrdinalSuffix(num: number) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}
