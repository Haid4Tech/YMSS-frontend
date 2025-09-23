"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { isParentAtom, isStudentAtom, isTeacherAtom } from "@/jotai/auth/auth";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";
import { TooltipComp } from "@/components/ui/tooltip-comp";

import { Spinner } from "@radix-ui/themes";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Student } from "@/jotai/students/student-types";
import { DataTable } from "@/components/general/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";

export default function StudentsPage() {
  const router = useRouter();
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
    ? students.students
    : [];

  // handle Student View
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

  // Define columns inside component to access handler functions
  const columns: ColumnDef<Student>[] = [
    {
      id: "studentImage",
      header: () => <div className="text-left">Profile Image</div>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <PersonAvatar
            imageUrl={student?.user?.photo}
            name={`${student?.user?.firstname ?? "Unknown"} ${
              student?.user?.lastname ?? "Student"
            }`}
            size="lg"
          />
        );
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Student ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      id: "firstName",
      header: "First Name",
      accessorFn: (row) => row.user?.firstname,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="capitalize">
            {student?.user?.firstname || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "lastName",
      header: "Last Name",
      accessorFn: (row) => row.user?.lastname,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="capitalize">
            {student?.user?.lastname || "Student"}
          </div>
        );
      },
    },
    {
      id: "class",
      header: ({ column }) => {
        return (
          <TooltipComp
            trigger={
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Class
                <ArrowUpDown />
              </Button>
            }
            content={"Sort By Classes"}
          />
        );
      },
      accessorFn: (row) => row.class?.name,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="capitalize text-left ml-5">
            {student?.class?.name || "Not assigned"}
          </div>
        );
      },
    },
    {
      id: "status",
      header: () => <div className="text-center">Status</div>,
      accessorFn: (row) =>
        row.enrollments?.length > 0 ? "Enrolled" : "Not Enrolled",
      cell: ({ row }) => {
        const student = row.original;
        const isEnrolled = student?.enrollments?.length > 0;
        return (
          <div
            className={`px-2 py-1 rounded-full text-center text-xs font-medium ${
              isEnrolled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isEnrolled ? "Enrolled" : "Not Enrolled"}
          </div>
        );
      },
    },
    {
      id: "enrollments",
      header: () => <div className="text-center">Enrollments</div>,
      accessorFn: (row) => row.enrollments?.length || 0,
      cell: ({ row }) => {
        const student = row.original;
        const count = student?.enrollments?.length || 0;
        return (
          <div className="text-center">
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {count}
            </span>
          </div>
        );
      },
    },
    {
      id: "email",
      header: "Email",
      accessorFn: (row) => row.user?.email,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="lowercase">{student?.user?.email || "No email"}</div>
        );
      },
    },
    {
      id: "dob",
      header: "DOB",
      accessorFn: (row) => row.user.DOB,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div>
            {new Date(student?.user?.DOB).toLocaleDateString() || "No DOB"}
          </div>
        );
      },
    },
    {
      id: "admissionDate",
      header: "Admission Date",
      accessorFn: (row) => row.admissionDate,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div>
            {student?.admissionDate
              ? new Date(student.admissionDate).toLocaleDateString()
              : "Not set"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="border h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(student.id))
                }
              >
                Copy student ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                View student
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDeleteStudent(student.id)}
              >
                Delete student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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

      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search students by name, email, or class..."
        enableGlobalSearch={true}
      />
    </div>
  );
}
