"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form-field";
import { isParentAtom, isStudentAtom } from "@/jotai/auth/auth";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";
import { subjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("class");

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [, getAllClasses] = useAtom(classesAPI.getAll);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesData, subjectsData] = await Promise.all([
          getAllClasses(),
          getAllSubjects(),
        ]);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setClasses([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAllClasses, getAllSubjects]);

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((classitem) =>
        classitem?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredSubjects = Array.isArray(subjects)
    ? subjects.filter((subject) =>
        subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isParent || isStudent) {
    if (filteredClasses.length === 0 && filteredSubjects.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center">
          <p>No attendance yet</p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Select class to view each students attendance record
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[{ id: "class", label: "Class Attendance" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <InputField
          label={""}
          placeholder={`Search ${
            activeTab === "class" ? "classes" : "subjects"
          }...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full md:w-[20rem]"
        />
      </div>

      {/* Content */}
      {activeTab === "class" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <Button asChild size="sm">
                    <Link href={`/portal/attendance/${item.id}`}>
                      Manage attendance
                    </Link>
                  </Button>
                </CardTitle>
                <CardContent className="p-0 pt-5 space-y-2">
                  <div className="flex flex-row items-center justify-between text-sm">
                    <p>Total Students</p>
                    <p>{item?.capacity ?? "N/A"}</p>
                  </div>
                  <div className="flex flex-row items-center justify-between text-sm">
                    <p>Class Teacher</p>
                    <p>{`${item?.teacher?.user?.firstname ?? "Not"} ${
                      item?.teacher?.user?.lastname ?? "Available"
                    }`}</p>
                  </div>
                  <div className="flex flex-row items-center justify-between text-sm">
                    <p>Room</p>
                    <p>{item?.roomNumber ?? "N/A"}</p>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* {activeTab === "subject" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subject?.name}</span>
                  <Button asChild size="sm">
                    <Link href={`/portal/subjects/${subject.id}`}>
                      View Attendance
                    </Link>
                  </Button>
                </CardTitle>
                <CardContent className="p-0 pt-5 space-y-2">
                  <div className="flex flex-row items-center justify-between text-sm">
                    <p>Class</p>
                    <p>{subject?.class?.name ?? "N/A"}</p>
                  </div>
                  <div className="flex flex-row items-center justify-between text-sm">
                    <p>Code</p>
                    <p>{subject?.code ?? "N/A"}</p>
                  </div>
                  <div className="flex flex-row items-center justify-between text-sm">
                    <p>Credits</p>
                    <p>{subject?.credits ?? "N/A"}</p>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </div>
      )} */}

      {/* Empty State */}
      {((activeTab === "class" && filteredClasses?.length === 0) ||
        (activeTab === "subject" && filteredSubjects?.length === 0)) &&
        !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? `No ${
                    activeTab === "class" ? "classes" : "subjects"
                  } found matching your search.`
                : `No ${activeTab === "class" ? "classes" : "subjects"} yet.`}
            </p>
            {!searchTerm && !isParent && !isStudent && (
              <Button asChild className="mt-4">
                <Link
                  href={
                    activeTab === "class"
                      ? "/portal/attendance/new"
                      : "/portal/subjects"
                  }
                >
                  {activeTab === "class"
                    ? "Mark First Attendance"
                    : "Create Subject"}
                </Link>
              </Button>
            )}
          </div>
        )}
    </div>
  );
}
