"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  classesAPI,
  classListAtom,
  classLoadingAtom,
  classErrorAtom,
} from "@/jotai/class/class";
import { authPersistedAtom } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { teachersAPI } from "@/jotai/teachers/teachers";

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes] = useAtom(classListAtom);
  const [loading] = useAtom(classLoadingAtom);
  const [error] = useAtom(classErrorAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [auth] = useAtom(authPersistedAtom);

  const [classData, setClassData] = useState<any>(null);

  console.log("AUTH ", auth);

  useEffect(() => {
    if (auth?.user?.role === "ADMIN") {
      getAllClasses();
    }

    if (auth?.user?.role === "TEACHER") {
      (async () => {
        const teacherId = await teachersAPI.getById(1);

        console.log("TEACHES id ", teacherId);

        // if (teacherId) {
        //   const classes = await classesAPI.getById(teacherId?.id);
        //   setClassData(classes);
        // }
      })();
    }
  }, [getAllClasses, auth]);

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classItem) =>
        classItem?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Classes Data. {error}
        </p>
        <Button onClick={() => getAllClasses()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            Manage class information and student assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/classes/new">Add Class</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{classItem?.name}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/classes/${classItem?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Students:</span>{" "}
                  {classItem?.students?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Subjects:</span>{" "}
                  {classItem?.subjects?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class ID:</span> {classItem?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClasses?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No classes found matching your search."
              : "No classes created yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/classes/new">Create First Class</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
