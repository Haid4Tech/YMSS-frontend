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
import { Input } from "@/components/ui/input";

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [records] = useAtom(recordListAtom);
  const [loading] = useAtom(recordLoadingAtom);
  const [error] = useAtom(recordErrorAtom);
  const [, getAllRecords] = useAtom(recordsAPI.getAll);

  useEffect(() => {
    getAllRecords();
  }, [getAllRecords]);

  const filteredRecords = Array.isArray(records)
    ? records.filter(
        (record) =>
          record?.student?.user?.name
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
        <Button asChild>
          <Link href="/portal/records/new">Create Record</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{record?.student?.user?.name}</span>
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
            <Button asChild className="mt-4">
              <Link href="/portal/records/new">Create First Record</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
