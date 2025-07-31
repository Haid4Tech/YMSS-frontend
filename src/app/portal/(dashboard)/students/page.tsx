"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { isParentAtom, isStudentAtom, isTeacherAtom } from "@/jotai/auth/auth";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";

import { Spinner } from "@radix-ui/themes";
import { Eye, Trash2 } from "lucide-react";
import { SafeRender } from "@/components/ui/safe-render";

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [reload, setReload] = useState<boolean>(false);
  const [students] = useAtom(studentListAtom);
  const [loading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);
  const [loadingStates, setLoadingStates] = useState<{
    add: boolean;
    view: number | null;
    delete: number | null;
  }>({
    add: false,
    view: null,
    delete: null,
  });

  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);

  useEffect(() => {
    (() => {
      getAllStudents();
    })();
  }, [getAllStudents, reload]);

  const filteredStudents = Array.isArray(students?.students)
    ? students.students.filter(
        (student) =>
          student?.user?.firstname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (filteredStudents.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No student yet</p>
        </div>
      );
    }
  }

  const handleViewStudent = (studentId: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      view: studentId,
    }));

    router.push(`/portal/students/${studentId}`);

    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        view: null,
      }));
    }, 3000);
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await studentsAPI.delete(studentId);
      toast.success("Student deleted successfully");
      setReload(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error("Failed to delte student. Please try again later", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Manage student enrollments and information
          </p>
        </div>
        {isParent || isStudent || isTeacher ? (
          <></>
        ) : (
          <Button
            asChild
            onClick={() => {
              setLoadingStates((prev) => ({
                ...prev,
                add: true,
              }));
              router.push("/portal/students/new");

              setTimeout(() => {
                setLoadingStates((prev) => ({ ...prev, add: false }));
              }, 3000);
            }}
          >
            {loadingStates.add ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <p>Add Student</p>
            )}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    name={`${student?.user?.firstname ?? "Unknown"} ${
                      student?.user?.lastname ?? "Student"
                    }`}
                    size="lg"
                  />
                  <SafeRender fallback="Unnamed Student">
                    {`${student?.user?.firstname} ${student?.user?.lastname}`}
                  </SafeRender>
                </div>
                <div className="flex md:flex-row flex-col gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewStudent(student.id)}
                  >
                    {loadingStates.view === student.id ? (
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
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    {loadingStates.delete === student.id ? (
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
                  <span className="font-medium">Email:</span>{" "}
                  {student?.user?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Class:</span>{" "}
                  {student?.class?.name || "Not assigned"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Student ID:</span> {student?.id}
                </p>
                {student?.parent && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Parent:</span>{" "}
                    {`${student?.parent?.user?.firstname} ${student?.parent?.user?.lastname}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No students found matching your search."
              : "No students enrolled yet."}
          </p>
          {!searchTerm && (
            <div>
              {isParent || isStudent || isTeacher ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/students/new">Create First Record</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
