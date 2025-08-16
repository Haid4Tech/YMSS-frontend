"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import {
  announcementsAPI,
  announcementListAtom,
  announcementLoadingAtom,
  announcementErrorAtom,
} from "@/jotai/announcement/announcement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form-field";
import { isParentAtom, isStudentAtom, isTeacherAtom } from "@/jotai/auth/auth";

import { Trash2 } from "lucide-react";
import { extractErrorMessage } from "@/utils/helpers";
import { Spinner } from "@radix-ui/themes";
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
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

  const [announcements] = useAtom(announcementListAtom);
  const [loading] = useAtom(announcementLoadingAtom);
  const [error] = useAtom(announcementErrorAtom);
  const [, getAllAnnouncements] = useAtom(announcementsAPI.getAll);
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);

  useEffect(() => {
    getAllAnnouncements();
  }, [getAllAnnouncements, reload]);

  const filteredAnnouncements = Array.isArray(announcements)
    ? announcements.filter(
        (announcement) =>
          announcement?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          announcement?.content
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
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
    if (filteredAnnouncements.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No announcement yet</p>
        </div>
      );
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Announcements. {error}
        </p>
        <Button onClick={() => getAllAnnouncements()}>Retry</Button>
      </div>
    );
  }

  // const handleViewAnnouncement = (annoucementId: number) => {
  //     setLoadingStates((prev) => ({
  //       ...prev,
  //       view: annoucementId,
  //     }));

  //     router.push(`/portal/annoucement/${annoucementId}`);

  //     setTimeout(() => {
  //       setLoadingStates((prev) => ({
  //         ...prev,
  //         view: null,
  //       }));
  //     }, 3000);
  //   };

  const handleDeleteAnnouncement = async (annoucementId: number) => {
    setLoadingStates((prev) => ({
      ...prev,
      delete: annoucementId,
    }));
    try {
      await announcementsAPI.delete(annoucementId);
      toast.success(`Annoucement ${annoucementId} deleted successfully`);
      setReload(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(`Failed to delete announcement. Please try again later`, {
        description: errorMessage,
      });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        delete: null,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Manage school announcements and notices
          </p>
        </div>

        {isParent || isStudent || isTeacher ? (
          <></>
        ) : (
          <Button
            asChild
            onClick={() => {
              setLoadingStates((prev) => ({ ...prev, add: true }));
              router.push("announcements/new");

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
              <p>Create Announcement</p>
            )}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <InputField
          label={""}
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full md:w-[20rem]"
        />
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{announcement?.title}</span>

                <div className="flex flex-col md:flex-row gap-2">
                  {/* <Button
                    asChild
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewAnnouncement(announcement.id)}
                  >
                    {loadingStates.view === announcement.id ? (
                      <div>
                        <Spinner />
                      </div>
                    ) : (
                      <div className="flex flex-row gap-1">
                        <p className="block md:hidden text-sm">View</p>
                        <Eye size={12} />
                      </div>
                    )}
                  </Button> */}
                  <Button
                    size={"sm"}
                    variant={"destructive"}
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    {loadingStates.delete === announcement.id ? (
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
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {announcement?.content || "No content"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Created:</span>{" "}
                  {announcement?.createdAt
                    ? new Date(announcement.createdAt).toLocaleDateString()
                    : "Not set"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Author:</span>{" "}
                  {`${announcement?.author?.firstname ?? "Not"} ${
                    announcement?.author?.lastname
                  }`}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">ID:</span> {announcement?.id}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnnouncements?.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "No announcements found matching your search."
              : "No announcements posted yet."}
          </p>
          {!searchTerm && (
            <div>
              {isParent || isStudent || isTeacher ? (
                <></>
              ) : (
                <Button asChild className="mt-4">
                  <Link href="/portal/announcements/new">
                    Create First Announcement
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
