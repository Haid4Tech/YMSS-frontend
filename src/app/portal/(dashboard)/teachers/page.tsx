"use client";

import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  teachersAPI,
  teacherListAtom,
  teachersLoadingAtom,
  teacherErrorAtom,
} from "@/jotai/teachers/teachers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TeachersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [teachers] = useAtom(teacherListAtom);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);
  const [loading] = useAtom(teachersLoadingAtom);
  const [error] = useAtom(teacherErrorAtom);

  useEffect(() => {
    getAllTeachers();
  }, [getAllTeachers]);

  const filteredTeachers = useMemo(() => {
    if (!teachers?.teachers) return [];

    const term = searchTerm.toLowerCase();
    return teachers.teachers.filter((teacher) => {
      const name = teacher.user?.name?.toLowerCase() || "";
      const email = teacher.user?.email?.toLowerCase() || "";
      return name.includes(term) || email.includes(term);
    });
  }, [searchTerm, teachers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Teachers Data. Return to Dashboard
        </p>
        <Button onClick={() => router.push("/portal/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teaching staff and their assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/teachers/new">Add Teacher</Link>
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search teachers by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{teacher.user?.name || "Unnamed Teacher"}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/teachers/${teacher.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {teacher.user?.email || "Not provided"}
                </p>
                <p>
                  <span className="font-medium">Subject:</span> Assigned
                </p>
                <p>
                  <span className="font-medium">Phone:</span> Not provided
                </p>
                <p>
                  <span className="font-medium">Teacher ID:</span> {teacher.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No teachers found matching your search."
              : "No teachers registered yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/teachers/new">Add First Teacher</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
