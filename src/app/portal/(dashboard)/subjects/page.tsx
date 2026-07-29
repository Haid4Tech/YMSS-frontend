"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Spinner } from "@radix-ui/themes";
import {
  isParentAtom,
  isStudentAtom,
  isTeacherAtom,
  isAdminAtom,
} from "@/jotai/auth/auth";
import { DataTable } from "@/components/general/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import { TooltipComp } from "@/components/ui/tooltip-comp";

import { MoreHorizontal } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";
import { Subject, SUBJECT_CATEGORIES } from "@/jotai/subject/subject-types";

export default function SubjectsPage() {
  const router = useRouter();
  const [retryLoading, setRetryLoading] = useState<boolean>(false);

  const [reload, setReload] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<{
    add: boolean;
    view: number | null;
    delete: number | null;
  }>({
    add: false,
    view: null,
    delete: null,
  });

  const [subjects] = useAtom(subjectListAtom);
  const [loading] = useAtom(subjectLoadingAtom);
  const [error] = useAtom(subjectErrorAtom);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);
  const [isAdmin] = useAtom(isAdminAtom);

  // Column definitions for subjects table
  const subjectColumns: ColumnDef<Subject>[] = [
    {
      accessorKey: "name",
      header: "Subject Name",
      cell: ({ row }) => {
        const subject = row.original;
        return <div className="font-medium">{subject.name}</div>;
      },
    },
      {
        id: "class",
        header: ({ column }) => {
          return (
            <TooltipComp
              trigger={
                <div
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                >
                  Class
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              }
              content={"Sort By Classes"}
            />
          );
        },
      accessorFn: (row) => row.class?.name,
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="ml-3 uppercase">
            {subject?.class?.name || "No Class"}
          </div>
        );
      },
    },
    {
      accessorKey: "weeklyHours",
      header: "Weekly Hours",
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="text-sm">
            {subject.weeklyHours ? `${subject.weeklyHours}h` : "Not specified"}
          </div>
        );
      },
    },
    {
      accessorKey: "teachers",
      header: "Assigned Teachers",
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="text-sm">
            {subject.teachers && subject.teachers.length > 0
              ? subject.teachers.map((teacher, index) => (
                  <div key={index} className="text-sm">
                    {`${teacher?.teacher?.user?.firstname} ${teacher?.teacher?.user?.lastname}`}
                  </div>
                ))
              : "Not Assigned"}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="border h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(subject.id.toString())
                }
              >
                Copy subject ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewSubject(subject.id)}>
                View subject
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/portal/subjects/${subject.id}/edit`)
                    }
                  >
                    Edit subject
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    Delete subject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllSubjects();
  }, [getAllSubjects, reload]);

  const allSubjects = Array.isArray(subjects) ? subjects : [];
  const filteredSubjects = searchTerm
    ? allSubjects.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allSubjects;

  const subjectGroups = [
    ...SUBJECT_CATEGORIES.map(({ value, label }) => ({
      key: value,
      label: `${label} Subjects`,
      subjects: filteredSubjects.filter((s) => s.category === value),
    })),
    {
      key: "UNCATEGORIZED",
      label: "Uncategorized Subjects",
      subjects: filteredSubjects.filter((s) => !s.category),
    },
  ].filter((group) => group.subjects.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isParent || isStudent || isTeacher) {
    if (filteredSubjects.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No Subjects yet</p>
        </div>
      );
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Subjects. {error}
        </p>
        <Button
          onClick={async () => {
            setRetryLoading(true);
            try {
              await getAllSubjects();
            } finally {
              setRetryLoading(false);
            }
          }}
          disabled={retryLoading}
        >
          {retryLoading ? (
            <div className="flex flex-row gap-2 items-center">
              Retrying... <Spinner />
            </div>
          ) : (
            "Retry"
          )}
        </Button>
      </div>
    );
  }

  const handleViewSubject = (subjectId: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      view: subjectId,
    }));

    router.push(`/portal/subjects/${subjectId}`);

    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        view: null,
      }));
    }, 3000);
  };

  const handleDeleteSubject = async (subjectId: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      delete: subjectId,
    }));
    try {
      await subjectsAPI.delete(subjectId);
      toast.success(`Subject ${subjectId} deleted successfully`);
      setReload(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to delete subject record. Please try again later`, {
        description: errorMessage,
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        delete: null,
      }));
    }
  };

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

        {isParent || isStudent || isTeacher ? (
          <></>
        ) : (
          <Button
            asChild
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, add: true }));
              router.push("/portal/subjects/new");

              // setTimeout(() => {
              //   setLoadingStates((prev) => ({ ...prev, add: false }));
              // }, 3000);
            }}
          >
            {loadingStates.add ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <p>Add Subject</p>
            )}
          </Button>
        )}
      </div>

      {/* Search across all streams */}
      <Input
        placeholder="Search subjects by name or class..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {/* Subjects grouped by academic stream */}
      {allSubjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subjects created yet.</p>
          <div>
            {isParent || isStudent || isTeacher ? (
              <></>
            ) : (
              <Button asChild className="mt-4">
                <Link href="/portal/subjects/new">Create First Subject</Link>
              </Button>
            )}
          </div>
        </div>
      ) : subjectGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No subjects found matching your search.
          </p>
        </div>
      ) : (
        subjectGroups.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{group.label}</span>
                <div className="text-sm text-muted-foreground">
                  {group.subjects.length} subject
                  {group.subjects.length !== 1 ? "s" : ""}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={subjectColumns}
                data={group.subjects}
                hideSearchBar
              />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
