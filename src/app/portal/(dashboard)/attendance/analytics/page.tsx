"use client";

import { useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/form-field";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { PageHeader } from "@/components/general/page-header";
import DatePicker from "@/components/general/date-picker";
import { classesAPI } from "@/jotai/class/class";
import { subjectsAPI } from "@/jotai/subject/subject";
import { subjectAttendanceAPI } from "@/jotai/subject-attendance/subject-attendance";
import { Subject } from "@/jotai/subject/subject-types";
import { Class } from "@/jotai/class/class-type";
import {
  AttendanceStatus,
  SubjectAttendance,
} from "@/jotai/subject-attendance/subject-attendance-type";

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

export default function AttendanceAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    rate: 0,
  });

  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesData, subjectsData] = await Promise.all([
          getAllClasses(),
          getAllSubjects(),
        ]);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [getAllClasses, getAllSubjects]);

  const fetchAttendanceStats = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !startDate || !endDate) return;

    setLoading(true);
    try {
      const classId = parseInt(selectedClass);
      const subjectId = parseInt(selectedSubject);

      // Fetch attendance data for the date range
      const startDateStr = startDate.toISOString().split("T")[0];
      // const endDateStr = endDate.toISOString().split('T')[0]; // Will be used for date range queries

      // For now, we'll fetch current date attendance and calculate stats
      // In a real implementation, you'd want to fetch data for the date range
      const attendance = await subjectAttendanceAPI.getByClassAndSubject(
        classId,
        subjectId,
        startDateStr
      );

      // Calculate statistics
      const total = attendance.length;
      const present = attendance.filter(
        (a: SubjectAttendance) => a.status === AttendanceStatus.PRESENT
      ).length;
      const absent = attendance.filter(
        (a: SubjectAttendance) => a.status === AttendanceStatus.ABSENT
      ).length;
      const late = attendance.filter(
        (a: SubjectAttendance) => a.status === AttendanceStatus.LATE
      ).length;
      const excused = attendance.filter(
        (a: SubjectAttendance) => a.status === AttendanceStatus.EXCUSED
      ).length;
      const rate = total > 0 ? (present / total) * 100 : 0;

      setAttendanceStats({
        total,
        present,
        absent,
        late,
        excused,
        rate: Math.round(rate * 100) / 100,
      });
    } catch (error) {
      console.error("Failed to fetch attendance stats:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSubject, startDate, endDate]);

  useEffect(() => {
    if (selectedClass && selectedSubject && startDate && endDate) {
      fetchAttendanceStats();
    }
  }, [
    selectedClass,
    selectedSubject,
    startDate,
    endDate,
    fetchAttendanceStats,
  ]);

  const filteredSubjects = selectedClass
    ? subjects.filter((subject) => subject.classId === parseInt(selectedClass))
    : subjects;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Analytics"
        subtitle="View comprehensive attendance statistics and trends"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField
              label="Class"
              placeholder="Select Class"
              value={selectedClass}
              onValueChange={setSelectedClass}
            >
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectField>

            <SelectField
              label="Subject"
              placeholder="Select Subject"
              value={selectedSubject}
              onValueChange={setSelectedSubject}
            >
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {filteredSubjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectField>

            <DatePicker
              label="Start Date"
              date={startDate}
              setDate={setStartDate}
            />

            <DatePicker label="End Date" date={endDate} setDate={setEndDate} />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceStats.present}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendanceStats.absent}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {attendanceStats.late}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {attendanceStats.excused}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {attendanceStats.rate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart component would go here
              <br />
              (Implement with Chart.js or Recharts)
            </div>
          </CardContent>
        </Card>

        {/* Subject Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart component would go here
              <br />
              (Implement with Chart.js or Recharts)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : attendanceStats.total > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Showing attendance data for{" "}
                {selectedClass && selectedSubject
                  ? `${
                      classes.find((c) => c.id.toString() === selectedClass)
                        ?.name
                    } - ${
                      subjects.find((s) => s.id.toString() === selectedSubject)
                        ?.name
                    }`
                  : "selected criteria"}
              </p>
              {/* Add a table component here to show recent attendance records */}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No attendance data available for the selected criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
