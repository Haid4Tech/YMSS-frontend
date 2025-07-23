"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
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
import { subjectsAPI } from "@/jotai/subject/subject";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import PageHeader from "@/components/general/page-header";

export default function AddSubjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: "",
    grade: "",
    category: "",
    teacherId: "",
    syllabus: "",
    objectives: "",
    prerequisites: "",
    textbooks: "",
    assessmentMethods: "",
    weeklyHours: "",
    practicalHours: "",
    theoryHours: "",
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersData = await getAllTeachers();
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, [getAllTeachers]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subjectData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        credits: parseInt(formData.credits) || 0,
        grade: formData.grade,
        category: formData.category,
        teacherId:
          formData.teacherId && formData.teacherId !== "none"
            ? parseInt(formData.teacherId)
            : null,
        syllabus: formData.syllabus,
        objectives: formData.objectives,
        prerequisites: formData.prerequisites,
        textbooks: formData.textbooks,
        assessmentMethods: formData.assessmentMethods,
        weeklyHours: parseInt(formData.weeklyHours) || 0,
        practicalHours: parseInt(formData.practicalHours) || 0,
        theoryHours: parseInt(formData.theoryHours) || 0,
      };

      await subjectsAPI.create(subjectData);
      router.push("/portal/subjects");
    } catch (error) {
      console.error("Failed to create subject:", error);
      alert("Failed to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Add New Subject"}
        subtitle={"Create a new subject with curriculum details"}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="e.g., MATH101, PHY201"
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleInputChange("grade", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                    <SelectItem value="all">All Grades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core Subject</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="social_studies">
                      Social Studies
                    </SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="physical_education">
                      Physical Education
                    </SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => handleInputChange("credits", e.target.value)}
                  min="0"
                  max="10"
                  step="0.5"
                />
              </div>
              <div>
                <Label htmlFor="teacherId">Assigned Teacher</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    handleInputChange("teacherId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No teacher assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Brief description of the subject"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Course Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weeklyHours">Weekly Hours</Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) =>
                    handleInputChange("weeklyHours", e.target.value)
                  }
                  min="0"
                  max="20"
                />
              </div>
              <div>
                <Label htmlFor="theoryHours">Theory Hours (per week)</Label>
                <Input
                  id="theoryHours"
                  type="number"
                  value={formData.theoryHours}
                  onChange={(e) =>
                    handleInputChange("theoryHours", e.target.value)
                  }
                  min="0"
                  max="20"
                />
              </div>
              <div>
                <Label htmlFor="practicalHours">
                  Practical Hours (per week)
                </Label>
                <Input
                  id="practicalHours"
                  type="number"
                  value={formData.practicalHours}
                  onChange={(e) =>
                    handleInputChange("practicalHours", e.target.value)
                  }
                  min="0"
                  max="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Curriculum Details */}
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) =>
                  handleInputChange("objectives", e.target.value)
                }
                placeholder="List the learning objectives for this subject"
              />
            </div>
            <div>
              <Label htmlFor="syllabus">Syllabus Topics</Label>
              <Textarea
                id="syllabus"
                value={formData.syllabus}
                onChange={(e) => handleInputChange("syllabus", e.target.value)}
                placeholder="Outline the main topics and chapters covered"
              />
            </div>
            <div>
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Textarea
                id="prerequisites"
                value={formData.prerequisites}
                onChange={(e) =>
                  handleInputChange("prerequisites", e.target.value)
                }
                placeholder="List any required prior knowledge or subjects"
              />
            </div>
            <div>
              <Label htmlFor="textbooks">Textbooks & Resources</Label>
              <Textarea
                id="textbooks"
                value={formData.textbooks}
                onChange={(e) => handleInputChange("textbooks", e.target.value)}
                placeholder="List required textbooks and learning resources"
              />
            </div>
            <div>
              <Label htmlFor="assessmentMethods">Assessment Methods</Label>
              <Textarea
                id="assessmentMethods"
                value={formData.assessmentMethods}
                onChange={(e) =>
                  handleInputChange("assessmentMethods", e.target.value)
                }
                placeholder="Describe how students will be assessed (exams, projects, assignments, etc.)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/subjects">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex flex-row gap-2 items-center">
                Creating Subject... <Spinner />
              </div>
            ) : (
              "Create Subject"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
