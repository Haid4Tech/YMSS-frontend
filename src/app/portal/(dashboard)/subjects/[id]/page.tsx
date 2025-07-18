"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { enhancedSubjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubjectDetailPage() {
  const params = useParams();
  const subjectId = params.id as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        const [subjectData] = await Promise.all([
          enhancedSubjectsAPI.getById(parseInt(subjectId)),
        ]);

        setSubject(subjectData);
      } catch (error) {
        console.error("Failed to fetch subject data:", error);
        setSubject(null);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId && !isNaN(parseInt(subjectId))) {
      fetchSubjectData();
    } else {
      setLoading(false);
    }
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Subject not found</p>
        <Button asChild className="mt-4">
          <Link href="/portal/subjects">Back to Subjects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/subjects">← Back</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{subject.name}</h1>
            <p className="text-muted-foreground">Subject Information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Subject</Button>
          <Button>Schedule Exam</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">Enrolled Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-sm text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">N/A</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">N/A</div>
            <p className="text-sm text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "details", label: "Subject Details" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject Name</label>
                <p className="text-sm">{subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject Code</label>
                <p className="text-sm">{subject.code || "Not set"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{subject.description || "No description provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned Teacher</label>
                <p className="text-sm">{subject.teacher?.user?.name || "Not assigned"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Credits</label>
                <p className="text-sm">{subject.credits || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Advanced subject analytics and performance tracking are currently under development.
            </p>
            <p className="text-sm text-muted-foreground">
              Features like grade distribution, performance trends, and student analytics will be available soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 