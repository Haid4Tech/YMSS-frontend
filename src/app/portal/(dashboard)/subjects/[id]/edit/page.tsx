"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { DynamicHeader } from "@/components/general/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { subjectsAPI } from "@/jotai/subject/subject";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

export default function EditSubjectPage() {
  const params = useParams<{ id: string }>();
  const subjectId = parseInt(params.id);
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  console.log(classes);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    weeklyHours: "",
    classId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setError(null);

        const [subject, classesData] = await Promise.all([
          subjectsAPI.getById(subjectId),
          getAllClasses(),
        ]);

        setClasses(Array.isArray(classesData) ? classesData : []);
        setFormData({
          name: subject.name || "",
          description: subject.description || "",
          category: subject.category || "",
          weeklyHours: subject.weeklyHours?.toString() || "",
          classId: subject.classId?.toString() || "",
        });
      } catch (error) {
        console.error("Failed to fetch subject data:", error);
        setError("Failed to load subject data. Please try again.");
        toast.error("Failed to load subject data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        weeklyHours: formData.weeklyHours
          ? parseInt(formData.weeklyHours)
          : null,
        classId: formData.classId ? parseInt(formData.classId) : null,
      };

      await subjectsAPI.update(subjectId, updateData);
      toast.success("Subject updated successfully");
      router.push(`/portal/subjects/${subjectId}`);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Failed to update subject:", error);
      toast.error(`Failed to update subject. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DynamicHeader
        name={formData.name || "Edit Subject"}
        title="Edit Subject"
        subtitle="Update subject information"
      />

      <Card>
        <CardHeader>
          <CardTitle>Subject Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Subject Name"
                placeholder="Enter subject name"
                required
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />

              <SelectField
                label="Class"
                value={formData.classId}
                onValueChange={(value) => handleInputChange("classId", value)}
                placeholder="Select class"
                required
              >
                {classes.map((classItem) => (
                  <SelectItem
                    key={classItem.id}
                    value={classItem.id.toString()}
                  >
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectField>

              <SelectField
                label={"Category"}
                placeholder="Select category"
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
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

              <InputField
                label="Weekly Hours"
                placeholder="e.g., 3"
                type="number"
                id="weeklyHours"
                value={formData.weeklyHours}
                onChange={(e) =>
                  handleInputChange("weeklyHours", e.target.value)
                }
                min="1"
                max="20"
              />
            </div>

            <div>
              <TextareaField
                label="Description"
                placeholder="Enter subject description"
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Subject"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
