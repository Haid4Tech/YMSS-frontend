/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceStatus } from "@/jotai/subject-attendance/subject-attendance-type";
import { DataTable } from "@/components/general/data-table";

import { studentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { attendanceAPI } from "@/jotai/attendance/attendance";
import { Attendance } from "@/jotai/attendance/attendance-types";

import { PageHeader } from "@/components/general/page-header";
import DatePicker from "@/components/general/date-picker";
import ActionsDropdown from "@/components/ui/actions-dropdown";

import { ColumnDef } from "@tanstack/react-table";

import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

export default function MarkAttendancePage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId as string;

  const [attendanceDate, setAttendanceDate] = useState<Date | string>(
    new Date()
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [localAttendanceRecords, setLocalAttendanceRecords] = useState<
    Record<number, { status: string; notes?: string }>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students first
        const studentsData = await studentsAPI.getStudentsByClass(
          parseInt(classId)
        );
        setStudents(Array.isArray(studentsData) ? studentsData : []);

        // Fetch attendance data separately (don't fail if no records exist)
        try {
          const attendanceData = await attendanceAPI.getByClassIdDate(
            parseInt(classId),
            attendanceDate
          );
          setAttendanceRecords(
            Array.isArray(attendanceData) ? attendanceData : []
          );
        } catch (attendanceError) {
          console.log(
            "No attendance records found for this date:",
            attendanceError
          );
          setAttendanceRecords([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        setStudents([]);
      }
    };
    fetchData();
  }, [classId, attendanceDate]);

  const mappedStudents = students.map((student) => {
    // Get current attendance record for the selected date
    const currentAttendanceRecord = attendanceRecords.find((record) => {
      const recordDate = new Date(record.date);
      const selectedDate = new Date(attendanceDate);

      // Compare dates by year, month, and day only (ignore time)
      return (
        record.studentId === student.id &&
        record.classId === parseInt(classId) &&
        recordDate.getFullYear() === selectedDate.getFullYear() &&
        recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getDate() === selectedDate.getDate()
      );
    });

    // Get current status for this student - check local records first, then existing records
    const localStatus = localAttendanceRecords[student.id];
    const existingStatus = currentAttendanceRecord?.status;
    const currentStatus = localStatus?.status || existingStatus || "NOT_MARKED";

    return {
      student_id: student.id,
      ...student,
      attendance: {
        id: currentAttendanceRecord?.id,
        status: currentStatus,
        notes: localStatus?.notes || currentAttendanceRecord?.notes || "",
        date: attendanceDate,
        classId: parseInt(classId),
        studentId: student.id,
      },
    };
  });

  // Calculate today's attendance summary
  const todayAttendanceSummary = {
    totalStudents: mappedStudents.length,
    present: mappedStudents.filter((s) => s.attendance?.status === "PRESENT")
      .length,
    absent: mappedStudents.filter((s) => s.attendance?.status === "ABSENT")
      .length,
    late: mappedStudents.filter((s) => s.attendance?.status === "LATE").length,
    excused: mappedStudents.filter((s) => s.attendance?.status === "EXCUSED")
      .length,
    notMarked: mappedStudents.filter(
      (s) => s.attendance?.status === "NOT_MARKED"
    ).length,
  };

  const handleAttendanceChange = async (
    studentId: number,
    status: AttendanceStatus,
    notes?: string
  ) => {
    try {
      // Update local state immediately for UI responsiveness
      setLocalAttendanceRecords((prev) => ({
        ...prev,
        [studentId]: { status, notes: notes || "" },
      }));

      // Check if there's an existing attendance record for this student, class and date
      const existingRecord = attendanceRecords.find((record) => {
        const recordDate = new Date(record.date);
        const selectedDate = new Date(attendanceDate);

        return (
          record.studentId === studentId &&
          record.classId === parseInt(classId) &&
          recordDate.getFullYear() === selectedDate.getFullYear() &&
          recordDate.getMonth() === selectedDate.getMonth() &&
          recordDate.getDate() === selectedDate.getDate()
        );
      });

      if (existingRecord) {
        // Update existing attendance record
        const updatedAttendance = await attendanceAPI.updateAttendance(
          existingRecord.id,
          { status, notes }
        );

        // Update local attendance records
        setAttendanceRecords((prev) =>
          prev.map((record) =>
            record.id === existingRecord.id ? updatedAttendance : record
          )
        );
      } else {
        // Create new attendance record
        const newAttendance = await attendanceAPI.createAttendance({
          studentId,
          classId: parseInt(classId),
          date: attendanceDate,
          status,
          notes,
        });

        // Add to local attendance records
        setAttendanceRecords((prev) => [...prev, newAttendance]);
      }

      toast.success(`Student ${studentId} marked as ${status}`);
    } catch (error: any) {
      console.error("Failed to update attendance:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update attendance";
      toast.error(errorMessage);

      // Revert local state on error
      setLocalAttendanceRecords((prev) => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(localAttendanceRecords).length === 0) {
      toast.error("No attendance changes to save");
      return;
    }

    // setLoading(true);

    try {
      // Create attendance records for all students with local changes
      const attendanceRecordsArray = Object.entries(localAttendanceRecords).map(
        ([studentId, data]) => ({
          studentId: parseInt(studentId),
          status: data.status,
          notes: data.notes,
        })
      );

      const result = await attendanceAPI.createBulkAttendance({
        classId: parseInt(classId),
        date: attendanceDate,
        attendanceRecords: attendanceRecordsArray,
      });

      // Add to local attendance records
      setAttendanceRecords((prev) => [...prev, ...result.attendance]);

      // Clear local records after successful save
      setLocalAttendanceRecords({});
      toast.success("Attendance saved successfully");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || extractErrorMessage(error);
      console.error("Failed to save attendance:", errorMessage);
      toast.error(errorMessage);
    }
  };

  // Bulk attendance operations
  const handleMarkAllPresent = () => {
    const allPresentRecords: Record<
      number,
      { status: string; notes?: string }
    > = {};
    students.forEach((student) => {
      allPresentRecords[student.id] = { status: AttendanceStatus.PRESENT };
    });
    setLocalAttendanceRecords((prev) => ({ ...prev, ...allPresentRecords }));
    toast.success("All students marked as present");
  };

  const handleMarkAllAbsent = () => {
    const allAbsentRecords: Record<number, { status: string; notes?: string }> =
      {};
    students.forEach((student) => {
      allAbsentRecords[student.id] = { status: AttendanceStatus.ABSENT };
    });
    setLocalAttendanceRecords((prev) => ({ ...prev, ...allAbsentRecords }));
    toast.success("All students marked as absent");
  };

  // Refresh attendance data
  const refreshAttendanceData = async () => {
    try {
      const attendanceData = await attendanceAPI.getByClassIdDate(
        parseInt(classId),
        attendanceDate
      );
      setAttendanceRecords(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (error) {
      console.error("Failed to refresh attendance data:", error);
    }
  };

  // Remove attendance
  // const handleRemoveAttendance = async (attendanceId: number) => {
  //   try {
  //     await attendanceAPI.deleteAttendance(attendanceId);
  //     setAttendanceRecords((prev) =>
  //       prev.filter((record) => record.id !== attendanceId)
  //     );
  //     toast.success("Attendance record deleted");
  //   } catch (error: any) {
  //     const errorMessage =
  //       error.response?.data?.error || "Failed to delete attendance record";
  //     console.error("Failed to remove attendance:", errorMessage);
  //     toast.error(errorMessage);
  //   }
  // };

  // Calculate attendance percentage for each student
  const calculateStudentAttendancePercentage = (studentId: number) => {
    const studentRecords = attendanceRecords.filter(
      (record) => record.studentId === studentId
    );
    if (studentRecords.length === 0) return 0;

    const presentDays = studentRecords.filter(
      (record) => record.status === "PRESENT"
    ).length;
    return Math.round((presentDays / studentRecords.length) * 100);
  };

  // Table columns for individual student attendance
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "studentName",
      header: "Student Name",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="font-medium">
            {student.user?.firstname} {student.user?.lastname}
          </div>
        );
      },
    },
    {
      accessorKey: "studentId",
      header: "Student ID",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="text-sm text-muted-foreground">{student.id}</div>
        );
      },
    },
    {
      accessorKey: "attendance.status",
      header: "Attendance Status",
      cell: ({ row }) => {
        const student = row.original;
        const status = student.attendance?.status || "NOT_MARKED";
        const statusColors = {
          PRESENT: "text-green-600 bg-green-50",
          ABSENT: "text-red-600 bg-red-50",
          LATE: "text-yellow-600 bg-yellow-50",
          EXCUSED: "text-blue-600 bg-blue-50",
          NOT_MARKED: "text-gray-600 bg-gray-50",
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[status as keyof typeof statusColors]
            }`}
          >
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "attendance.date",
      header: "Date",
      cell: ({ row }) => {
        const student = row.original;
        const date = student.attendance?.date || attendanceDate;
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "attendancePercentage",
      header: "Attendance %",
      cell: ({ row }) => {
        const student = row.original;
        const percentage = calculateStudentAttendancePercentage(student.id);
        const colorClass =
          percentage >= 80
            ? "text-green-600"
            : percentage >= 60
            ? "text-yellow-600"
            : "text-red-600";

        return (
          <div className={`text-sm font-bold ${colorClass}`}>{percentage}%</div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <ActionsDropdown
            actions={[
              {
                label: "Copy student ID",
                onClick: () =>
                  navigator.clipboard.writeText(String(student.id)),
              },
              {
                label: "View student",
                onClick: () => {},
              },
              {
                label: "Mark Present",
                onClick: () =>
                  handleAttendanceChange(student.id, AttendanceStatus.PRESENT),
              },
              {
                label: "Mark Absent",
                onClick: () =>
                  handleAttendanceChange(student.id, AttendanceStatus.ABSENT),
              },
              {
                label: "Mark Late",
                onClick: () =>
                  handleAttendanceChange(student.id, AttendanceStatus.LATE),
              },
              {
                label: "Mark Excused",
                onClick: () =>
                  handleAttendanceChange(student.id, AttendanceStatus.EXCUSED),
              },
              {
                label: "Refresh Data",
                onClick: refreshAttendanceData,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Manage Attendance"}
        subtitle={"Record student attendance"}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label={"Date"}
                date={attendanceDate ? new Date(attendanceDate) : undefined}
                setDate={(date: Date | undefined) => {
                  if (date) {
                    // Use local date formatting to avoid timezone issues
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const newDate = `${year}-${month}-${day}`;
                    setAttendanceDate(newDate);
                  } else {
                    setAttendanceDate("");
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        {mappedStudents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {todayAttendanceSummary.totalStudents}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {todayAttendanceSummary.present}
                  </div>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {todayAttendanceSummary.absent}
                  </div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {todayAttendanceSummary.late}
                  </div>
                  <p className="text-sm text-muted-foreground">Late</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {todayAttendanceSummary.excused}
                  </div>
                  <p className="text-sm text-muted-foreground">Excused</p>
                </div>
              </div>
              {todayAttendanceSummary.notMarked > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>{todayAttendanceSummary.notMarked}</strong> students
                    not yet marked for attendance
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Student Attendance List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Student Attendance</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllPresent}
                >
                  Mark All Present
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAbsent}
                >
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={mappedStudents}
              searchKey="studentName"
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        {/* {mappedStudents.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/portal/attendance">Cancel</Link>
              </Button>
              {Object.keys(localAttendanceRecords).length > 0 && (
                <span className="text-sm text-orange-600 font-medium">
                  {Object.keys(localAttendanceRecords).length} unsaved changes
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                loading || Object.keys(localAttendanceRecords).length === 0
              }
            >
              {loading ? "Saving Attendance..." : "Save Attendance"}
            </Button>
          </div>
        )} */}
      </form>
    </div>
  );
}
