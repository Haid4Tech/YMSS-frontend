"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students] = useAtom(studentListAtom);
  const [loading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);

  useEffect(() => {
    (() => {
      getAllStudents();
    })();
  }, [getAllStudents]);

  const filteredStudents = Array.isArray(students?.students)
    ? students.students.filter(
        (student) =>
          student?.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage student enrollments and information
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/students/new">Add Student</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{student?.user?.name}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/students/${student?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span>{" "}
                  {student?.user?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class:</span>{" "}
                  {student?.class?.name || "Not assigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Student ID:</span> {student?.id}
                </p>
                {student?.parent && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Parent:</span>{" "}
                    {student?.parent?.user?.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No students found matching your search."
              : "No students enrolled yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/students/new">Add First Student</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
