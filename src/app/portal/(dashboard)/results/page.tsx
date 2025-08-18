"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  gradesAPI,
  gradeListAtom,
  gradeLoadingAtom,
} from "@/jotai/grades/grades";
import { isParentAtom, isStudentAtom } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form-field";

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [grades] = useAtom(gradeListAtom);
  const [loading] = useAtom(gradeLoadingAtom);
  const [, getAllGrades] = useAtom(gradesAPI.getAll);
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);

  useEffect(() => {
    getAllGrades();
  }, [getAllGrades]);

  const filteredGrades = Array.isArray(grades)
    ? grades.filter(
        (grade) =>
          grade?.student?.user?.firstname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          grade?.exam?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          grade?.exam?.subject?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  if (isParent || isStudent) {
    if (filteredGrades.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No results yet</p>
        </div>
      );
    }
  }

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
          <h1 className="text-3xl font-bold">Results</h1>
          <p className="text-muted-foreground">
            Manage student grades and exam results
          </p>
        </div>

        {isParent || isStudent ? (
          <></>
        ) : (
          <Button asChild>
            <Link href="/portal/results/new">Add Grade</Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <InputField
          label=""
          placeholder="Search results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full md:w-[20rem]"
        />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrades.map((grade) => (
          <Card key={grade?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{`${grade?.student?.user?.firstname ?? "Not"} ${
                  grade?.student?.user?.lastname ?? "Available"
                }`}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/results/${grade?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Exam:</span>{" "}
                  {grade?.exam?.title || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Subject:</span>{" "}
                  {grade?.exam?.subject?.name || "Not specified"}
                </p>

                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Grade:</span>{" "}
                  <span
                    className={`font-bold ${
                      grade?.grade === "A"
                        ? "text-green-600"
                        : grade?.grade === "B"
                        ? "text-blue-600"
                        : grade?.grade === "C"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {grade?.grade || "Not graded"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredGrades?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No results found matching your search."
              : "No grades recorded yet."}
          </p>
          {!searchTerm && (
            <div>
              {isParent || isStudent ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/results/new">Record First Grade</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
