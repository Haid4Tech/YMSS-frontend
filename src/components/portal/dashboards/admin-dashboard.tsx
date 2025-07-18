"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { User } from "@/jotai/auth/auth-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManagementCard from "@/components/pages/dashboard/management-card";
import { GraduationCap, Network, School, Megaphone } from "lucide-react";

import { studentsAPI, studentListAtom } from "@/jotai/students/student";
import { teachersAPI, teacherListAtom } from "@/jotai/teachers/teachers";
import { getAllClassAtom } from "@/jotai/class/class";
import { announcementsAPI, announcementListAtom, announcementErrorAtom, announcementLoadingAtom } from "@/jotai/announcement/announcement";

interface AdminDashboardProps {
  user: User;
}

const managementData = [
  {
    title: "Student Management",
    subtitle: "Manage student enrollments, records, and profiles",
    actionItems: [
      {
        label: "View All",
        url: "/portal/students",
      },
      {
        label: "Add Student",
        url: "/portal/students/new",
      },
    ],
  },
  {
    title: "Teacher Management",
    subtitle: "Manage faculty members and their assignments",
    actionItems: [
      {
        label: "View All",
        url: "/portal/teachers",
      },
      {
        label: "Add Teacher",
        url: "/portal/teachers/new",
      },
    ],
  },
  {
    title: "Class & Subjects",
    subtitle: "Organize classes and subject assignments",
    actionItems: [
      {
        label: "Classes",
        url: "/portal/classes",
      },
      {
        label: "Subjects",
        url: "/portal/subjects",
      },
    ],
  },
  {
    title: "Exams & Results",
    subtitle: "Schedule exams and manage academic results",
    actionItems: [
      {
        label: "Exams",
        url: "/portal/exams",
      },
      {
        label: "Results",
        url: "/portal/results",
      },
    ],
  },
  {
    title: "Attendance",
    subtitle: "Monitor and manage student attendance",
    actionItems: [
      {
        label: "View Reports",
        url: "/portal/attendance",
      },
      {
        label: "Mark Attendance",
        url: "/portal/attendance/mark",
      },
    ],
  },
  {
    title: "Communications",
    subtitle: "Manage announcements and events",
    actionItems: [
      {
        label: "Announcements",
        url: "/portal/announcements",
      },
      {
        label: "Events",
        url: "/portal/events",
      },
    ],
  },
];

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    recentAnnouncements: 0,
  });

  const [loading, setLoading] = useState(true);
  const [announcements] = useAtom(announcementListAtom);
  const [announcementError] = useAtom(announcementErrorAtom);
  const [announcementLoading] = useAtom(announcementLoadingAtom);

  const [students] = useAtom(studentListAtom);
  const [teachers] = useAtom(teacherListAtom);
  const [classes] = useAtom(getAllClassAtom);

  const [, getAllStudents] = useAtom(studentsAPI.getAll);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);
  const [, getAllAnnouncements] = useAtom(announcementsAPI.getAll);

  // Initial data fetching - only run once on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TRIGGER ATOMS
        getAllStudents();
        getAllTeachers();

        // Handle announcements separately with error handling
        try {
          await getAllAnnouncements();
        } catch (error) {
          console.error("Failed to fetch announcements:", error);
          // Don't fail the entire dashboard if announcements fail
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAllStudents, getAllTeachers, getAllAnnouncements]);

  // Update stats when data changes
  useEffect(() => {
    setStats({
      totalStudents: students?.students?.length ?? 0,
      totalTeachers: teachers?.teachers?.length ?? 0,
      totalClasses: Array.isArray(classes) ? classes.length : 0,
      recentAnnouncements: announcementError ? 0 : (Array.isArray(announcements) ? announcements.slice(0, 5).length : 0),
    });
  }, [students, teachers, classes, announcements, announcementError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}. Here&apos;s what&apos;s happening at YMSS
            today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <Network className="text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Faculty members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <School className="text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Active classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="text-gray-500" />
          </CardHeader>
          <CardContent>
            {announcementError ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-500">⚠</div>
                <p className="text-xs text-red-500">
                  Error: {announcementError}
                </p>
                <button
                  onClick={() => getAllAnnouncements()}
                  className="text-xs text-blue-500 hover:text-blue-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : announcementLoading ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-500">⏳</div>
                <p className="text-xs text-blue-500">Loading...</p>
              </div>
            ) : (
              <div className="space-y-1">
            <div className="text-2xl font-bold">
              {stats.recentAnnouncements}
            </div>
            <p className="text-xs text-muted-foreground">Recent posts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementData.map((item, index) => {
          return (
            <ManagementCard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              actionItems={item.actionItems}
            />
          );
        })}
      </div>
    </div>
  );
}
