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
import { classesAPI } from "@/jotai/class/class";
import { teachersAPI } from "@/jotai/teachers/teachers";
import { Teacher } from "@/jotai/teachers/teachers-types";

export default function AddClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);
  
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    capacity: "",
    roomNumber: "",
    description: "",
    classTeacherId: "",
    academicYear: "",
    schedule: {
      startTime: "",
      endTime: "",
      days: [] as string[]
    },
    subjects: [] as string[],
    fees: {
      tuition: "",
      lab: "",
      library: "",
      sports: "",
      other: ""
    }
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
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const classData = {
        name: formData.name,
        grade: parseInt(formData.grade) || null,
        section: formData.section,
        capacity: parseInt(formData.capacity) || null,
        roomNumber: formData.roomNumber,
        description: formData.description,
        classTeacherId: formData.classTeacherId ? parseInt(formData.classTeacherId) : null,
        academicYear: formData.academicYear,
        schedule: formData.schedule,
        fees: {
          tuition: parseFloat(formData.fees.tuition) || 0,
          lab: parseFloat(formData.fees.lab) || 0,
          library: parseFloat(formData.fees.library) || 0,
          sports: parseFloat(formData.fees.sports) || 0,
          other: parseFloat(formData.fees.other) || 0
        }
      };

      await classesAPI.create(classData);
      router.push("/portal/classes");
    } catch (error) {
      console.error("Failed to create class:", error);
      alert("Failed to create class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/portal/classes">← Back to Classes</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Class</h1>
            <p className="text-muted-foreground">Set up a new class with all details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Grade 10-A, Science Class"
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level *</Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                    <SelectItem value="kindergarten">Kindergarten</SelectItem>
                    <SelectItem value="pre-k">Pre-K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => (
                      <SelectItem key={String.fromCharCode(65 + i)} value={String.fromCharCode(65 + i)}>
                        Section {String.fromCharCode(65 + i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Student Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                  placeholder="e.g., Room 101, Lab A"
                />
              </div>
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = currentYear + i - 2;
                      return (
                        <SelectItem key={year} value={`${year}-${year + 1}`}>
                          {year}-{year + 1}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="classTeacherId">Class Teacher</Label>
                <Select value={formData.classTeacherId} onValueChange={(value) => handleInputChange("classTeacherId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No teacher assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.user.name} - {teacher.subjects?.[0]?.name || 'No subject'}
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
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of the class, special programs, or notes"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => handleInputChange("schedule.startTime", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={(e) => handleInputChange("schedule.endTime", e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label>Class Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.schedule.days.includes(day)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tuitionFee">Tuition Fee (Monthly)</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  value={formData.fees.tuition}
                  onChange={(e) => handleInputChange("fees.tuition", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="labFee">Lab Fee (Monthly)</Label>
                <Input
                  id="labFee"
                  type="number"
                  value={formData.fees.lab}
                  onChange={(e) => handleInputChange("fees.lab", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="libraryFee">Library Fee (Monthly)</Label>
                <Input
                  id="libraryFee"
                  type="number"
                  value={formData.fees.library}
                  onChange={(e) => handleInputChange("fees.library", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="sportsFee">Sports Fee (Monthly)</Label>
                <Input
                  id="sportsFee"
                  type="number"
                  value={formData.fees.sports}
                  onChange={(e) => handleInputChange("fees.sports", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="otherFee">Other Fees (Monthly)</Label>
                <Input
                  id="otherFee"
                  type="number"
                  value={formData.fees.other}
                  onChange={(e) => handleInputChange("fees.other", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <div className="w-full">
                  <Label>Total Monthly Fee</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg font-medium">
                    ${(
                      parseFloat(formData.fees.tuition || "0") +
                      parseFloat(formData.fees.lab || "0") +
                      parseFloat(formData.fees.library || "0") +
                      parseFloat(formData.fees.sports || "0") +
                      parseFloat(formData.fees.other || "0")
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/classes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Class..." : "Create Class"}
          </Button>
        </div>
      </form>
    </div>
  );
} 