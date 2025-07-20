"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// New enterprise architecture imports
import {
  useTeachers,
  useTeacherStats,
  useDeleteTeacher,
} from "@/hooks/teacher";
import { handleSuccess, useErrorHandler } from "@/utils/error";

import { TeacherFilters } from "@/types/entities/teacher";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { SafeRender } from "@/components/ui/safe-render";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function TeachersPage() {
  const router = useRouter();
  const { handleAsyncError } = useErrorHandler();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<TeacherFilters>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Enhanced data fetching with our new hooks
  const { teachers, loading, error, pagination, refresh, searchTeachers } =
    useTeachers(filters);
  const { stats, loading: statsLoading } = useTeacherStats();
  const { deleteTeacher, loading: deleteLoading } = useDeleteTeacher();

  // Optimized search with debouncing capability
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchTerm(query);

      if (query.trim().length >= 2) {
        await handleAsyncError(searchTeachers(query), "Teacher Search");
      } else if (query.trim().length === 0) {
        // Clear search results
        refresh();
      }
    },
    [searchTeachers, handleAsyncError, refresh]
  );

  // Enhanced delete with optimistic updates
  const handleDelete = useCallback(
    async (teacherId: number, teacherName: string) => {
      setDeletingId(teacherId);

      const success = await handleAsyncError(
        deleteTeacher(teacherId),
        "Delete Teacher"
      );

      if (success) {
        handleSuccess(
          `Teacher "${teacherName}" has been successfully deleted.`
        );
        refresh(); // Refresh the list
      }

      setDeletingId(null);
    },
    [deleteTeacher, handleAsyncError, refresh]
  );

  // Enhanced filtering
  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];

    let filtered = teachers;

    // Client-side search for immediate feedback
    if (searchTerm && searchTerm.length < 2) {
      const term = searchTerm.toLowerCase();
      filtered = teachers.filter((teacher) => {
        const name = teacher.user?.name?.toLowerCase() || "";
        const email = teacher.user?.email?.toLowerCase() || "";
        return name.includes(term) || email.includes(term);
      });
    }

    return filtered;
  }, [searchTerm, teachers]);

  // Enhanced loading state
  if (loading && !teachers?.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error && !teachers?.length) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Teachers
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={refresh} variant="default">
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/portal/dashboard")}
            variant="outline"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Manage teaching staff and their assignments
            </p>
            {stats && !statsLoading && (
              <div className="flex gap-2">
                <Badge variant="secondary">Total: {stats.total}</Badge>
                <Badge variant="outline">Active: {stats.active}</Badge>
                {stats.averageSubjectsPerTeacher > 0 && (
                  <Badge variant="outline">
                    Avg Subjects: {stats.averageSubjectsPerTeacher}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href="/portal/teachers/new">Add Teacher</Link>
        </Button>
      </div>

      {/* Enhanced Search with Real-time Results */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search teachers by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            Searching...
          </div>
        )}
      </div>

      {/* Enhanced Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    name={teacher.user?.name || "Unnamed Teacher"}
                    size="md"
                  />
                  <div className="flex flex-col">
                    <span className="text-base font-semibold">
                      <SafeRender fallback="Unnamed Teacher">
                        {teacher.user?.name}
                      </SafeRender>
                    </span>
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <Badge variant="secondary" className="text-xs w-fit">
                        {teacher.subjects.length} Subject
                        {teacher.subjects.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/portal/teachers/${teacher.id}`}>View</Link>
                  </Button>

                  {/* Enhanced Delete with Confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteLoading && deletingId === teacher.id}
                      >
                        {deleteLoading && deletingId === teacher.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the teacher &quot;
                          {teacher.user?.name || "Unnamed Teacher"}&quot; and
                          all associated data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(
                              teacher.id,
                              teacher.user?.name || "Unnamed Teacher"
                            )
                          }
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete Teacher
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  <span className="text-muted-foreground">
                    <SafeRender fallback="Not provided">
                      {teacher.user?.email}
                    </SafeRender>
                  </span>
                </div>

                {teacher.subjects && teacher.subjects.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.subjects.slice(0, 2).map((subject) => (
                        <Badge
                          key={subject.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {subject.name}
                        </Badge>
                      ))}
                      {teacher.subjects.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{teacher.subjects.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">ID:</span>{" "}
                  <span className="text-muted-foreground font-mono text-xs">
                    TCH-{teacher.id.toString().padStart(4, "0")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredTeachers.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? "No teachers found" : "No teachers registered yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? `No teachers match "${searchTerm}". Try adjusting your search.`
              : "Get started by adding your first teacher to the system."}
          </p>
          {searchTerm ? (
            <Button onClick={() => handleSearch("")} variant="outline">
              Clear Search
            </Button>
          ) : (
            <Button asChild>
              <Link href="/portal/teachers/new">Add First Teacher</Link>
            </Button>
          )}
        </div>
      )}

      {/* Pagination (if implemented in API) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev || loading}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: pagination.page - 1 }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext || loading}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: pagination.page + 1 }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
