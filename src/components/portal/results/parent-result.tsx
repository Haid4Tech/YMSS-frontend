"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { usersAPI } from "@/jotai/users/user";
import { userAtom } from "@/jotai/auth/auth";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import {
  gradesAPI,
  // gradeListAtom,
  gradeLoadingAtom,
} from "@/jotai/grades/grades";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { Student } from "@/jotai/students/student-types";
// import { Grade } from "@/jotai/grades/grades-types";

const ParentResult = () => {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  // const [, getUserById] = useAtom(usersAPI.getById);
  const [students] = useAtom(studentListAtom);
  const [studentLoading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);
  // const [results] = useAtom(gradeListAtom);
  const [gradeLoading] = useAtom(gradeLoadingAtom);
  const [, getAllResults] = useAtom(gradesAPI.getAllResults);

  const [wards, setWards] = useState<Student[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await getAllStudents();
        await getAllResults();
      }
    };

    fetchData();
  }, [user?.id]);

  // Filter wards for this parent
  useEffect(() => {
    if (students?.students && user) {
      const parentWards = students.students.filter((student: Student) =>
        student.parents?.some((parent) => parent.parent.userId === user.id)
      );
      setWards(parentWards);
    }
  }, [students, user?.id]);

  if (studentLoading || gradeLoading) {
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
          <h2 className="text-2xl font-bold">Your Ward&apos;s Results</h2>
          <p className="text-muted-foreground">
            View academic results for your children
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Wards</p>
                <p className="text-2xl font-bold">{wards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-2xl font-bold">
                  {new Set(wards.map((w) => w.classId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{wards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wards Grid */}
      {wards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wards.map((ward: Student) => (
            <Card
              key={ward.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {ward.user?.firstname} {ward.user?.lastname}
                  </CardTitle>
                  <Badge variant="outline">
                    {ward.class?.name || "No Class"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{ward.user?.email}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">
                        Class: {ward.class?.name || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Admission Date:{" "}
                        {/* {new Date(ward.admissionDate).toLocaleDateString()} */}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(
                        `/portal/results/parent/${user?.id}?ward=${ward.id}`
                      )
                    }
                  >
                    <Award className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Wards Found
            </h3>
            <p className="text-gray-500">
              No students are associated with your account. Contact your
              administrator if this is an error.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { ParentResult };
