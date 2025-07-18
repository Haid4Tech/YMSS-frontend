"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { attendanceAPI } from "@/jotai/attendance/attendance";
import { Attendance } from "@/jotai/attendance/attendance-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await attendanceAPI.getAll();
        setAttendance(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const filteredAttendance = Array.isArray(attendance)
    ? attendance.filter(
        (record) =>
          record?.student?.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record?.lesson?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
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
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Track and manage student attendance records
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/attendance/new">Mark Attendance</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search attendance..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Attendance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAttendance.map((record) => (
          <Card key={record?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{record?.student?.user?.name}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/attendance/${record?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Lesson:</span>{" "}
                  {record?.lesson?.title || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {record?.date ? new Date(record.date).toLocaleDateString() : "Not set"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                    record?.present 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record?.present ? "Present" : "Absent"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class:</span>{" "}
                  {record?.student?.class?.name || "Not assigned"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAttendance?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No attendance records found matching your search."
              : "No attendance records yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/attendance/new">Mark First Attendance</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 