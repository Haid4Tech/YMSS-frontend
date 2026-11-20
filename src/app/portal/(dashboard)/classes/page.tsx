"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  classesAPI,
  classLoadingAtom,
  classErrorAtom,
} from "@/jotai/class/class";
import { Class, GRADE_LEVELS } from "@/jotai/class/class-type";
import { authPersistedAtom } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/general/confirm-dialog";
import {
  isParentAtom,
  isStudentAtom,
  isTeacherAtom,
  isAdminAtom,
} from "@/jotai/auth/auth";

import { toast } from "sonner";
import { Spinner } from "@radix-ui/themes";
import { BookOpen, Trash2, Users } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";

function gradeOrder(classItem: Class) {
  const configured = classItem.gradeLevel?.replace(/\s+/g, "").toUpperCase();
  const fromName = classItem.name.replace(/\s+/g, "").toUpperCase().match(/^(JSS[1-3]|SS[1-3])/)?.[1];
  const index = GRADE_LEVELS.findIndex(grade => grade.value === (configured || fromName));
  return index < 0 ? GRADE_LEVELS.length : index;
}

export default function ClassesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [classes, setClasses] = useState<Class[] | null>(null);
  const [reload, setReload] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<{
    add: boolean;
    delete: number | null;
  }>({
    add: false,
    delete: null,
  });

  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const [auth] = useAtom(authPersistedAtom);
  const [loading] = useAtom(classLoadingAtom);
  const [error] = useAtom(classErrorAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);
  const [isAdmin] = useAtom(isAdminAtom);

  useEffect(() => {
    if (auth?.user?.role === "ADMIN") {
      (async () => {
        const classes = await getAllClasses();
        setClasses(classes);
      })();
    }

    if (auth?.user?.role === "TEACHER") {
      (async () => {
        const classes = await getAllClasses();
        setClasses(classes);
      })();
    }
  }, [getAllClasses, auth, reload]);

  const filteredClasses = Array.isArray(classes)
    ? classes
        .filter((classItem) =>
          classItem.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
        )
        .sort((a, b) =>
          gradeOrder(a) - gradeOrder(b) ||
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }) ||
          a.id - b.id
        )
    : [];

  const classGroups = [...GRADE_LEVELS.map(grade => grade.label), "Other classes"]
    .map((grade, index) => ({
      grade,
      classes: filteredClasses.filter(classItem => gradeOrder(classItem) === index),
    }))
    .filter(group => group.classes.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isParent || isStudent || isTeacher) {
    if (filteredClasses.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No classes yet</p>
        </div>
      );
    }
  }

  if (error) {
    return (
      <div className="space-y-3 text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Classes Data. {error}
        </p>
        <Button onClick={() => getAllClasses()}>Retry</Button>
      </div>
    );
  }

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    const classId = classToDelete.id;
    setLoadingStates((prev) => ({ ...prev, delete: classId }));
    try {
      await classesAPI.delete(classId);
      toast.success("Class deleted successfully");
      setReload(true);
      setClassToDelete(null);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error("Failed to delete class record. Please try again.", {
        description: errorMessage,
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, delete: null }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            Manage class information and student assignments
          </p>
        </div>
        {isParent || isStudent || isTeacher ? (
          <></>
        ) : (
          <Button
            onClick={() => {
              setLoadingStates((prev) => ({
                ...prev,
                add: true,
              }));
              router.push("/portal/classes/new");

              setTimeout(() => {
                setLoadingStates((prev) => ({ ...prev, add: false }));
              }, 3000);
            }}
            asChild
          >
            {loadingStates.add ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <p>Add Class</p>
            )}
          </Button>
        )}
      </div>
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {/* Grade sections */}
      <div className="space-y-6">
        {classGroups.map(group => (
          <section key={group.grade} aria-labelledby={`grade-${group.grade.replace(/\s+/g, "-")}`} className="space-y-3">
            <div className="flex items-center justify-between border-y bg-muted/60 px-4 py-2">
              <h2 id={`grade-${group.grade.replace(/\s+/g, "-")}`} className="text-sm font-semibold">
                {group.grade}
              </h2>
              <span className="text-xs text-muted-foreground">
                {group.classes.length} {group.classes.length === 1 ? "class" : "classes"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {group.classes.map(classItem => (
                <Card key={classItem.id} className="relative gap-3 rounded-lg py-4 shadow-none transition-colors hover:border-primary/40">
                  <CardHeader className="flex flex-row items-start justify-between gap-2 px-4">
                    <div className="min-w-0 space-y-2">
                      <CardTitle className="truncate text-base" title={classItem.name}>
                        <Link
                          href={`/portal/classes/${classItem.id}`}
                          aria-label={`View ${classItem.name} details`}
                          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                        >
                          {classItem.name}
                        </Link>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {classItem.gradeLevel && <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{classItem.gradeLevel}</span>}
                        {classItem.stream && <span className="capitalize">{classItem.stream.toLowerCase()}</span>}
                        <span className="text-muted-foreground/70">#{classItem.id}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative z-10 size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${classItem.name}`}
                          title={`Delete ${classItem.name}`}
                          disabled={loadingStates.delete === classItem.id}
                          onClick={() => setClassToDelete(classItem)}
                        >
                          {loadingStates.delete === classItem.id ? <Spinner /> : <Trash2 className="size-4" />}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" aria-hidden="true" />
                        <span><strong className="font-semibold text-foreground">{classItem.students?.length ?? 0}</strong> students</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="size-3.5" aria-hidden="true" />
                        <span><strong className="font-semibold text-foreground">{classItem.subjects?.length ?? 0}</strong> subjects</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      {/* Empty State */}
      {filteredClasses?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No classes found matching your search."
              : "No classes created yet."}
          </p>
          {!searchTerm && (
            <div>
              {isParent || isStudent || isTeacher ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/classes/new">Create First Class</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={classToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setClassToDelete(null);
        }}
        title="Delete class"
        description={`Are you sure you want to delete "${classToDelete?.name}"? This will remove the class and cannot be undone.`}
        confirmLabel="Delete"
        loading={loadingStates.delete === classToDelete?.id}
        onConfirm={handleDeleteClass}
      />
    </div>
  );
}
