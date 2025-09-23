/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
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
import { ArrowUpDown } from "lucide-react";

import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

export default function MarkAttendancePage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId as string;

  const [loading, setLoading] = useState(false);
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
    const currentAttendanceRecord = attendanceRecords.find(
      (record) =>
        record.studentId === student.id &&
        record.classId === parseInt(classId) &&
        new Date(record.date).toDateString() === new Date(attendanceDate).toDateString()
    );

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

  // Calculate attendance summary
  const attendanceSummary = {
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
      const existingRecord = attendanceRecords.find(
        (record) =>
          record.studentId === studentId &&
          record.classId === parseInt(classId) &&
          new Date(record.date).toDateString() === new Date(attendanceDate).toDateString()
      );

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

    setLoading(true);

    try {
      // Create attendance records for all students with local changes
      const attendanceRecordsArray = Object.entries(
        localAttendanceRecords
      ).map(([studentId, data]) => ({
        studentId: parseInt(studentId),
        status: data.status,
        notes: data.notes,
      }));

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
    } finally {
      setLoading(false);
    }
  };

  // Bulk attendance operations
  const handleMarkAllPresent = () => {
    const allPresentRecords: Record<number, { status: string; notes?: string }> = {};
    students.forEach((student) => {
      allPresentRecords[student.id] = { status: AttendanceStatus.PRESENT };
    });
    setLocalAttendanceRecords((prev) => ({ ...prev, ...allPresentRecords }));
    toast.success("All students marked as present");
  };

  const handleMarkAllAbsent = () => {
    const allAbsentRecords: Record<number, { status: string; notes?: string }> = {};
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
  const handleRemoveAttendance = async (attendanceId: number) => {
    try {
      await attendanceAPI.deleteAttendance(attendanceId);
      setAttendanceRecords((prev) =>
        prev.filter((record) => record.id !== attendanceId)
      );
      toast.success("Attendance record deleted");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete attendance record";
      console.error("Failed to remove attendance:", errorMessage);
      toast.error(errorMessage);
    }
  };

  // Table Header
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "student_id",
      header: "Student ID",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("student_id")}</div>
      ),
    },
    {
      id: "firstname",
      header: "First Name",
      accessorFn: (row) => row.user?.firstname,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="capitalize">
            {student?.user?.firstname || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "lastName",
      header: "Last Name",
      accessorFn: (row) => row.user?.lastname,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="capitalize">
            {student?.user?.lastname || "Student"}
          </div>
        );
      },
    },
    {
      id: "class",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Class
            <ArrowUpDown />
          </Button>
        );
      },
      accessorFn: (row) => row.class?.name,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="ml-3 uppercase">
            {student?.class?.name || "No Class"}
          </div>
        );
      },
    },
    {
      id: "attendanceStatus",
      header: () => <div className="text-center">Attendance Status</div>,
      accessorFn: (row) => row.attendance?.status,
      cell: ({ row }) => {
        const student = row.original;
        const status = student?.attendance?.status || "NOT_MARKED";

        const getStatusColor = (status: string) => {
          switch (status) {
            case "PRESENT":
              return "bg-green-100 text-green-800 border-green-200";
            case "ABSENT":
              return "bg-red-100 text-red-800 border-red-200";
            case "LATE":
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "EXCUSED":
              return "bg-purple-100 text-purple-800 border-purple-200";
            default:
              return "bg-gray-100 text-gray-800 border-gray-200";
          }
        };

        return (
          <div className="flex justify-center">
            <div
              className={`px-3 py-1 rounded-full text-center text-xs font-medium border ${getStatusColor(
                status
              )}`}
            >
              {status.replace("_", " ")}
            </div>
          </div>
        );
      },
    },
    {
      id: "attendanceDate",
      header: "Date",
      accessorFn: (row) => row.attendance?.date,
      cell: ({ row }) => {
        const student = row.original;
        const date = student?.attendance?.date;
        return <div>{date ? new Date(date).toLocaleDateString() : "N/A"}</div>;
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
                  const newDate = date ? date.toISOString().split("T")[0] : "";
                  setAttendanceDate(newDate);
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
                    {attendanceSummary.totalStudents}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendanceSummary.present}
                  </div>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendanceSummary.absent}
                  </div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {attendanceSummary.late}
                  </div>
                  <p className="text-sm text-muted-foreground">Late</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {attendanceSummary.excused}
                  </div>
                  <p className="text-sm text-muted-foreground">Excused</p>
                </div>
              </div>
              {attendanceSummary.notMarked > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>{attendanceSummary.notMarked}</strong> students not
                    yet marked for attendance
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
              searchKey="firstname"
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>

        {/* Existing Attendance Records */}
        {attendanceRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Existing Attendance Records for{" "}
                {new Date(attendanceDate).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {record.student?.user?.firstname} {record.student?.user?.lastname}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {record.status} | Date:{" "}
                          {new Date(record.date).toLocaleDateString()}
                          {record.notes && ` | Notes: ${record.notes}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAttendance(record.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        {mappedStudents.length > 0 && (
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
        )}
      </form>
    </div>
  );
}