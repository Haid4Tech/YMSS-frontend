"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  examsAPI,
  examListAtom,
  examLoadingAtom,
  examErrorAtom,
} from "@/jotai/exams/exams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exams] = useAtom(examListAtom);
  const [loading] = useAtom(examLoadingAtom);
  const [error] = useAtom(examErrorAtom);
  const [, getAllExams] = useAtom(examsAPI.getAll);

  useEffect(() => {
    getAllExams();
  }, [getAllExams]);

  const filteredExams = Array.isArray(exams)
    ? exams.filter(
        (exam) =>
          exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <p className="text-muted-foreground">Failed to load Exams. {error}</p>
        <Button onClick={() => getAllExams()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exams</h1>
          <p className="text-muted-foreground">
            Manage exam schedules and assessment information
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/exams/new">Schedule Exam</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <Card key={exam?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{exam?.title}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/exams/${exam?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Subject:</span>{" "}
                  {exam?.subject?.name || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {exam?.date
                    ? new Date(exam.date).toLocaleDateString()
                    : "Not scheduled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class:</span>{" "}
                  {exam?.class?.name || "Not assigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Exam ID:</span> {exam?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredExams?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No exams found matching your search."
              : "No exams scheduled yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/exams/new">Schedule First Exam</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
