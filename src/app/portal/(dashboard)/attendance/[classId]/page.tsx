/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem } from "@/components/ui/select";
// import { attendanceAPI } from "@/jotai/attendance/attendance";
import { getAllClassAtom } from "@/jotai/class/class";
import { studentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import TableComp from "@/components/general/table";
import { PageHeader } from "@/components/general/page-header";
import DatePicker from "@/components/general/date-picker";

import { Subject } from "@/jotai/subject/subject-types";
import { SelectField } from "@/components/ui/form-field";

// import { studentListAtom } from "@/jotai/students/student";
// import { classesAPI } from "@/jotai/class/class";
import { subjectsAPI } from "@/jotai/subject/subject";

interface AttendanceRecord {
  studentId: number;
  present: boolean;
  notes: string;
}

const tableHeader = [
  { key: "name", title: "Name" },
  { key: "status", title: "Status" },
  { key: "email", title: "Stakeholder Email" },
  { key: "Project Name", title: "Projects" },
];

// const studentsData = [
//   {
//     id: "1",
//     name: "Alice Johnson",
//     status: "present" as const,
//     arrivalTime: "8:00 AM",
//     grade: "Grade 1",
//     subject: "Mathematics",
//   },
//   {
//     id: "2",
//     name: "Bob Smith",
//     status: "late" as const,
//     arrivalTime: "8:15 AM",
//     grade: "Grade 2",
//     subject: "English",
//   },
//   {
//     id: "3",
//     name: "Carol Davis",
//     status: "absent" as const,
//     arrivalTime: undefined,
//     grade: "Grade 1",
//     subject: undefined,
//   },
//   {
//     id: "4",
//     name: "David Wilson",
//     status: "present" as const,
//     arrivalTime: "7:55 AM",
//     grade: "Grade 3",
//     subject: "Science",
//   },
//   {
//     id: "5",
//     name: "Eva Brown",
//     status: "present" as const,
//     arrivalTime: "8:02 AM",
//     grade: "Grade 2",
//     subject: "Mathematics",
//   },
//   {
//     id: "6",
//     name: "Frank Miller",
//     status: "present" as const,
//     arrivalTime: "8:05 AM",
//     grade: "Grade 1",
//     subject: "Art",
//   },
//   {
//     id: "7",
//     name: "Grace Lee",
//     status: "late" as const,
//     arrivalTime: "8:20 AM",
//     grade: "Grade 3",
//     subject: "History",
//   },
//   {
//     id: "8",
//     name: "Henry Clark",
//     status: "present" as const,
//     arrivalTime: "7:58 AM",
//     grade: "Grade 2",
//     subject: "Physical Education",
//   },
//   {
//     id: "9",
//     name: "Ivy Chen",
//     status: "late" as const,
//     arrivalTime: "8:18 AM",
//     grade: "Grade 1",
//     subject: "Science",
//   },
//   {
//     id: "10",
//     name: "Jack Thompson",
//     status: "absent" as const,
//     arrivalTime: undefined,
//     grade: "Grade 3",
//     subject: undefined,
//   },
// ];

export default function MarkAttendancePage() {
  // const router = useRouter();
  const params = useParams<{ classId: string }>();
  const classId = params.classId as string;

  const [loading, setLoading] = useState(false);
  const [classes] = useAtom(getAllClassAtom);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [attendanceDate, setAttendanceDate] = useState<string | undefined>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  console.log(classes);

  useEffect(() => {
    if (selectedSubject) {
      const fetchStudents = async () => {
        try {
          const [studentsData] = await Promise.all([
            studentsAPI.getByClass(parseInt(selectedSubject)),
          ]);
          setStudents(Array.isArray(studentsData) ? studentsData : []);

          // Initialize attendance records
          const records = studentsData.map((student: Student) => ({
            studentId: student.id,
            present: true,
            notes: "",
          }));
          setAttendanceRecords(records);
        } catch (error) {
          console.error("Failed to fetch students:", error);
          setStudents([]);
          setAttendanceRecords([]);
        }
      };
      fetchStudents();
    }
  }, []);

  useEffect(() => {
    (async () => {
      const response = await subjectsAPI.getSubjectByClassID(parseInt(classId));
      setSubjects(response);
    })();
  });

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, present } : record
      )
    );
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, notes } : record
      )
    );
  };

  const handleSelectAll = (present: boolean) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, present }))
    );
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedClass) {
  //     alert("Please select a class");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     // Submit attendance for each student
  //     const attendancePromises = attendanceRecords.map((record) => {
  //       interface MarkAttendanceParams {
  //         studentId: number;
  //         classId: number;
  //         date: string;
  //         present: boolean;
  //         notes: string;
  //         lessonTitle: string;
  //         markedBy: string;
  //       }

  //       interface MarkAttendanceParams {
  //         studentId: number;
  //         classId: number;
  //         date: string;
  //         present: boolean;
  //         notes: string;
  //         lessonTitle: string;
  //         markedBy: string;
  //       }

  //       interface AttendanceAPI {
  //         mark: (params: MarkAttendanceParams) => Promise<any>;
  //       }

  //       interface Class {
  //         id: number;
  //         name: string;
  //         grade: string | number;
  //         students?: Student[];
  //       }

  //       return (attendanceAPI as AttendanceAPI).mark({
  //         studentId: record.studentId,
  //         classId: parseInt(selectedClass),
  //         date: attendanceDate,
  //         present: record.present,
  //         notes: record.notes,
  //         lessonTitle: `Class - ${
  //           (classes as Class[]).find((c) => c.id.toString() === selectedClass)
  //             ?.name
  //         }`,
  //         markedBy: "current_teacher", // This would be the current user
  //       } as MarkAttendanceParams);
  //     });

  //     await Promise.all(attendancePromises);

  //     alert("Attendance marked successfully!");
  //     router.push("/portal/attendance");
  //   } catch (error) {
  //     console.error("Failed to mark attendance:", error);
  //     alert("Failed to mark attendance. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const presentCount = attendanceRecords.filter((r) => r.present).length;
  const absentCount = attendanceRecords.filter((r) => !r.present).length;
  const attendanceRate =
    attendanceRecords.length > 0
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Manage Attendance"}
        subtitle={"Record student attendance"}
      />

      <form onSubmit={() => {}} className="space-y-6">
        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Subject & Term</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label={"Subject"}
                placeholder="Select Subject"
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectContent>
                  <SelectItem value={"none"}>Not Selected</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem
                      key={subject.id}
                      value={subject.name.toString()}
                    >
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectField>

              <DatePicker
                label={"Date"}
                date={attendanceDate ? new Date(attendanceDate) : undefined}
                setDate={(date: Date | undefined) =>
                  setAttendanceDate(date ? date.toISOString() : "")
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        {selectedSubject && attendanceRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendanceRecords.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {presentCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {absentCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {attendanceRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Attendance Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Attendance List */}
        {selectedSubject && students.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Attendance</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(true)}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(false)}
                  >
                    Mark All Absent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {students.map((student) => {
                  const record = attendanceRecords.find(
                    (r) => r.studentId === student.id
                  );
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <span className="font-medium text-sm">
                            {student.user.firstname
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {student.user.firstname}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {student.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {student.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(student.id, true)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              record?.present
                                ? "bg-green-500 text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(student.id, false)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              record?.present === false
                                ? "bg-red-500 text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            Absent
                          </button>
                        </div>

                        <Input
                          placeholder="Notes (optional)"
                          value={record?.notes || ""}
                          onChange={(e) =>
                            handleNotesChange(student.id, e.target.value)
                          }
                          className="w-40"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-row gap-2">
            <p>Subject Name: </p>
            <p className={"font-semibold"}>
              {selectedSubject ?? "Not Selected"}
            </p>
          </div>

          <TableComp
            headers={tableHeader}
            data={[]}
            // rowActions={getRowActions}
            // error={isError}
          />
        </div>

        {/* Form Actions */}
        {selectedSubject && students.length > 0 && (
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/portal/attendance">Cancel</Link>
            </Button>
            <Button
              onClick={() => setLoading(true)}
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving Attendance..." : "Save Attendance"}
            </Button>
          </div>
        )}

        {/* No Students Message */}
        {selectedSubject && students.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No students found in the selected class.
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
