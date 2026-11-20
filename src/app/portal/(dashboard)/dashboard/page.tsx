"use client";

import AdminDashboard from "@/components/portal/dashboards/admin-dashboard";
import TeacherDashboard from "@/components/portal/dashboards/teacher-dashboard";
import StudentDashboard from "@/components/portal/dashboards/student-dashboard";
import ParentDashboard from "@/components/portal/dashboards/parent-dashboard";
import { useAtom } from "jotai";
import { userAtom, authLoadingAtom } from "@/jotai/auth/auth";
import { useAcademicPeriod } from "@/components/portal/academic-period/academic-period-provider";
import { AcademicPeriodFields } from "@/components/portal/dashboards/results/academic-period-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);
  const { globalPeriod, setGlobalPeriod } = useAcademicPeriod();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    // Render role-specific dashboard
    switch (user?.role) {
      case "ADMIN":
        return <AdminDashboard user={user} />;
      case "TEACHER":
        return <TeacherDashboard user={user} />;
      case "STUDENT":
        return <StudentDashboard user={user} />;
      case "PARENT":
        return <ParentDashboard user={user} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Invalid user role</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Global academic period</CardTitle>
          <p className="text-sm text-muted-foreground">
            Applies across the portal and is saved for your next visit.
            Changing it resets page-specific period selections.
          </p>
        </CardHeader>
        <CardContent>
          <AcademicPeriodFields {...globalPeriod} onChange={setGlobalPeriod} />
        </CardContent>
      </Card>
      {renderDashboard()}
    </div>
  );
}
