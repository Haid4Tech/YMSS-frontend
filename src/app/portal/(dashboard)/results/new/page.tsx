"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  gradesAPI,
  gradeLoadingAtom,
  gradeErrorAtom,
} from "@/jotai/grades/grades";
import {
  classesAPI,
  getAllClassAtom,
  classLoadingAtom,
} from "@/jotai/class/class";
import {
  subjectsAPI,
  subjectListAtom,
  subjectLoadingAtom,
} from "@/jotai/subject/subject";
import {
  studentsAPI,
  studentListAtom,
  studentLoadingAtom,
} from "@/jotai/students/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

export default function NewResultPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: "",
    classId: "",
    academicYear: "2024/2025",
    term: "FIRST" as "FIRST" | "SECOND" | "THIRD",
    ca1: "",
    ca2: "",
    examScore: "",
    ltc: "",
    remark: "",
  });

  const [loading] = useAtom(gradeLoadingAtom);
  const [error] = useAtom(gradeErrorAtom);
  const [, createOrUpdateResult] = useAtom(gradesAPI.createOrUpdateResult);

  const [classes] = useAtom(getAllClassAtom);
  const [classLoading] = useAtom(classLoadingAtom);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [subjects] = useAtom(subjectListAtom);
  const [subjectLoading] = useAtom(subjectLoadingAtom);
  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);

  const [students] = useAtom(studentListAtom);
  const [studentLoading] = useAtom(studentLoadingAtom);
  const [, getAllStudents] = useAtom(studentsAPI.getAll);

  useEffect(() => {
    getAllClasses();
    getAllSubjects();
    getAllStudents();
  }, [getAllClasses, getAllSubjects, getAllStudents]);

  // Filter subjects by selected class
  const filteredSubjects = Array.isArray(subjects)
    ? subjects.filter(
        (subject) => subject.classId?.toString() === formData.classId
      )
    : [];

  // Filter students by selected class
  const filteredStudents = Array.isArray(students?.students)
    ? students.students.filter(
        (student) => student.classId?.toString() === formData.classId
      )
    : [];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.subjectId || !formData.classId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const resultData = {
        studentId: parseInt(formData.studentId),
        subjectId: parseInt(formData.subjectId),
        classId: parseInt(formData.classId),
        academicYear: formData.academicYear,
        term: formData.term,
        ca1: formData.ca1 ? parseFloat(formData.ca1) : undefined,
        ca2: formData.ca2 ? parseFloat(formData.ca2) : undefined,
        examScore: formData.examScore
          ? parseFloat(formData.examScore)
          : undefined,
        ltc: formData.ltc ? parseFloat(formData.ltc) : undefined,
        remark: formData.remark || undefined,
      };

      await createOrUpdateResult(resultData);
      toast.success("Result saved successfully");
      router.push("/portal/results");
    } catch (error: any) {
      toast.error(extractErrorMessage(error));
    }
  };

  const isFormValid =
    formData.studentId && formData.subjectId && formData.classId;

  if (classLoading || subjectLoading || studentLoading) {
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
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add Result</h1>
            <p className="text-muted-foreground">
              Record student academic performance
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Result Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="classId">Class *</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => handleInputChange("classId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(classes) &&
                      classes.map((classItem) => (
                        <SelectItem
                          key={classItem.id}
                          value={classItem.id.toString()}
                        >
                          {classItem.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subjectId">Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    handleInputChange("subjectId", value)
                  }
                  disabled={!formData.classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="studentId">Student *</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    handleInputChange("studentId", value)
                  }
                  disabled={!formData.classId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => (
                      <SelectItem
                        key={student.id}
                        value={student.id.toString()}
                      >
                        {student.user?.firstname} {student.user?.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) =>
                    handleInputChange("academicYear", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="term">Term</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value: "FIRST" | "SECOND" | "THIRD") =>
                    handleInputChange("term", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIRST">First Term</SelectItem>
                    <SelectItem value="SECOND">Second Term</SelectItem>
                    <SelectItem value="THIRD">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="ca1">CA1 (0-20)</Label>
                <Input
                  id="ca1"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={formData.ca1}
                  onChange={(e) => handleInputChange("ca1", e.target.value)}
                  placeholder="Enter CA1 score"
                />
              </div>

              <div>
                <Label htmlFor="ca2">CA2 (0-20)</Label>
                <Input
                  id="ca2"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={formData.ca2}
                  onChange={(e) => handleInputChange("ca2", e.target.value)}
                  placeholder="Enter CA2 score"
                />
              </div>

              <div>
                <Label htmlFor="examScore">Exam (0-60)</Label>
                <Input
                  id="examScore"
                  type="number"
                  min="0"
                  max="60"
                  step="0.1"
                  value={formData.examScore}
                  onChange={(e) =>
                    handleInputChange("examScore", e.target.value)
                  }
                  placeholder="Enter exam score"
                />
              </div>

              <div>
                <Label htmlFor="ltc">LTC (0-100)</Label>
                <Input
                  id="ltc"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.ltc}
                  onChange={(e) => handleInputChange("ltc", e.target.value)}
                  placeholder="Enter LTC score"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) => handleInputChange("remark", e.target.value)}
                placeholder="Enter teacher's remark..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid || loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Result
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Grading Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>CA1 & CA2:</strong> Continuous Assessment scores (0-20
              each)
            </p>
            <p>
              <strong>Exam:</strong> Final examination score (0-60)
            </p>
            <p>
              <strong>LTC:</strong> Long Term Continuous Assessment (0-100)
            </p>
            <p>
              <strong>Total Score:</strong> Automatically calculated as (CA1 +
              CA2 + Exam)
            </p>
            <p>
              <strong>Overall Score:</strong> Automatically calculated as (Total
              Score + LTC) / 2
            </p>
            <p>
              <strong>Grade:</strong> Automatically assigned based on overall
              score (A: 80+, B: 65-79, C: 50-64, D: 40-49, F: 0-39)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
