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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { SafeRender } from "@/components/ui/safe-render";
import { extractErrorMessage } from "@/utils/helpers";
import { toast } from "sonner";
import { Spinner } from "@radix-ui/themes";
import { Eye, Trash2 } from "lucide-react";

export default function ParentsPage() {
  const router = useRouter();
  const [reload, setReload] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [parents] = useAtom(parentListAtom);
  const [loadingStates, setLoadingStates] = useState<{
    view: number | null;
    delete: number | null;
  }>({
    view: null,
    delete: null,
  });
  const [loading] = useAtom(parentLoadingAtom);
  const [error] = useAtom(parentErrorAtom);

  const [, getAllParents] = useAtom(parentsAPI.getAll);

  useEffect(() => {
    getAllParents();
  }, [getAllParents, reload]);

  const filteredParents = Array.isArray(parents)
    ? parents.filter(
        (parent) =>
          parent?.user?.firstname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          parent?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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

  const handleViewParent = (parentId: number) => {
    setLoadingStates((prev) => ({ ...prev, view: parentId }));
    router.push(`/portal/parents/${parentId}`);

    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, view: null }));
    }, 3000);
  };

  const handleDeleteParent = async (parentId: number) => {
    setLoadingStates((prev) => ({ ...prev, delete: parentId }));
    try {
      await parentsAPI.delete(parentId);
      toast.success("Parent deleted successfully");
      setReload(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error("Failed to delete parent record. Please try again.", {
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
          <h1 className="text-3xl font-bold">Parents</h1>
          <p className="text-muted-foreground">
            Manage parent accounts and student relationships
          </p>
        </div>
        {/* <Button asChild>
          <Link href="/portal/parents/new">Add Parent</Link>
        </Button> */}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search parents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParents.map((parent) => (
          <Card key={parent?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <SafeRender fallback="Unnamed Student">
                  {`${parent?.user?.firstname} ${parent?.user?.lastname}`}
                </SafeRender>

                <div className="flex md:flex-row flex-col gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewParent(parent.id)}
                  >
                    {loadingStates.view === parent.id ? (
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
                    onClick={() => handleDeleteParent(parent.id)}
                  >
                    {loadingStates.delete === parent.id ? (
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
                  {parent?.user?.email}
                </p>

                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Children:</span>{" "}
                  {parent?.students?.length || 0} student(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">User ID:</span> {parent?.userId}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Parent ID:</span> {parent?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredParents?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No parents found matching your search."
              : "No parents registered yet."}
          </p>
          {/* {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/parents/new">Add First Parent</Link>
            </Button>
          )} */}
        </div>
      )}
    </div>
  );
}
