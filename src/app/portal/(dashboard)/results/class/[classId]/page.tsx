"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import {
  gradesAPI,
  gradeListAtom,
  gradeLoadingAtom,
  gradeErrorAtom,
} from "@/jotai/grades/grades";
import {
  classesAPI,
  getAllClassAtom,
  classLoadingAtom,
} from "@/jotai/class/class";
import {
  isParentAtom,
  isStudentAtom,
  isTeacherAtom,
  isAdminAtom,
  userAtom,
} from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";
import { cn } from "@/lib/utils";

import { subjectsAPI } from "@/jotai/subject/subject";
import { studentsAPI } from "@/jotai/students/student";
import { Subject } from "@/jotai/subject/subject-types";
import { Student } from "@/jotai/students/student-types";
import { Grade } from "@/jotai/grades/grades-types";

import { PageHeader } from "@/components/general/page-header";
import { SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ActionsDropdown from "@/components/ui/actions-dropdown";
import { UpdateResult } from "@/components/portal/dashboards/results/update-result-modal";

export default function ClassResultsPage() {
  const params = useParams();
  const classId = Number(params.classId);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [localResults, setLocalResults] = useState<
    Record<string, Partial<Grade>>
  >({});

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<Grade | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<Partial<Grade>>({});

  // Role-based access control
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const [user] = useAtom(userAtom);

  const [academicYear] = useState<string>("2024/2025");
  const [term] = useState<string>("FIRST");

  const [results] = useAtom(gradeListAtom);
  const [loading] = useAtom(gradeLoadingAtom);
  const [error] = useAtom(gradeErrorAtom);
  const [, getResultsByClass] = useAtom(gradesAPI.getResultsByClass);
  const [, createOrUpdateResult] = useAtom(gradesAPI.createOrUpdateResult);
  const [, updateResult] = useAtom(gradesAPI.updateResult);

  // Access control
  const canManageResults = isAdmin || isTeacher;
  const canViewResults = isAdmin || isTeacher || isParent || isStudent;

  // Check if teacher is assigned to the selected subject
  const isTeacherAssignedToSubject = (subjectId: number) => {
    if (!isTeacher || !user) return false;
    const subject = subjects.find((s) => s.id === subjectId);
    return (
      subject?.teachers?.some(
        (teacher) => teacher.teacher.userId === user.id
      ) || false
    );
  };

  // Filter students based on user role
  const getFilteredStudents = () => {
    if (isParent) {
      // Parents can only see their ward's results
      return students.filter((student) =>
        student.parents?.some((parent) => parent.parent.userId === user?.id)
      );
    } else if (isStudent) {
      // Students can only see their own results
      return students.filter((student) => student.userId === user?.id);
    }
    // Admin and teachers can see all students
    return students;
  };

  // Filter subjects based on user role
  const getFilteredSubjects = () => {
    if (isTeacher && !isAdmin) {
      // Teachers can only see subjects they teach
      return subjects.filter((subject) =>
        subject.teachers?.some((teacher) => teacher.teacher.userId === user?.id)
      );
    }
    // Admin can see all subjects
    return subjects;
  };

  const [classes] = useAtom(getAllClassAtom);
  const [classLoading] = useAtom(classLoadingAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  // const [isParent] = useAtom(isParentAtom);
  // const [isStudent] = useAtom(isStudentAtom);
  // const [isTeacher] = useAtom(isTeacherAtom);
  // const [isAdmin] = useAtom(isAdminAtom);
  // const [user] = useAtom(userAtom);

  const currentClass = Array.isArray(classes)
    ? classes.find((c) => c.id === classId)
    : null;

  // Handling calling class data
  useEffect(() => {
    if (classId) {
      getResultsByClass(classId, academicYear, term);
    }
    getAllClasses();
  }, [classId, academicYear, term, getResultsByClass, getAllClasses]);

  // Handling calling subjects and student data
  useEffect(() => {
    const fetchData = async () => {
      const [subjects, students] = await Promise.all([
        subjectsAPI.getSubjectByClassID(classId),
        studentsAPI.getStudentsByClass(classId),
      ]);

      setSubjects(Array.isArray(subjects) ? subjects : []);
      setStudents(Array.isArray(students) ? students : []);
    };

    fetchData();
  }, [classId]);

  // Modal handling functions
  const handleEditResult = (result: Grade) => {
    // Check if this is a real result with an ID or a placeholder result
    const isExistingResult = result.id && typeof result.id === "number";

    if (isExistingResult) {
      // This is an existing result with data
      setSelectedResult(result);
      setSelectedStudent(result.student);
    } else {
      // This is a placeholder result for a new entry
      setSelectedResult(null);
      setSelectedStudent(result.student);
    }

    setIsModalOpen(true);
  };

  const handleUpdateResult = async (resultData: Partial<Grade>) => {
    if (!selectedStudent || !selectedSubjectData) return;

    // Check if teacher is assigned to the subject (for teachers)
    if (
      isTeacher &&
      !isAdmin &&
      !isTeacherAssignedToSubject(selectedSubjectData.id)
    ) {
      toast.error(
        "You are not assigned to teach this subject. Only the assigned teacher or admin can manage results for this subject."
      );
      return;
    }

    setIsUpdating(true);
    try {
      const key = `${selectedStudent.id}-${selectedSubjectData.id}`;

      // Check if result already exists for this student-subject combination
      const existingResult = Array.isArray(results)
        ? results.find(
            (r) =>
              r.studentId === selectedStudent.id &&
              r.subjectId === selectedSubjectData.id &&
              r.academicYear === academicYear &&
              r.term === term
          )
        : null;

      const isUpdate = existingResult && existingResult.id;
      // const isCreate = !existingResult || !existingResult.id;

      // Update local state immediately
      setLocalResults((prev) => ({
        ...prev,
        [key]: resultData,
      }));

      if (isUpdate && existingResult?.id) {
        // Update existing result using the updateResult API
        await updateResult(existingResult.id, resultData);
        toast.success("Result updated successfully");
      } else {
        // Create new result using createOrUpdateResult API
        const fullResultData = {
          ...resultData,
          studentId: selectedStudent.id,
          subjectId: selectedSubjectData.id,
          classId: classId,
          academicYear,
          term,
        };

        await createOrUpdateResult(fullResultData);
        toast.success("Result created successfully");
      }

      // Clear local results after successful API call
      setLocalResults({});

      // Refresh results
      await getResultsByClass(classId, academicYear, term);

      // Close modal
      setIsModalOpen(false);
      setSelectedResult(null);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to save result:", error);
      const isUpdate = selectedResult && selectedResult.id;
      toast.error(
        isUpdate
          ? "Failed to update result. Please try again."
          : "Failed to create result. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Get the selected subject
  const selectedSubjectData = selectedSubject
    ? subjects.find((s) => s.id.toString() === selectedSubject)
    : null;

  // Create results for students in the selected subject only
  // Access control check
  if (!canViewResults) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          Access denied. You don&apos;t have permission to view results.
        </p>
      </div>
    );
  }

  const mappedResults = selectedSubjectData
    ? getFilteredStudents().map((student) => {
        const key = `${student.id}-${selectedSubjectData.id}`;
        const existingResult = Array.isArray(results)
          ? results.find(
              (r) =>
                r.studentId === student.id &&
                r.subjectId === selectedSubjectData.id &&
                r.academicYear === academicYear &&
                r.term === term
            )
          : null;

        // Debug logging
        if (existingResult) {
          console.log(
            `Found existing result for student ${student.id}:`,
            existingResult
          );
        }

        return {
          id: existingResult?.id || key,
          studentId: student.id,
          subjectId: selectedSubjectData.id,
          student: student,
          subject: selectedSubjectData,
          ca1: existingResult?.ca1 || localResults[key]?.ca1 || null,
          ca2: existingResult?.ca2 || localResults[key]?.ca2 || null,
          examScore:
            existingResult?.examScore || localResults[key]?.examScore || null,
          ltc: existingResult?.ltc || localResults[key]?.ltc || null,
          overallScore:
            existingResult?.overallScore ||
            localResults[key]?.overallScore ||
            null,
          grade: existingResult?.grade || localResults[key]?.grade || null,
          subjectPosition:
            existingResult?.subjectPosition ||
            localResults[key]?.subjectPosition ||
            null,
          academicYear: academicYear,
          term: term,
          createdAt: existingResult?.createdAt,
          updatedAt: existingResult?.updatedAt,
        };
      })
    : [];

  // Filtered Result Data
  const filteredResults = mappedResults.filter((result) => {
    const matchesSearch =
      result?.student?.user?.firstname || result?.student?.user?.lastname;

    const matchesYear = result?.academicYear === academicYear;
    const matchesTerm = result?.term === term;

    return matchesSearch && matchesYear && matchesTerm;
  });

  // Calculate subject statistics
  const subjectStats = {
    totalStudents: students.length,
    subjectName: selectedSubjectData?.name || "No Subject Selected",
    averageScore: 0,
    topPerformer: null as { student: Student; score: number | null } | null,
    passRate: 0,
    studentsWithResults: 0,
  };

  if (mappedResults.length > 0) {
    const validScores = mappedResults
      .map((r) => r.overallScore)
      .filter((score) => score !== null && score !== undefined) as number[];

    subjectStats.studentsWithResults = validScores.length;

    if (validScores.length > 0) {
      subjectStats.averageScore =
        validScores.reduce((sum, score) => sum + score, 0) / validScores.length;

      // Find top performer for this subject
      const topResult = mappedResults
        .filter((r) => r.overallScore !== null && r.overallScore !== undefined)
        .reduce((top, current) =>
          (current.overallScore || 0) > (top.overallScore || 0) ? current : top
        );

      if (topResult) {
        subjectStats.topPerformer = {
          student: topResult.student,
          score: topResult.overallScore,
        };
      }

      // Calculate pass rate (assuming 50% is passing)
      const passingStudents = validScores.filter((score) => score >= 50).length;
      subjectStats.passRate = (passingStudents / validScores.length) * 100;
    }
  }

  // Assign grade color
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

  // Table Headers and Column Types
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
                {result?.student?.user?.firstname}{" "}
                {result?.student?.user?.lastname}
              </p>
              <p className="text-sm text-gray-500">
                {result?.student?.user?.email}
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
            <p className="font-medium">{result?.subject?.name}</p>
            <p className="text-sm text-gray-500">{result?.subject?.code}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "ca1",
      header: "CA1",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return (
          <span className={hasData ? "" : "text-muted-foreground"}>
            {result.ca1 ? result.ca1.toFixed(1) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "ca2",
      header: "CA2",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return (
          <span className={hasData ? "" : "text-muted-foreground"}>
            {result.ca2 ? result.ca2.toFixed(1) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "examScore",
      header: "Exam",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return (
          <span className={hasData ? "" : "text-muted-foreground"}>
            {result.examScore ? result.examScore.toFixed(1) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "ltc",
      header: "LTC",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return (
          <span className={hasData ? "" : "text-muted-foreground"}>
            {result.ltc ? result.ltc.toFixed(1) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "overallScore",
      header: "Overall",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return (
          <span className={hasData ? "" : "text-muted-foreground"}>
            {result.overallScore ? result.overallScore.toFixed(1) : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return result.grade ? (
          <Badge className={cn(getGradeColor(result.grade))}>
            {result.grade}
          </Badge>
        ) : (
          <span className={hasData ? "" : "text-muted-foreground"}>-</span>
        );
      },
    },
    {
      accessorKey: "subjectPosition",
      header: "Position",
      cell: ({ row }) => {
        const result = row.original;
        const hasData = result.id && typeof result.id === "number";
        return result.subjectPosition ? (
          <span className={hasData ? "" : "text-muted-foreground"}>
            {`${result.subjectPosition}${getOrdinalSuffix(
              result.subjectPosition
            )}`}
          </span>
        ) : (
          <span className={hasData ? "" : "text-muted-foreground"}>-</span>
        );
      },
    },
    ...(canManageResults
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: Row<Grade> }) => {
              const result = row.original;

              return (
                <ActionsDropdown
                  actions={[
                    {
                      label:
                        result.id && typeof result.id === "number"
                          ? "Edit Result"
                          : "Add Result",
                      onClick: () => handleEditResult(result),
                    },

                    {
                      label: "Calculate Grade",
                      onClick: () => {
                        // TODO: Implement calculate grade functionality
                        console.log(
                          "Calculate grade for student:",
                          result.studentId,
                          "subject:",
                          result.subjectId
                        );
                      },
                    },
                    // {
                    //   label: "Print Result",
                    //   onClick: () => {
                    //     // TODO: Implement print result functionality
                    //     console.log(
                    //       "Print result for student:",
                    //       result.studentId,
                    //       "subject:",
                    //       result.subjectId
                    //     );
                    //   },
                    // },
                  ]}
                />
              );
            },
          },
        ]
      : []),
  ];

  if (loading || classLoading) {
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
        <Button onClick={() => getResultsByClass(classId, academicYear, term)}>
          Retry
        </Button>
      </div>
    );
  }

  if (!currentClass) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Class not found</p>
        <Button asChild className="mt-4">
          <a href="/portal/results">Back to Results</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`${currentClass.name} Results`}
        subtitle={`Academic Year: ${academicYear} | Term: ${term}`}
      />

      {/* Filter */}
      <div className={"space-y-5"}>
        <div>
          <p className={"leading-none font-semibold"}>
            Filter Results by Subject and Academic Year
          </p>
          {isTeacher && !isAdmin && getFilteredSubjects().length === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              You are not assigned to teach any subjects in this class.
            </p>
          )}
        </div>
        <div className={"max-w-md"}>
          {isTeacher && !isAdmin && getFilteredSubjects().length === 0 ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Subject</Label>
              <div className="h-10 px-3 py-2 text-sm border rounded-sm bg-gray-50 text-gray-500 flex items-center">
                No subjects assigned to you
              </div>
            </div>
          ) : (
            <SelectField
              label="Select Subject"
              placeholder="Choose a subject to view results"
              value={selectedSubject || ""}
              onValueChange={(value) => setSelectedSubject(value || null)}
            >
              {getFilteredSubjects().map((subject, index) => (
                <SelectItem key={index} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectField>
          )}
        </div>
      </div>

      {/* Subject Statistics */}
      {selectedSubjectData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold">
                    {subjectStats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subject</p>
                  <p className="text-lg font-bold">
                    {subjectStats.subjectName}
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
                    {subjectStats.averageScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold">
                    {subjectStats.passRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performer */}
      {subjectStats.topPerformer && selectedSubjectData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Performer in {subjectStats.subjectName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {subjectStats.topPerformer.student?.user?.firstname}{" "}
                  {subjectStats.topPerformer.student?.user?.lastname}
                </p>
                <p className="text-sm text-gray-600">
                  Score: {subjectStats.topPerformer.score?.toFixed(1)}%
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                #1 in {subjectStats.subjectName}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {selectedSubjectData ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {subjectStats.subjectName} Results ({filteredResults.length}{" "}
              students)
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground">●</span> Existing results |{" "}
              <span className="text-muted-foreground">●</span> Placeholder
              entries (click &quot;Add Result&quot; to create)
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredResults}
              enableGlobalSearch={true}
              searchKey="student.user.firstname"
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isTeacher && !isAdmin && getFilteredSubjects().length === 0
                  ? "No Subjects Assigned"
                  : "Select a Subject"}
              </h3>
              <p className="text-gray-500">
                {isTeacher && !isAdmin && getFilteredSubjects().length === 0
                  ? "You are not assigned to teach any subjects in this class. Contact your administrator for subject assignments."
                  : "Choose a subject from the filter above to view student results."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Result Modal */}
      {selectedStudent && selectedSubjectData && (
        <UpdateResult
          result={selectedResult}
          student={selectedStudent}
          subject={selectedSubjectData}
          onFormSubmit={handleUpdateResult}
          onFormDataChange={setCurrentFormData}
          loading={isUpdating}
          triggerText={selectedResult?.id ? "Edit Result" : "Add Result"}
          modalTitle={
            selectedResult?.id
              ? `Update Result - ${selectedStudent.user?.firstname} ${selectedStudent.user?.lastname}`
              : `Add Result - ${selectedStudent.user?.firstname} ${selectedStudent.user?.lastname}`
          }
          modalDescription={
            selectedResult?.id
              ? `Update result for ${selectedSubjectData.name}`
              : `Add new result for ${selectedSubjectData.name}`
          }
          btnText={
            isUpdating
              ? selectedResult?.id
                ? "Updating..."
                : "Creating..."
              : selectedResult?.id
              ? "Update Result"
              : "Create Result"
          }
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsModalOpen(false);
              setSelectedResult(null);
              setSelectedStudent(null);
            }
          }}
          hideTrigger={true}
          onUpdate={() => {
            // Use currentFormData for the update
            handleUpdateResult(currentFormData);
          }}
        />
      )}
    </div>
  );
}
