/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { subjectAttendanceAPI } from "@/jotai/subject-attendance/subject-attendance";
import {
  AttendanceStatus,
  AttendanceRecord,
} from "@/jotai/subject-attendance/subject-attendance-type";

import { studentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import TableComp from "@/components/general/table";
import { PageHeader } from "@/components/general/page-header";
import DatePicker from "@/components/general/date-picker";

import { Subject } from "@/jotai/subject/subject-types";
import { SelectField } from "@/components/ui/form-field";

import { subjectsAPI } from "@/jotai/subject/subject";
import { RowAction } from "@/components/general/table";
import { toast } from "sonner";

const tableHeader = [
  { key: "student_id", title: "Student ID" },
  { key: "name", title: "Student Name" },
  { key: "status", title: "Status" },
  { key: "date", title: "Date" },
  { key: "actions", title: "Actions" },
];

export default function MarkAttendancePage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId as string;

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );

  const [attendanceDate, setAttendanceDate] = useState<string | undefined>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  const getRowActions = (row: any): RowAction[] => {
    return [
      {
        title: "Remove Attendance",
        action: () => handleRemoveAttendance(row.id),
        color: "text-danger",
      },
    ];
  };

  const fetchExistingAttendance = useCallback(async () => {
    if (!attendanceDate) return;

    try {
      const attendance = await subjectAttendanceAPI.getByClassAndDate(
        parseInt(classId),
        attendanceDate
      );
      setExistingAttendance(attendance.attendance || []);

      // Update attendance records with existing data
      if (attendance.attendance && attendance.attendance.length > 0) {
        setAttendanceRecords((prev) =>
          prev.map((record) => {
            const existing = attendance.attendance.find(
              (a: any) => a.studentId === record.studentId
            );
            if (existing && existing.subjects && existing.subjects.length > 0) {
              const subjectAttendance = existing.subjects.find(
                (s: any) => s.subjectId === selectedSubjectId
              );
              return subjectAttendance
                ? {
                    ...record,
                    status:
                      subjectAttendance.attendance?.status ||
                      AttendanceStatus.PRESENT,
                  }
                : record;
            }
            return record;
          })
        );
      }
    } catch (error) {
      console.error("Failed to fetch existing attendance:", error);
    }
  }, [attendanceDate, classId, selectedSubjectId]);

  const fetchAttendanceSummary = useCallback(async () => {
    try {
      const summary = await subjectAttendanceAPI.getClassAttendanceSummary(
        parseInt(classId)
      );
      setAttendanceSummary(summary);
    } catch (error) {
      console.error("Failed to fetch attendance summary:", error);
    }
  }, [classId]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const [studentsData] = await Promise.all([
          studentsAPI.getStudentsByClass(parseInt(classId)),
        ]);
        setStudents(Array.isArray(studentsData) ? studentsData : []);

        // Initialize attendance records
        const records = studentsData.map((student: Student) => ({
          studentId: student.id,
          status: AttendanceStatus.PRESENT,
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
    fetchAttendanceSummary();
  }, [classId, fetchAttendanceSummary]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsAPI.getSubjectByClassID(
          parseInt(classId)
        );
        setSubjects(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [classId]);

  useEffect(() => {
    if (attendanceDate) {
      fetchExistingAttendance();
    }
  }, [attendanceDate, fetchExistingAttendance]);

  const handleSubjectChange = (subjectName: string) => {
    setSelectedSubject(subjectName);
    const subject = subjects.find((s) => s.name === subjectName);
    setSelectedSubjectId(subject?.id || null);
  };

  const handleAttendanceChange = (
    studentId: number,
    status: AttendanceStatus
  ) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
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

  const handleSelectAll = (status: AttendanceStatus) => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }

    setLoading(true);

    try {
      const attendanceData = {
        classId: parseInt(classId),
        date: attendanceDate!,
        attendanceData: attendanceRecords.map((record) => ({
          studentId: record.studentId,
          subjectId: selectedSubjectId,
          status: record.status,
        })),
      };

      await subjectAttendanceAPI.takeClassAttendance(attendanceData);

      toast.success("Attendance marked successfully!");
      await fetchExistingAttendance(); // Refresh existing attendance
      await fetchAttendanceSummary(); // Refresh summary
    } catch (error: any) {
      console.error("Failed to mark attendance:", error);
      toast.error(
        error.message || "Failed to mark attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttendance = async (attendanceId: number) => {
    try {
      await subjectAttendanceAPI.remove(attendanceId);
      toast.success("Attendance record removed successfully!");
      await fetchExistingAttendance(); // Refresh existing attendance
      await fetchAttendanceSummary(); // Refresh summary
    } catch (error: any) {
      console.error("Failed to remove attendance:", error);
      toast.error(
        error.message || "Failed to remove attendance. Please try again."
      );
    }
  };

  const presentCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.PRESENT
  ).length;
  const absentCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.ABSENT
  ).length;
  const lateCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.LATE
  ).length;
  const excusedCount = attendanceRecords.filter(
    (r) => r.status === AttendanceStatus.EXCUSED
  ).length;
  const attendanceRate =
    attendanceRecords.length > 0
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
      : "0";

  // Prepare table data for existing attendance
  const tableData = existingAttendance.flatMap((studentAttendance: any) =>
    studentAttendance.subjects
      .filter((subject: any) => subject.attendance)
      .map((subject: any) => ({
        student_id: studentAttendance.studentId,
        name: `${studentAttendance.firstname} ${
          studentAttendance.lastname || ""
        }`,
        status: subject.attendance.status,
        date: new Date(subject.attendance.date).toLocaleDateString(),
        id: subject.attendance.id,
      }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Manage Attendance"}
        subtitle={"Record student attendance"}
      />

      {/* Attendance Summary Card */}
      {attendanceSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceSummary.totalStudents}
                </div>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceSummary.summary?.filter(
                    (s: any) => s.attendancePercentage >= 80
                  ).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Good Attendance (≥80%)
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {attendanceSummary.summary?.filter(
                    (s: any) =>
                      s.attendancePercentage >= 60 &&
                      s.attendancePercentage < 80
                  ).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Fair Attendance (60-79%)
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {attendanceSummary.summary?.filter(
                    (s: any) => s.attendancePercentage < 60
                  ).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Poor Attendance (&lt;60%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Subject & Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label={"Subject"}
                placeholder="Select Subject"
                value={selectedSubject}
                onValueChange={handleSubjectChange}
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
                setDate={(date: Date | undefined) => {
                  const newDate = date ? date.toISOString().split("T")[0] : "";
                  setAttendanceDate(newDate);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        {selectedSubject && attendanceRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <div className="text-2xl font-bold text-yellow-600">
                    {lateCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Late</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {excusedCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Excused</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold">
                  Attendance Rate:{" "}
                  <span className="text-blue-600">{attendanceRate}%</span>
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
                    onClick={() => handleSelectAll(AttendanceStatus.PRESENT)}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(AttendanceStatus.ABSENT)}
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
                            {student.user.firstname} {student.user.lastname}
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
                              handleAttendanceChange(
                                student.id,
                                AttendanceStatus.PRESENT
                              )
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              record?.status === AttendanceStatus.PRESENT
                                ? "bg-green-500 text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(
                                student.id,
                                AttendanceStatus.ABSENT
                              )
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              record?.status === AttendanceStatus.ABSENT
                                ? "bg-red-500 text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(
                                student.id,
                                AttendanceStatus.LATE
                              )
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              record?.status === AttendanceStatus.LATE
                                ? "bg-yellow-500 text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(
                                student.id,
                                AttendanceStatus.EXCUSED
                              )
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              record?.status === AttendanceStatus.EXCUSED
                                ? "bg-purple-500 text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            Excused
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

        {/* Existing Attendance Records */}
        {tableData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Existing Attendance Records for {attendanceDate}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TableComp
                headers={tableHeader}
                data={tableData}
                rowActions={getRowActions}
              />
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        {selectedSubject && students.length > 0 && (
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/portal/attendance">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving Attendance..." : "Save Attendance"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
