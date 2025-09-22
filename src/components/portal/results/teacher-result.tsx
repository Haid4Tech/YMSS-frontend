"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usersAPI } from "@/jotai/users/user";
import { userAtom } from "@/jotai/auth/auth";
import { subjectsAPI, subjectListAtom, subjectLoadingAtom } from "@/jotai/subject/subject";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, GraduationCap, BarChart3 } from "lucide-react";
import { Subject } from "@/jotai/subject/subject-types";

const TeacherResult = () => {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [_, getUserById] = useAtom(usersAPI.getById);
  const [subjects] = useAtom(subjectListAtom);
  const [loading] = useAtom(subjectLoadingAtom);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);
  
  const [teacherSubjects, setTeacherSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Get all subjects first
        await getAllSubjects();
      }
    };

    fetchData();
  }, [user?.id]);

  // Filter subjects for this teacher
  useEffect(() => {
    if (subjects && user) {
      const teacherSubjects = subjects.filter((subject: Subject) =>
        subject.teachers?.some(teacher => teacher.teacher.userId === user.id)
      );
      setTeacherSubjects(teacherSubjects);
    }
  }, [subjects, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subjects You Teach</h2>
          <p className="text-muted-foreground">
            Manage results for the subjects you are assigned to teach
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold">{teacherSubjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-2xl font-bold">
                  {new Set(teacherSubjects.map(s => s.classId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{teacherSubjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Grid */}
      {teacherSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherSubjects.map((subject: Subject) => (
            <Card
              key={subject.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                  <Badge variant="outline">
                    {subject.class?.name || "No Class"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {subject.description || "No description available"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">
                        Class: {subject.class?.name || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Subject Code: {subject.code || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(`/portal/results/teacher/${user?.id}?subject=${subject.id}`)
                    }
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Manage Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Subjects Assigned
            </h3>
            <p className="text-gray-500">
              You are not assigned to teach any subjects. Contact your administrator for subject assignments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { TeacherResult };
