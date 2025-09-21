"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  gradesAPI,
  gradeLoadingAtom,
  gradeErrorAtom,
} from "@/jotai/grades/grades";
import {
  classesAPI,
  getAllClassAtom,
  classLoadingAtom,
} from "@/jotai/class/class";
// import {
//   isParentAtom,
//   isStudentAtom,
//   isTeacherAtom,
//   isAdminAtom,
// } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";
import { Class } from "@/jotai/class/class-type";

export default function ResultsPage() {
  const router = useRouter();
  const [loading] = useAtom(gradeLoadingAtom);
  const [error] = useAtom(gradeErrorAtom);
  const [, getAllResults] = useAtom(gradesAPI.getAllResults);

  const [classes] = useAtom(getAllClassAtom);
  const [classLoading] = useAtom(classLoadingAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  // const [isParent] = useAtom(isParentAtom);
  // const [isStudent] = useAtom(isStudentAtom);
  // const [isTeacher] = useAtom(isTeacherAtom);
  // const [isAdmin] = useAtom(isAdminAtom);

  useEffect(() => {
    getAllResults();
    getAllClasses();
  }, [getAllResults, getAllClasses]);

  if (loading || classLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{extractErrorMessage(error)}</p>
        <Button onClick={() => getAllResults()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Results by Class</h1>
          <p className="text-muted-foreground">
            View and manage student results organized by class
          </p>
        </div>
        {/* {(isAdmin || isTeacher) && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/portal/results/bulk">
                <Plus className="h-4 w-4 mr-2" />
                Bulk Grade
              </Link>
            </Button>
            <Button asChild>
              <Link href="/portal/results/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Link>
            </Button>
          </div>
        )} */}
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem: Class) => {
          return (
            <Card
              key={classItem.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{classItem.name}</CardTitle>
                  <Badge variant="outline">{classItem.grade || "Class"}</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Room: {classItem.roomNumber || "N/A"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">
                        Teacher:{" "}
                        {`${classItem?.teacher?.user?.firstname ?? "Not"} ${
                          classItem?.teacher?.user?.lastname ?? "Assigned"
                        }`}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        {classItem?.students?.length ?? 0} enrolled students
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(`/portal/results/class/${classItem.id}`)
                    }
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Class Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {classes?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p>No classes found</p>
        </div>
      )}
    </div>
  );
}
