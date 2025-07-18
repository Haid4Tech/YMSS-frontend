"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  attendanceAPI, 
  studentsAPI, 
  classesAPI,
  Attendance, 
  Student, 
  Class 
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

export default function AttendanceAnalyticsPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceData, studentsData, classesData] = await Promise.all([
          attendanceAPI.getAll(),
          studentsAPI.getAll(),
          classesAPI.getAll()
        ]);

        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
        setStudents(Array.isArray(studentsData?.students) ? studentsData.students : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter attendance data based on selected class
  const filteredAttendance = selectedClass === "all" 
    ? attendance 
    : attendance.filter(a => a.student?.classId?.toString() === selectedClass);

  // Calculate overall statistics
  const overallStats = {
    totalRecords: filteredAttendance.length,
    presentCount: filteredAttendance.filter(a => a.present).length,
    absentCount: filteredAttendance.filter(a => !a.present).length,
    attendanceRate: filteredAttendance.length > 0 
      ? ((filteredAttendance.filter(a => a.present).length / filteredAttendance.length) * 100).toFixed(1)
      : "0",
    totalStudents: selectedClass === "all" 
      ? students.length 
      : students.filter(s => s.classId?.toString() === selectedClass).length
  };

  // Monthly attendance trend
  const monthlyTrend = filteredAttendance.reduce((acc, record) => {
    const month = record.date ? new Date(record.date).toLocaleDateString('en', { month: 'short', year: '2-digit' }) : 'Unknown';
    if (!acc[month]) {
      acc[month] = { month, present: 0, total: 0 };
    }
    acc[month].total += 1;
    if (record.present) acc[month].present += 1;
    return acc;
  }, {} as Record<string, { month: string; present: number; total: number }>);

  const trendData = Object.values(monthlyTrend)
    .map(item => ({
      month: item.month,
      attendanceRate: ((item.present / item.total) * 100).toFixed(1),
      present: item.present,
      absent: item.total - item.present
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Daily attendance pattern (last 30 days)
  const last30Days = filteredAttendance
    .filter(record => {
      const recordDate = new Date(record.date || '');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    })
    .reduce((acc, record) => {
      const day = record.date ? new Date(record.date).toLocaleDateString('en', { weekday: 'short' }) : 'Unknown';
      if (!acc[day]) {
        acc[day] = { day, present: 0, total: 0 };
      }
      acc[day].total += 1;
      if (record.present) acc[day].present += 1;
      return acc;
    }, {} as Record<string, { day: string; present: number; total: number }>);

  const dailyPattern = Object.values(last30Days).map(item => ({
    day: item.day,
    attendanceRate: ((item.present / item.total) * 100).toFixed(1)
  }));

  // Class-wise attendance comparison
  const classWiseData = classes.map(cls => {
    const classAttendance = attendance.filter(a => a.student?.classId === cls.id);
    const presentCount = classAttendance.filter(a => a.present).length;
    const rate = classAttendance.length > 0 ? (presentCount / classAttendance.length * 100) : 0;
    
    return {
      className: cls.name,
      attendanceRate: rate.toFixed(1),
      totalRecords: classAttendance.length,
      presentCount
    };
  });

  // Student attendance ranking
  const studentRanking = students
    .map(student => {
      const studentAttendance = filteredAttendance.filter(a => a.studentId === student.id);
      const presentCount = studentAttendance.filter(a => a.present).length;
      const rate = studentAttendance.length > 0 ? (presentCount / studentAttendance.length * 100) : 0;
      
      return {
        student,
        attendanceRate: rate,
        totalRecords: studentAttendance.length,
        presentCount,
        absentCount: studentAttendance.length - presentCount
      };
    })
    .filter(item => item.totalRecords > 0)
    .sort((a, b) => b.attendanceRate - a.attendanceRate);

  // Attendance categories
  const attendanceCategories = [
    { 
      category: "Excellent (95%+)", 
      count: studentRanking.filter(s => s.attendanceRate >= 95).length, 
      color: "#10B981" 
    },
    { 
      category: "Good (85-94%)", 
      count: studentRanking.filter(s => s.attendanceRate >= 85 && s.attendanceRate < 95).length, 
      color: "#3B82F6" 
    },
    { 
      category: "Fair (75-84%)", 
      count: studentRanking.filter(s => s.attendanceRate >= 75 && s.attendanceRate < 85).length, 
      color: "#F59E0B" 
    },
    { 
      category: "Poor (<75%)", 
      count: studentRanking.filter(s => s.attendanceRate < 75).length, 
      color: "#EF4444" 
    }
  ];

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
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/attendance">← Back to Attendance</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Attendance Analytics</h1>
            <p className="text-muted-foreground">Comprehensive attendance insights and reporting</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id.toString()}>{cls.name}</option>
            ))}
          </select>
          <Button>Download Report</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">{overallStats.attendanceRate}%</div>
            <p className="text-sm text-muted-foreground">Overall Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{overallStats.presentCount}</div>
            <p className="text-sm text-muted-foreground">Present Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{overallStats.absentCount}</div>
            <p className="text-sm text-muted-foreground">Absent Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "trends", label: "Trends & Patterns" },
            { id: "students", label: "Student Rankings" },
            { id: "classes", label: "Class Comparison" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendanceCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {attendanceCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendanceRate" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Daily Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Pattern (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyPattern.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendanceRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No daily pattern data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Detailed Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Present vs Absent Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="present" stackId="1" stroke="#10B981" fill="#10B981" />
                    <Area type="monotone" dataKey="absent" stackId="1" stroke="#EF4444" fill="#EF4444" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {studentRanking.length > 0 ? (
              <div className="space-y-4">
                {studentRanking.slice(0, 20).map((item, index) => (
                  <div key={item.student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        index < 3 ? 'bg-yellow-500' :
                        item.attendanceRate >= 95 ? 'bg-green-500' :
                        item.attendanceRate >= 85 ? 'bg-blue-500' :
                        item.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.student.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.student.user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Class: {item.student.class?.name || "Not assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        item.attendanceRate >= 95 ? 'text-green-600' :
                        item.attendanceRate >= 85 ? 'text-blue-600' :
                        item.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {item.attendanceRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.presentCount}/{item.totalRecords} present
                      </p>
                      <Button asChild variant="outline" size="sm" className="mt-2">
                        <Link href={`/portal/students/${item.student.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No student attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "classes" && (
        <Card>
          <CardHeader>
            <CardTitle>Class-wise Attendance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {classWiseData.length > 0 ? (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendanceRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classWiseData.map((classData) => (
                    <div key={classData.className} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-lg mb-2">{classData.className}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Attendance Rate:</span>
                          <span className={`font-bold ${
                            parseFloat(classData.attendanceRate) >= 90 ? 'text-green-600' :
                            parseFloat(classData.attendanceRate) >= 80 ? 'text-blue-600' :
                            parseFloat(classData.attendanceRate) >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {classData.attendanceRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Records:</span>
                          <span className="font-medium">{classData.totalRecords}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Present:</span>
                          <span className="font-medium text-green-600">{classData.presentCount}</span>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full mt-2">
                          <Link href={`/portal/classes/${classes.find(c => c.name === classData.className)?.id}`}>
                            View Class Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No class attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 