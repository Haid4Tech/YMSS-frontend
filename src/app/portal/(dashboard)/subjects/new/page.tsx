"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@radix-ui/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

import {
  SelectField,
  InputField,
  TextareaField,
} from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { subjectsAPI } from "@/jotai/subject/subject";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";
import { PageHeader } from "@/components/general/page-header";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";

export default function AddSubjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [, getAllTeachers] = useAtom(teachersAPI.getAll);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    classId: "",
    category: "",
    teacherId: "",
    weeklyHours: "",
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const [teachersData, classesData] = await Promise.all([
          getAllTeachers(),
          getAllClasses(),
        ]);

        setTeachers(
          Array.isArray(teachersData.teachers) ? teachersData.teachers : []
        );
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };
    fetchTeachers();
  }, [getAllTeachers, getAllClasses]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subjectData = {
        name: formData.name,
        description: formData.description,
        classId: parseInt(formData.classId),
        category: formData.category,
        teacherId:
          formData.teacherId && formData.teacherId !== "none"
            ? parseInt(formData.teacherId)
            : null,
        weeklyHours: parseInt(formData.weeklyHours) || 0,
      };

      await subjectsAPI.create(subjectData);
      toast.success("Successfully created Subject");
      router.push("/portal/subjects");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(
        `Failed to create subject. Please try again. ${errorMessage}`
      );
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
                <InputField
                  label={"Subject Name"}
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>

              <div>
                <SelectField
                  label={"Classes"}
                  placeholder="Select Class"
                  value={formData.classId}
                  onValueChange={(value) => handleInputChange("classId", value)}
                >
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>
              <div>
                <SelectField
                  label={"Category"}
                  placeholder="Select category"
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  {["science", "art", "general"].map((category, index) => (
                    <SelectItem
                      className="capitalize cursor-pointer"
                      key={index}
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectField>
              </div>

              <div>
                <SelectField
                  label={"Assign Teacher"}
                  placeholder="Select teacher"
                  value={formData.teacherId}
                  onValueChange={(value) =>
                    handleInputChange("teacherId", value)
                  }
                >
                  <SelectItem value="none">No teacher assigned</SelectItem>
                  {teachers.map((teacher) => {
                    return (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {`${teacher.user.firstname} ${teacher.user.lastname}`}
                      </SelectItem>
                    );
                  })}
                </SelectField>
              </div>
              <div className="md:col-span-2">
                <TextareaField
                  id="description"
                  label="Description"
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
                <InputField
                  label={"Weekly Hours"}
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
              {/* <div>
                <InputField
                  label="Theory Hours (per week)"
                  id="theoryHours"
                  type="number"
                  value={formData.theoryHours}
                  onChange={(e) =>
                    handleInputChange("theoryHours", e.target.value)
                  }
                  min="0"
                  max="20"
                />
              </div> */}
              {/* <div>
                <InputField
                  label={"Practical Hours (per week)"}
                  id="practicalHours"
                  type="number"
                  value={formData.practicalHours}
                  onChange={(e) =>
                    handleInputChange("practicalHours", e.target.value)
                  }
                  min="0"
                  max="20"
                />
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Curriculum Details */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Curriculum Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <TextareaField
                label={"Learning Objectives"}
                id="objectives"
                value={formData.objectives}
                onChange={(e) =>
                  handleInputChange("objectives", e.target.value)
                }
                placeholder="List the learning objectives for this subject"
              />
            </div>
            <div>
              <TextareaField
                label={"Syllabus Topics"}
                id="syllabus"
                value={formData.syllabus}
                onChange={(e) => handleInputChange("syllabus", e.target.value)}
                placeholder="Outline the main topics and chapters covered"
              />
            </div>
            <div>
              <TextareaField
                label={"Prerequisites"}
                id="prerequisites"
                value={formData.prerequisites}
                onChange={(e) =>
                  handleInputChange("prerequisites", e.target.value)
                }
                placeholder="List any required prior knowledge or subjects"
              />
            </div>
            <div>
              <TextareaField
                label={"Textbooks & Resources"}
                id="textbooks"
                value={formData.textbooks}
                onChange={(e) => handleInputChange("textbooks", e.target.value)}
                placeholder="List required textbooks and learning resources"
              />
            </div>
            <div>
              <TextareaField
                label="Assessment Methods"
                id="assessmentMethods"
                value={formData.assessmentMethods}
                onChange={(e) =>
                  handleInputChange("assessmentMethods", e.target.value)
                }
                placeholder="Describe how students will be assessed (exams, projects, assignments, etc.)"
              />
            </div>
          </CardContent>
        </Card> */}

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
