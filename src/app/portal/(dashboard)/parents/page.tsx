"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  parentsAPI,
  parentListAtom,
  parentLoadingAtom,
  parentErrorAtom,
} from "@/jotai/parent/parent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ParentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [parents] = useAtom(parentListAtom);
  const [loading] = useAtom(parentLoadingAtom);
  const [error] = useAtom(parentErrorAtom);
  const [, getAllParents] = useAtom(parentsAPI.getAll);

  useEffect(() => {
    getAllParents();
  }, [getAllParents]);

  const filteredParents = Array.isArray(parents)
    ? parents.filter(
        (parent) =>
          parent?.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          parent?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <p className="text-muted-foreground">Failed to load Parents. {error}</p>
        <Button onClick={() => getAllParents()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parents</h1>
          <p className="text-muted-foreground">
            Manage parent accounts and student relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/parents/new">Add Parent</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search parents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParents.map((parent) => (
          <Card key={parent?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{parent?.user?.name}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/parents/${parent?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span>{" "}
                  {parent?.user?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">User ID:</span> {parent?.userId}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Children:</span>{" "}
                  {parent?.students?.length || 0} student(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Parent ID:</span> {parent?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredParents?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No parents found matching your search."
              : "No parents registered yet."}
          </p>
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/parents/new">Add First Parent</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
