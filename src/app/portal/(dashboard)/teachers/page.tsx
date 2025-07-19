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
import { Spinner } from "@radix-ui/themes";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { SafeRender } from "@/components/ui/safe-render";

export default function TeachersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(false);

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
      const employeeId = teacher.employeeId?.toLowerCase() || "";
      return (
        name.includes(term) || email.includes(term) || employeeId.includes(term)
      );
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
        <Button
          onClick={() => {
            setDashboardLoading(true);
            router.push("/portal/dashboard");
          }}
          disabled={dashboardLoading}
        >
          {dashboardLoading ? (
            <div className="flex flex-row gap-2 items-center">
              Going to Dashboard... <Spinner />
            </div>
          ) : (
            "Go to Dashboard"
          )}
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
        placeholder="Search teachers by name, email, or employee ID..."
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
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    name={teacher.user?.name || "Unnamed Teacher"}
                    size="md"
                  />
                  <span>
                    <SafeRender fallback="Unnamed Teacher">
                      {teacher.user?.name}
                    </SafeRender>
                  </span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/teachers/${teacher.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <SafeRender fallback="Not provided">
                    {teacher.user?.email}
                  </SafeRender>
                </p>
                <p>
                  <span className="font-medium">Subject:</span>{" "}
                  <SafeRender fallback="Not assigned">
                    {teacher.subject?.name}
                  </SafeRender>
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  <SafeRender fallback="Not provided">
                    {teacher.phone}
                  </SafeRender>
                </p>
                <p>
                  <span className="font-medium">Employee ID:</span>{" "}
                  <SafeRender fallback={`TCH-${teacher.id}`}>
                    {teacher.employeeId}
                  </SafeRender>
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
