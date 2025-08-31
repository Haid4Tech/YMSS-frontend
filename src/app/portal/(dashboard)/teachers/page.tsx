"use client";

import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import {
  teachersAPI,
  teacherListAtom,
  teachersLoadingAtom,
  teacherErrorAtom,
} from "@/jotai/teachers/teachers";

import { Button } from "@/components/ui/button";
import { Spinner } from "@radix-ui/themes";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";

import { Teacher } from "@/jotai/teachers/teachers-types";
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

export default function TeachersPage() {
  const router = useRouter();
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
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [teachers] = useAtom(teacherListAtom);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);
  const [loading] = useAtom(teachersLoadingAtom);
  const [error] = useAtom(teacherErrorAtom);

  useEffect(() => {
    getAllTeachers();
  }, [getAllTeachers, reload]);

  const filteredTeachers = Array.isArray(teachers?.teachers)
    ? teachers.teachers
    : [];

  // View Teacher
  const handleViewTeacher = (teacherId: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      view: teacherId,
    }));

    router.push(`/portal/teachers/${teacherId}`);

    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        view: null,
      }));
    }, 3000);
  };

  // Delete Teacher
  const handleDeleteTeacher = async (teacherId: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      delete: teacherId,
    }));
    try {
      await teachersAPI.delete(teacherId);
      toast.success(`Teacher ${teacherId} deleted successfully`);
      setReload(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to delete teacher record. Please try again later`, {
        description: errorMessage,
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        delete: null,
      }));
    }
  };

  // Teacher Table Column
  const columns: ColumnDef<Teacher>[] = [
    {
      id: "teacherImage",
      header: () => <div className="text-left">Profile Image</div>,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <PersonAvatar
            imageUrl={teacher?.user?.photo}
            name={`${teacher?.user?.firstname ?? "Unknown"} ${
              teacher?.user?.lastname ?? "Teacher"
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
      header: "Teacher ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      id: "firstName",
      header: "First Name",
      accessorFn: (row) => row.user?.firstname,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="capitalize">
            {teacher?.user?.firstname || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "lastName",
      header: "Last Name",
      accessorFn: (row) => row.user?.lastname,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="capitalize">
            {teacher?.user?.lastname || "Teacher"}
          </div>
        );
      },
    },
    {
      id: "status",
      header: () => <div className="text-center">Status</div>,
      accessorFn: (row) =>
        row.subjects?.length > 0 ? "Subject Assigned" : "Not Assigned",
      cell: ({ row }) => {
        const teacher = row.original;
        const isSubjectAssigned = teacher?.subjects?.length > 0;
        return (
          <div
            className={`px-2 py-1 rounded-full text-center text-xs font-medium ${
              isSubjectAssigned
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {isSubjectAssigned ? "Subject Assigned" : "Not Assigned"}
          </div>
        );
      },
    },
    {
      id: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown />
          </Button>
        );
      },
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
        return <div>{student?.user?.DOB || "No DOB"}</div>;
      },
    },
    {
      id: "hireDate",
      header: "Hire Date",
      accessorFn: (row) => row.hireDate,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div>
            {teacher?.hireDate
              ? new Date(teacher.hireDate).toLocaleDateString()
              : "Not set"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const teacher = row.original;

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
                  navigator.clipboard.writeText(String(teacher.id))
                }
              >
                Copy teacher ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewTeacher(teacher.id)}>
                View teacher
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDeleteTeacher(teacher.id)}
              >
                Delete teacher
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Teachers Data. Return to Dashboard
        </p>
        <Button
          onClick={() => {
            setDashboardLoading(true);
            router.push("/portal/dashboard");
          }}
          disabled={dashboardLoading}
        >
          {dashboardLoading ? (
            <div className="flex flex-row gap-2 items-center">
              Going to Dashboard... <Spinner />
            </div>
          ) : (
            "Go to Dashboard"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teaching staff and their assignments
          </p>
        </div>
        <Button
          onClick={() => {
            setLoadingStates((prev) => ({ ...prev, add: true }));
            router.push("/portal/teachers/new");

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
            <p>Add Teacher</p>
          )}
        </Button>
      </div>

      {/* Teacher Data Table */}
      <DataTable
        columns={columns}
        data={filteredTeachers}
        searchPlaceholder="Search teachers by name, email, or phone..."
        enableGlobalSearch={true}
      />
    </div>
  );
}
