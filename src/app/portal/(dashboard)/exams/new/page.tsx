"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
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
import { examsAPI } from "@/jotai/exams/exams";
import { subjectsAPI } from "@/jotai/subject/subject";
import { classesAPI } from "@/jotai/class/class";
import { Subject } from "@/jotai/subject/subject-types";
import { Class } from "@/jotai/class/class-type";

export default function AddExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [, getAllSubjects] = useAtom(subjectsAPI.getAll);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    classId: "",
    date: "",
    startTime: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    examType: "",
    instructions: "",
    syllabusTopics: "",
    roomNumber: "",
    supervisor: "",
    materials: "",
    gradingCriteria: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, classesData] = await Promise.all([
          getAllSubjects(),
          getAllClasses(),
        ]);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [getAllClasses, getAllSubjects]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const examData = {
        title: formData.title,
        subjectId: parseInt(formData.subjectId),
        classId: formData.classId ? parseInt(formData.classId) : null,
        date: formData.date,
        startTime: formData.startTime,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        examType: formData.examType,
        instructions: formData.instructions,
        syllabusTopics: formData.syllabusTopics,
        roomNumber: formData.roomNumber,
        supervisor: formData.supervisor,
        materials: formData.materials,
        gradingCriteria: formData.gradingCriteria,
      };

      await examsAPI.create(examData);
      router.push("/portal/exams");
    } catch (error) {
      console.error("Failed to create exam:", error);
      alert("Failed to schedule exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/exams">← Back to Exams</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Schedule New Exam</h1>
            <p className="text-muted-foreground">
              Create and schedule an examination
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Mathematics Mid-term Exam"
                  required
                />
              </div>
              <div>
                <Label htmlFor="subjectId">Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    handleInputChange("subjectId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject.id}
                        value={subject.id.toString()}
                      >
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classId">Class</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => handleInputChange("classId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} (Grade {cls.grade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="examType">Exam Type *</Label>
                <Select
                  value={formData.examType}
                  onValueChange={(value) =>
                    handleInputChange("examType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="midterm">Mid-term Exam</SelectItem>
                    <SelectItem value="final">Final Exam</SelectItem>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="practical">Practical Exam</SelectItem>
                    <SelectItem value="oral">Oral Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Exam Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  min="15"
                  max="480"
                  required
                />
              </div>
              <div>
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) =>
                    handleInputChange("totalMarks", e.target.value)
                  }
                  min="1"
                  max="1000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="passingMarks">Passing Marks *</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) =>
                    handleInputChange("passingMarks", e.target.value)
                  }
                  min="1"
                  max={formData.totalMarks || "1000"}
                  required
                />
              </div>
              <div>
                <Label htmlFor="roomNumber">Room/Venue</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    handleInputChange("roomNumber", e.target.value)
                  }
                  placeholder="e.g., Room 101, Lab A, Auditorium"
                />
              </div>
              <div>
                <Label htmlFor="supervisor">Supervisor/Invigilator</Label>
                <Input
                  id="supervisor"
                  value={formData.supervisor}
                  onChange={(e) =>
                    handleInputChange("supervisor", e.target.value)
                  }
                  placeholder="Name of supervising teacher"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Content */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Content & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="syllabusTopics">Syllabus Topics</Label>
              <Textarea
                id="syllabusTopics"
                value={formData.syllabusTopics}
                onChange={(e) =>
                  handleInputChange("syllabusTopics", e.target.value)
                }
                placeholder="List the topics/chapters covered in this exam"
              />
            </div>
            <div>
              <Label htmlFor="instructions">Exam Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) =>
                  handleInputChange("instructions", e.target.value)
                }
                placeholder="Special instructions for students (e.g., calculator allowed, open book, etc.)"
              />
            </div>
            <div>
              <Label htmlFor="materials">Required Materials</Label>
              <Textarea
                id="materials"
                value={formData.materials}
                onChange={(e) => handleInputChange("materials", e.target.value)}
                placeholder="List materials students need to bring (e.g., calculator, ruler, colored pencils)"
              />
            </div>
            <div>
              <Label htmlFor="gradingCriteria">Grading Criteria</Label>
              <Textarea
                id="gradingCriteria"
                value={formData.gradingCriteria}
                onChange={(e) =>
                  handleInputChange("gradingCriteria", e.target.value)
                }
                placeholder="Describe how the exam will be graded and weighted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Subject:</span>{" "}
                  {subjects.find((s) => s.id.toString() === formData.subjectId)
                    ?.name || "Not selected"}
                </p>
                <p>
                  <span className="font-medium">Date & Time:</span>{" "}
                  {formData.date} at {formData.startTime}
                </p>
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {formData.duration} minutes
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Total Marks:</span>{" "}
                  {formData.totalMarks}
                </p>
                <p>
                  <span className="font-medium">Passing Marks:</span>{" "}
                  {formData.passingMarks}
                </p>
                <p>
                  <span className="font-medium">Pass Percentage:</span>{" "}
                  {formData.totalMarks && formData.passingMarks
                    ? (
                        (parseInt(formData.passingMarks) /
                          parseInt(formData.totalMarks)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/exams">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Scheduling Exam..." : "Schedule Exam"}
          </Button>
        </div>
      </form>
    </div>
  );
}
