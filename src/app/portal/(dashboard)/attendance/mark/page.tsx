/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
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
import { attendanceAPI } from "@/jotai/attendance/attendance";
import { getAllClassAtom } from "@/jotai/class/class";
import { studentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";

interface AttendanceRecord {
  studentId: number;
  present: boolean;
  notes: string;
}

export default function MarkAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes] = useAtom(getAllClassAtom);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const studentsData = await studentsAPI.getByClass(
            parseInt(selectedClass)
          );
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
  }, [selectedClass]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("Please select a class");
      return;
    }

    setLoading(true);

    try {
      // Submit attendance for each student
      const attendancePromises = attendanceRecords.map((record) => {
        interface MarkAttendanceParams {
          studentId: number;
          classId: number;
          date: string;
          present: boolean;
          notes: string;
          lessonTitle: string;
          markedBy: string;
        }

        interface MarkAttendanceParams {
          studentId: number;
          classId: number;
          date: string;
          present: boolean;
          notes: string;
          lessonTitle: string;
          markedBy: string;
        }

        interface AttendanceAPI {
          mark: (params: MarkAttendanceParams) => Promise<any>;
        }

        interface Class {
          id: number;
          name: string;
          grade: string | number;
          students?: Student[];
        }

        return (attendanceAPI as AttendanceAPI).mark({
          studentId: record.studentId,
          classId: parseInt(selectedClass),
          date: attendanceDate,
          present: record.present,
          notes: record.notes,
          lessonTitle: `Class - ${
            (classes as Class[]).find((c) => c.id.toString() === selectedClass)
              ?.name
          }`,
          markedBy: "current_teacher", // This would be the current user
        } as MarkAttendanceParams);
      });

      await Promise.all(attendancePromises);

      alert("Attendance marked successfully!");
      router.push("/portal/attendance");
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendanceRecords.filter((r) => r.present).length;
  const absentCount = attendanceRecords.filter((r) => !r.present).length;
  const attendanceRate =
    attendanceRecords.length > 0
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/attendance">← Back to Attendance</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground">
              Record student attendance for today
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class & Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="selectedClass">Class *</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} (Grade {cls.grade}) -{" "}
                        {cls.students?.length || 0} students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="attendanceDate">Date *</Label>
                <Input
                  id="attendanceDate"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        {selectedClass && attendanceRecords.length > 0 && (
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
        {selectedClass && students.length > 0 && (
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
                            {student.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{student.user.name}</h3>
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

        {/* Form Actions */}
        {selectedClass && students.length > 0 && (
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/portal/attendance">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving Attendance..." : "Save Attendance"}
            </Button>
          </div>
        )}

        {/* No Students Message */}
        {selectedClass && students.length === 0 && (
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
