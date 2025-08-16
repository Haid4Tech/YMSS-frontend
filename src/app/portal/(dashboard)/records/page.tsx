"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  recordsAPI,
  recordListAtom,
  recordLoadingAtom,
  recordErrorAtom,
} from "@/jotai/record/record";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form-field";
import { isParentAtom, isStudentAtom, isTeacherAtom } from "@/jotai/auth/auth";

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records] = useAtom(recordListAtom);
  const [loading] = useAtom(recordLoadingAtom);
  const [error] = useAtom(recordErrorAtom);
  const [, getAllRecords] = useAtom(recordsAPI.getAll);
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);

  useEffect(() => {
    getAllRecords();
  }, [getAllRecords]);

  const filteredRecords = Array.isArray(records)
    ? records.filter(
        (record) =>
          record?.student?.user?.firstname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record?.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isParent || isStudent || isTeacher) {
    if (filteredRecords.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No records yet</p>
        </div>
      );
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Academic Records. {error}
        </p>
        <Button onClick={() => getAllRecords()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Records</h1>
          <p className="text-muted-foreground">
            Manage student academic records and transcripts
          </p>
        </div>

        {isParent || isStudent || isTeacher ? (
          <></>
        ) : (
          <Button asChild>
            <Link href="/portal/records/new">Create Record</Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <InputField
          label=""
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full md:w-[20rem]"
        />
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{`${record?.student?.user?.firstname ?? "Not"} ${
                  record?.student?.user?.lastname ?? "Available"
                }`}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/records/${record?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Year:</span>{" "}
                  {record?.year || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Term:</span>{" "}
                  {record?.term || "Not specified"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class:</span>{" "}
                  {record?.student?.class?.name || "Not assigned"}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  <span className="font-medium">Summary:</span>{" "}
                  {record?.summary || "No summary available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Record ID:</span> {record?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No academic records found matching your search."
              : "No academic records created yet."}
          </p>
          {!searchTerm && (
            <div>
              {isParent || isStudent || isTeacher ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/records/new">Create First Record</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
