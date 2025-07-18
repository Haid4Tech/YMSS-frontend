"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@radix-ui/themes";
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
import { gradesAPI } from "@/jotai/grades/grades";
import { examsAPI, enhancedExamsAPI } from "@/jotai/exams/exams";
import { Exam } from "@/jotai/exams/exams-type";
import { studentsAPI, enhancedStudentsAPI } from "@/jotai/students/student";
import { Student } from "@/jotai/students/student-types";
import { subjectsAPI, enhancedSubjectsAPI } from "@/jotai/subject/subject";
import { Subject } from "@/jotai/subject/subject-types";

interface GradeEntry {
  studentId: number;
  marks: string;
  comments: string;
}

export default function AddGradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [formData, setFormData] = useState({
    examId: "",
    subjectId: "",
    gradingType: "exam",
    assignmentTitle: "",
    totalMarks: "",
    gradingDate: new Date().toISOString().split('T')[0],
    weightage: "",
    description: ""
  });

  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsData, subjectsData] = await Promise.all([
          examsAPI.getAll(),
          subjectsAPI.getAll()
        ]);
        setExams(Array.isArray(examsData) ? examsData : []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.examId) {
      const selectedExam = exams.find(exam => exam.id.toString() === formData.examId);
      if (selectedExam) {
        setFormData(prev => ({
          ...prev,
          subjectId: selectedExam.subjectId?.toString() || "",
          totalMarks: selectedExam.totalMarks?.toString() || ""
        }));
        
        // Fetch students for this exam's class
        fetchStudentsForExam(selectedExam);
      }
    }
  }, [formData.examId, exams]);

  const fetchStudentsForExam = async (exam: Exam) => {
    try {
      let studentsData;
      if (exam.classId) {
        studentsData = await studentsAPI.getByClass(exam.classId);
      } else {
        studentsData = await studentsAPI.getAll();
      }
      
      const studentsList = Array.isArray(studentsData) ? studentsData : 
                          studentsData?.students ? studentsData.students : [];
      setStudents(studentsList);
      
      // Initialize grade entries
      const entries = studentsList.map((student: Student) => ({
        studentId: student.id,
        marks: "",
        comments: ""
      }));
      setGradeEntries(entries);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
      setGradeEntries([]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGradeChange = (studentId: number, field: "marks" | "comments", value: string) => {
    setGradeEntries(prev => 
      prev.map(entry => 
        entry.studentId === studentId 
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const calculateGrade = (marks: number, totalMarks: number) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    if (percentage >= 30) return "D";
    return "F";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalMarks = parseInt(formData.totalMarks);
      
      // Submit grades for each student
      const gradePromises = gradeEntries
        .filter(entry => entry.marks !== "")
        .map(entry => {
          const marks = parseInt(entry.marks);
          const grade = calculateGrade(marks, totalMarks);
          
          return gradesAPI.create({
            studentId: entry.studentId,
            subjectId: parseInt(formData.subjectId),
            examId: formData.examId ? parseInt(formData.examId) : null,
            marks: marks,
            totalMarks: totalMarks,
            grade: grade,
            percentage: (marks / totalMarks) * 100,
            comments: entry.comments,
            gradingDate: formData.gradingDate,
            gradingType: formData.gradingType,
            assignmentTitle: formData.assignmentTitle,
            weightage: parseFloat(formData.weightage) || 100
          });
        });

      await Promise.all(gradePromises);
      
      alert("Grades saved successfully!");
      router.push("/portal/grades");
    } catch (error) {
      console.error("Failed to save grades:", error);
      alert("Failed to save grades. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalMarks = parseInt(formData.totalMarks) || 100;
  const gradedStudents = gradeEntries.filter(entry => entry.marks !== "").length;
  const averageMarks = gradeEntries.length > 0 
    ? gradeEntries
        .filter(entry => entry.marks !== "")
        .reduce((sum, entry) => sum + parseInt(entry.marks || "0"), 0) / gradedStudents || 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/grades">← Back to Grades</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Enter Grades</h1>
            <p className="text-muted-foreground">Record student grades for exams or assignments</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grading Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Grading Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gradingType">Grading Type *</Label>
                <Select value={formData.gradingType} onValueChange={(value) => handleInputChange("gradingType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grading type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="participation">Class Participation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.gradingType === "exam" ? (
                <div>
                  <Label htmlFor="examId">Select Exam *</Label>
                  <Select value={formData.examId} onValueChange={(value) => handleInputChange("examId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.title} - {exam.subject?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="assignmentTitle">Assignment/Activity Title *</Label>
                  <Input
                    id="assignmentTitle"
                    value={formData.assignmentTitle}
                    onChange={(e) => handleInputChange("assignmentTitle", e.target.value)}
                    placeholder="Enter title"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="subjectId">Subject *</Label>
                <Select value={formData.subjectId} onValueChange={(value) => handleInputChange("subjectId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                  min="1"
                  max="1000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gradingDate">Grading Date *</Label>
                <Input
                  id="gradingDate"
                  type="date"
                  value={formData.gradingDate}
                  onChange={(e) => handleInputChange("gradingDate", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="weightage">Weightage (%)</Label>
                <Input
                  id="weightage"
                  type="number"
                  value={formData.weightage}
                  onChange={(e) => handleInputChange("weightage", e.target.value)}
                  min="0"
                  max="100"
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Additional notes about this grading session"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Grading Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{gradedStudents}</div>
                  <p className="text-sm text-muted-foreground">Graded</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{students.length - gradedStudents}</div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{averageMarks.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Average Marks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Grades */}
        {students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Student Grades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {students.map((student) => {
                  const entry = gradeEntries.find(e => e.studentId === student.id);
                  const marks = parseInt(entry?.marks || "0");
                  const grade = entry?.marks ? calculateGrade(marks, totalMarks) : "";
                  const percentage = entry?.marks ? ((marks / totalMarks) * 100).toFixed(1) : "";
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <span className="font-medium text-sm">
                            {student.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{student.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`marks-${student.id}`} className="text-sm">
                            Marks:
                          </Label>
                          <Input
                            id={`marks-${student.id}`}
                            type="number"
                            value={entry?.marks || ""}
                            onChange={(e) => handleGradeChange(student.id, "marks", e.target.value)}
                            min="0"
                            max={formData.totalMarks}
                            className="w-20"
                            placeholder="0"
                          />
                          <span className="text-sm text-muted-foreground">/ {totalMarks}</span>
                        </div>
                        
                        {entry?.marks && (
                          <div className="text-center">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              grade === "A+" || grade === "A" ? "bg-green-100 text-green-800" :
                              grade === "B+" || grade === "B" ? "bg-blue-100 text-blue-800" :
                              grade === "C+" || grade === "C" ? "bg-yellow-100 text-yellow-800" :
                              grade === "D" ? "bg-orange-100 text-orange-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {grade}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
                          </div>
                        )}
                        
                        <Input
                          placeholder="Comments (optional)"
                          value={entry?.comments || ""}
                          onChange={(e) => handleGradeChange(student.id, "comments", e.target.value)}
                          className="w-40"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        {students.length > 0 && (
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/portal/grades">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading || gradedStudents === 0}>
              {loading ? (
                <div className="flex flex-row gap-2 items-center">
                  Saving Grades... <Spinner />
                </div>
              ) : (
                `Save ${gradedStudents} Grades`
              )}
            </Button>
          </div>
        )}

        {/* No Students Message */}
        {formData.examId && students.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No students found for the selected exam/subject.</p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
} 