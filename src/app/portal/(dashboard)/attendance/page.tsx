"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import { attendanceAPI } from "@/jotai/attendance/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form-field";
import { isParentAtom, isStudentAtom } from "@/jotai/auth/auth";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [classes, setClasses] = useState<Class[]>([]);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const [classesData] = await Promise.all([getAllClasses()]);
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classitem) =>
        classitem?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isParent || isStudent) {
    if (filteredClasses.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No attendance yet</p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Select class to view each students attendance record
          </p>
        </div>

        {/* {isParent || isStudent ? (
          <></>
        ) : (
          <Button asChild>
            <Link href="/portal/attendance/new">Manage Class Attendance</Link>
          </Button>
        )} */}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <InputField
          label=""
          placeholder="Search attendance..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full md:w-[20rem]"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{item.name}</span>
                <Button
                  onClick={() => router.push(`/portal/attendance/${item.id}`)}
                  asChild
                  size="sm"
                >
                  <p>Manage attendance</p>
                </Button>
              </CardTitle>
              <CardContent className="p-0 pt-5 space-y-2">
                <div className="flex flex-row items-center justify-between text-sm">
                  <p>Total Students</p>
                  <p>{item?.capacity ?? "N/A"}</p>
                </div>
                <div className="flex flex-row items-center justify-between text-sm">
                  <p>Class Teacher</p>
                  <p>{item?.teacher?.user?.name ?? "N/A"}</p>
                </div>
                <div className="flex flex-row items-center justify-between text-sm">
                  <p>Room</p>
                  <p>{item?.roomNumber ?? "N/A"}</p>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Attendance Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {record?.date
                    ? new Date(record.date).toLocaleDateString()
                    : "Not set"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`font-bold px-2 py-1 rounded-full text-xs ${
                      record?.present
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
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
      </div> */}

      {/* Empty State */}
      {filteredClasses?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No attendance records found matching your search."
              : "No attendance records yet."}
          </p>
          {!searchTerm && (
            <div>
              {isParent || isStudent ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/attendance/new">
                    Mark First Attendance
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
