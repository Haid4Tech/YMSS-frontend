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
import { Class } from "@/jotai/class/class-type";
import { authPersistedAtom } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isParentAtom, isStudentAtom, isTeacherAtom } from "@/jotai/auth/auth";

import { toast } from "sonner";
import { Spinner } from "@radix-ui/themes";
import { Eye, Trash2 } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";

export default function ClassesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [classes, setClasses] = useState<Class[] | null>(null);
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

  const [auth] = useAtom(authPersistedAtom);
  const [loading] = useAtom(classLoadingAtom);
  const [error] = useAtom(classErrorAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);

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
    ? classes.filter((classItem) =>
        classItem?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewClass = (parentId: number) => {
    setLoadingStates((prev) => ({ ...prev, view: parentId }));
    router.push(`/portal/classes/${parentId}`);

    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, view: null }));
    }, 3000);
  };

  const handleDeleteClass = async (classId: number) => {
    setLoadingStates((prev) => ({ ...prev, delete: classId }));
    try {
      await classesAPI.delete(classId);
      toast.success("Class deleted successfully");
      setReload(true);
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
      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{classItem?.name}</span>

                <div className="flex md:flex-row flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewClass(classItem.id)}
                  >
                    {loadingStates.view === classItem.id ? (
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
                    onClick={() => handleDeleteClass(classItem.id)}
                  >
                    {loadingStates.delete === classItem.id ? (
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
                  <span className="font-medium">Students:</span>{" "}
                  {classItem?.students?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Subjects:</span>{" "}
                  {classItem?.subjects?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class ID:</span> {classItem?.id}
                </p>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
