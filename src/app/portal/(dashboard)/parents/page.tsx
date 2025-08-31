"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  parentsAPI,
  parentListAtom,
  parentLoadingAtom,
  parentErrorAtom,
} from "@/jotai/parent/parent";
import { Button } from "@/components/ui/button";

import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { cn } from "@/lib/utils";

import { Parent } from "@/jotai/parent/parent-types";
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

export default function ParentsPage() {
  const router = useRouter();
  const [reload, setReload] = useState<boolean>(false);
  const [parents] = useAtom(parentListAtom);
  const [loading] = useAtom(parentLoadingAtom);
  const [error] = useAtom(parentErrorAtom);

  const [, getAllParents] = useAtom(parentsAPI.getAll);

  useEffect(() => {
    getAllParents();
  }, [getAllParents, reload]);

  const filteredParents = Array.isArray(parents) ? parents : [];

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
        <p className="text-muted-foreground">Failed to load Parents. {error}</p>
        <Button onClick={() => getAllParents()}>Retry</Button>
      </div>
    );
  }

  // View Parent
  const handleViewParent = (parentId: number) => {
    router.push(`/portal/parents/${parentId}`);
  };

  // Delete Parent
  const handleDeleteParent = async (parentId: number) => {
    try {
      await parentsAPI.delete(parentId);
      toast.success("Parent deleted successfully");
      setReload(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error("Failed to delete parent record. Please try again.", {
        description: errorMessage,
      });
    }
  };

  // Parent Table Column
  const columns: ColumnDef<Parent>[] = [
    {
      id: "parentImage",
      header: () => <div className="text-left">Profile Image</div>,
      cell: ({ row }) => {
        const parent = row.original;
        return (
          <PersonAvatar
            imageUrl={parent?.user?.photo}
            name={`${parent?.user?.firstname ?? "Unknown"} ${
              parent?.user?.lastname ?? "Parent"
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
      header: "Parent ID",
      cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
    },
    {
      id: "firstName",
      header: "First Name",
      accessorFn: (row) => row.user?.firstname,
      cell: ({ row }) => {
        const parent = row.original;
        return (
          <div className="capitalize">
            {parent?.user?.firstname || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "lastName",
      header: "Last Name",
      accessorFn: (row) => row.user?.lastname,
      cell: ({ row }) => {
        const parent = row.original;
        return (
          <div className="capitalize">
            {parent?.user?.lastname || "Teacher"}
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
        const teacher = row.original;
        return (
          <div className="lowercase">{teacher?.user?.email || "No email"}</div>
        );
      },
    },
    {
      id: "gender",
      header: "Gender",
      accessorFn: (row) => row.user?.gender,
      cell: ({ row }) => {
        const parent = row.original;
        return (
          <div className="capitalize">{parent?.user?.gender || "Unknown"}</div>
        );
      },
    },
    {
      id: "status",
      header: () => <div className="text-center">No. of Students</div>,
      cell: ({ row }) => {
        const parent = row.original;
        const noOfStudents = parent?.students?.length;
        return (
          <div className={"text-center"}>
            <span
              className={cn(
                noOfStudents > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800",
                "px-3 py-2  text-xs font-medium rounded-full"
              )}
            >
              {noOfStudents}
            </span>
          </div>
        );
      },
    },
    {
      id: "phone",
      header: "Phone Number",
      accessorFn: (row) => row.user?.phone,
      cell: ({ row }) => {
        const parent = row.original;
        return (
          <div className="capitalize">
            {parent?.user?.phone || "No phone number"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const parent = row.original;

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
                onClick={() => navigator.clipboard.writeText(String(parent.id))}
              >
                Copy parent ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewParent(parent.id)}>
                View parent
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDeleteParent(parent.id)}
              >
                Delete parent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parents</h1>
          <p className="text-muted-foreground">
            Manage parent accounts and student relationships
          </p>
        </div>
        {/* <Button asChild>
          <Link href="/portal/parents/new">Add Parent</Link>
        </Button> */}
      </div>

      {/* Parent Data Table */}
      <DataTable
        columns={columns}
        data={filteredParents}
        searchPlaceholder="Search parents by name, email, or phone..."
        enableGlobalSearch={true}
      />
    </div>
  );
}
