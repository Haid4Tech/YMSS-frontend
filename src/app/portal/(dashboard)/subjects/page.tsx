"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  subjectsAPI,
  subjectListAtom,
  subjectLoadingAtom,
  subjectErrorAtom,
} from "@/jotai/subject/subject";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects] = useAtom(subjectListAtom);
  const [loading] = useAtom(subjectLoadingAtom);
  const [error] = useAtom(subjectErrorAtom);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  useEffect(() => {
    getAllSubjects();
  }, [getAllSubjects]);

  const filteredSubjects = Array.isArray(subjects)
    ? subjects.filter((subject) =>
        subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Subjects. {error}
        </p>
        <Button onClick={() => getAllSubjects()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">
            Manage academic subjects and teacher assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/subjects/new">Add Subject</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{subject?.name}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/subjects/${subject?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Teacher:</span>{" "}
                  {subject?.teacher?.user?.name || "Not assigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class:</span>{" "}
                  {subject?.class?.name || "No class assigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Subject ID:</span> {subject?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSubjects?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No subjects found matching your search."
              : "No subjects created yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/subjects/new">Create First Subject</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 