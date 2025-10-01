"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { classesAPI } from "@/jotai/class/class";
import { studentsAPI } from "@/jotai/students/student";
import { parentsAPI } from "@/jotai/parent/parent";
import {
  userAtom,
  isAdminAtom,
  isStudentAtom,
  isParentAtom,
} from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extractErrorMessage } from "@/utils/helpers";
import { Class } from "@/jotai/class/class-type";
import { BookOpen, Eye, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function RecordsPage() {
  const router = useRouter();
  const [classRecords, setClassRecords] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user] = useAtom(userAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isParent] = useAtom(isParentAtom);

  const [, getAllClasses] = useAtom(classesAPI.getAll);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch classes with their students and subjects included
      const classes = await getAllClasses();
      const allClasses = Array.isArray(classes) ? classes : [];

      // Filter classes based on user role
      let filteredClasses = allClasses;

      if (isStudent && user) {
        // Student: Show only classes they're enrolled in
        const studentData = await studentsAPI.getByUserId(user.id);
        if (studentData && studentData.classId) {
          filteredClasses = allClasses.filter(
            (c: Class) => c.id === studentData.classId
          );
        } else {
          filteredClasses = [];
        }
      } else if (isParent && user) {
        // Parent: Show only classes their children are enrolled in
        const parentData = await parentsAPI.getByUserId(user.id);
        if (parentData && parentData.students) {
          const childrenClassIds = parentData.students
            .map((student) => student.classId)
            .filter(
              (id: number | undefined): id is number =>
                id !== undefined && id !== null
            );
          filteredClasses = allClasses.filter((c: Class) =>
            childrenClassIds.includes(c.id)
          );
        } else {
          filteredClasses = [];
        }
      }
      // Admin: Show all classes (no filtering needed)

      setClassRecords(filteredClasses);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      toast.error("Failed to load academic records");
    } finally {
      setLoading(false);
    }
  };

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
        <p className="text-muted-foreground">
          Failed to load Academic Records. {error}
        </p>
        <Button onClick={fetchAllData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Academic Records</h1>
        <p className="text-muted-foreground">
          {isAdmin &&
            "Comprehensive student academic records grouped by classes showing subjects and attendance"}
          {isStudent &&
            "View your academic records including subjects and attendance"}
          {isParent &&
            "View your children's academic records including subjects and attendance"}
        </p>
      </div>

      {/* Class Records */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classRecords.map((classItem) => (
          <Card
            key={classItem.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex flex-row justify-between w-full">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {classItem.name}
                  </CardTitle>
                  <Badge variant="outline">
                    {classItem.gradeLevel
                      ? `Grade ${classItem.gradeLevel}`
                      : "Class"}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Room: {classItem.roomNumber || "N/A"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Class Statistics */}
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <p className="text-sm text-gray-600">
                      Teacher:{" "}
                      {`${classItem?.teacher?.user?.firstname ?? "Not"} ${
                        classItem?.teacher?.user?.lastname ?? "Assigned"
                      }`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="text-lg font-semibold text-primary">
                        {classItem.students?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Subjects</p>
                      <p className="text-lg font-semibold text-primary">
                        {classItem.subjects?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Subject badges */}
                  <div className="flex flex-wrap gap-1">
                    {classItem.subjects?.slice(0, 3).map((subject) => (
                      <Badge
                        key={subject.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {subject.name}
                      </Badge>
                    ))}
                    {(classItem.subjects?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(classItem.subjects?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full mt-2"
                  onClick={() =>
                    router.push(`/portal/records/class/${classItem.id}`)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Records
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {classRecords.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
            <p className="text-muted-foreground">
              No academic records available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
