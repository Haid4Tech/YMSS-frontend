"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddGradePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/grades">← Back to Grades</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add Grade</h1>
            <p className="text-muted-foreground">
              This page is under development
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Entry</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Grade entry functionality is currently under development.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back later for the complete grade management system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
