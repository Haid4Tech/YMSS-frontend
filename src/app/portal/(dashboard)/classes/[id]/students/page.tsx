"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/general/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { studentsAPI } from "@/jotai/students/student";
import { subjectsAPI } from "@/jotai/subject/subject";
import { enrollmentsAPI } from "@/jotai/enrollment/enrollment";

import { CreateEnrollmentData } from "@/jotai/enrollment/enrollment-types";
import { Student } from "@/jotai/students/student-types";
import { Subject } from "@/jotai/subject/subject-types";
import { Enrollment } from "@/jotai/enrollment/enrollment-types";

import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";

type CheckboxState = {
  [studentId: number]: {
    [subjectId: number]: boolean;
  };
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const classId = parseInt(params?.id);

  const [existingEnrollments, setExistingEnrollments] = useState<
    { studentId: number; subjectId: number }[]
  >([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [checks, setChecks] = useState<CheckboxState>({});

  const [, getAllEnrollments] = useAtom(enrollmentsAPI.getAll);

  useEffect(() => {
    const fetchData = async () => {
      const [students, subjects] = await Promise.all([
        studentsAPI.getStudentsByClass(classId),
        subjectsAPI.getSubjectByClassID(classId),
      ]);

      // console.log(students);

      const studentsList = Array.isArray(students) ? students : [];
      const subjectsList = Array.isArray(subjects) ? subjects : [];

      setStudentsData(studentsList);
      setSubjectsData(subjectsList);

      const enrollments = await getAllEnrollments();
      const enrollmentPairs = enrollments.map(
        (enr: { studentId: number; subjectId: number }) => ({
          studentId: enr.studentId,
          subjectId: enr.subjectId,
        })
      );
      setExistingEnrollments(enrollmentPairs);

      const initialState: CheckboxState = {};
      studentsList.forEach((student: Student) => {
        initialState[student.id] = {};
        subjectsList.forEach((subject) => {
          const isAlreadyEnrolled = enrollmentPairs.some(
            (e: Enrollment) =>
              e.studentId === student.id && e.subjectId === subject.id
          );
          initialState[student.id][subject.id] = isAlreadyEnrolled;
        });
      });
      setChecks(initialState);
    };

    fetchData();
  }, [classId, getAllEnrollments]);

  const handleCheckChange = (studentId: number, subjectId: number) => {
    setChecks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: !prev[studentId][subjectId],
      },
    }));
  };

  const getSubjectIdsForStudent = (studentId: number): number[] => {
    const subjectChecks = checks[studentId];
    if (!subjectChecks) return [];

    return Object.entries(subjectChecks)
      .filter(([, checked]) => checked)
      .map(([subjectId]) => +subjectId);
  };

  const getAllSelectedEnrollments = () => {
    const result: Array<{ studentId: number; subjectIds: number[] }> = [];

    for (const studentId in checks) {
      const subjectIds = getSubjectIdsForStudent(+studentId);
      if (subjectIds.length > 0) {
        result.push({ studentId: +studentId, subjectIds });
      }
    }

    return result;
  };

  const handleSubmit = async (
    type: "bulk" | "single",
    studentId?: number,
    subjectIds?: number[]
  ) => {
    try {
      if (type === "single" && studentId && subjectIds?.length) {
        const payload = subjectIds
          .filter((subjectId) => {
            return !existingEnrollments.some(
              (e) => e.studentId === studentId && e.subjectId === subjectId
            );
          })
          .map((subjectId) => ({
            studentId,
            subjectId,
          }));

        await enrollmentsAPI.create(payload);
        toast.success("Student enrolled to selected subjects.");
      }

      if (type === "bulk") {
        const allEnrollments = getAllSelectedEnrollments(); // [{ studentId, subjectIds: [] }, ...]

        const payload: CreateEnrollmentData[] = allEnrollments.flatMap(
          ({ studentId, subjectIds }) =>
            subjectIds
              .filter(
                (subjectId) =>
                  !existingEnrollments.some(
                    (e) =>
                      e.studentId === studentId && e.subjectId === subjectId
                  )
              )
              .map((subjectId) => ({
                studentId,
                subjectId,
              }))
        );

        if (!payload.length) {
          toast.error("No subjects selected.");
          return;
        }

        const result = await enrollmentsAPI.create(payload);
        if ("count" in result) {
          toast.success(`${result.count} enrollment(s) created successfully.`);
        }
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error("Error enrolling student(s)", {
        description: errorMessage,
      });
    }
  };

  // Optionally extract selected data
  // const getSelectedEnrollments = () => {
  //   const selected: Array<{ studentId: number; subjectId: number }> = [];
  //   for (const studentId in checks) {
  //     for (const subjectId in checks[+studentId]) {
  //       if (checks[+studentId][+subjectId]) {
  //         selected.push({
  //           studentId: +studentId,
  //           subjectId: +subjectId,
  //         });
  //       }
  //     }
  //   }
  //   return selected;
  // };

  return (
    <div className={"space-y-8"}>
      <PageHeader
        title={"Students - Subject"}
        subtitle={"Add Student to Subject"}
      />

      <div className="flex flex-col gap-8">
        <div className="rounded-sm oveflow-hidden border-2 border-gray-300">
          <Table className="table-auto w-full text-left">
            <TableHeader>
              <TableRow className="divide-x-1 divide-gray-300">
                <TableHead className="px-4 py-2 text-sm">
                  Student Name
                </TableHead>
                {subjectsData.map((subject, index) => (
                  <TableHead
                    key={index}
                    className="px-4 py-2 text-center text-sm"
                  >
                    {subject?.name}
                  </TableHead>
                ))}
                <TableHead className="px-4 py-2 text-sm text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsData.map((student, studentIndex) => (
                <TableRow
                  key={studentIndex}
                  className="border-y-1 border-gray-300 divide-x-1 divide-gray-300"
                >
                  <TableCell className="px-4 py-2 text-sm">
                    {`${student?.user?.firstname} ${student?.user?.lastname}`}
                  </TableCell>
                  {subjectsData.map((subject, subjectIndex) => (
                    <TableCell
                      key={subjectIndex}
                      className="px-4 py-2 text-center"
                    >
                      <Checkbox
                        checked={checks[student.id]?.[subject.id] || false}
                        id={`${student.id}-${subject.id}`}
                        disabled={existingEnrollments.some(
                          (e) =>
                            e.studentId === student.id &&
                            e.subjectId === subject.id
                        )}
                        onCheckedChange={() =>
                          handleCheckChange(student.id, subject.id)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="flex items-center justify-center">
                    <Button
                      onClick={() =>
                        handleSubmit(
                          "single",
                          student.id,
                          getSubjectIdsForStudent(student.id)
                        )
                      }
                      size={"sm"}
                      className="flex flex-row gap-1"
                    >
                      <Plus size={15} />
                      <p>Add</p>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={"flex flex-row gap-2 ml-auto"}>
          <Button variant={"outline"}>Cancel</Button>
          <Button onClick={() => handleSubmit("bulk")}>
            Add Students to Subjects
          </Button>
        </div>
      </div>
    </div>
  );
}
