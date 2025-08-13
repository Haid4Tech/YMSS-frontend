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
import { Spinner } from "@radix-ui/themes";
import { Input } from "@/components/ui/input";
import { isParentAtom, isStudentAtom, isTeacherAtom } from "@/jotai/auth/auth";

import { Eye, Trash2 } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";

export default function SubjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
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

  useEffect(() => {
    getAllSubjects();
  }, [getAllSubjects, reload]);

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

                <div className="flex flex-col md:flex-row gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSubject(subject.id)}
                  >
                    {loadingStates.view === subject.id ? (
                      <div>
                        <Spinner />
                      </div>
                    ) : (
                      <div className="flex flex-row gap-1">
                        <p className="block md:hidden text-sm">View</p>
                        <Eye size={12} />
                      </div>
                    )}
                  </Button>
                  <Button
                    size={"sm"}
                    variant={"destructive"}
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    {loadingStates.delete === subject.id ? (
                      <div>
                        <Spinner />
                      </div>
                    ) : (
                      <div className="flex flex-row gap-1">
                        <p className="block md:hidden text-sm">Delete</p>
                        <Trash2 size={12} />
                      </div>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Teacher:</span>{" "}
                  {`${subject?.teacher?.user?.firstname ?? "Not"} ${
                    subject?.teacher?.user?.lastname ?? "Assigned"
                  }`}
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
            <div>
              {isParent || isStudent || isTeacher ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/subjects/new">Create First Record</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
