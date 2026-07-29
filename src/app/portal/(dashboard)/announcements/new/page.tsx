"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/general/page-header";
import { SelectItem } from "@/components/ui/select";
import FormDate from "@/components/general/form-date";
import { announcementsAPI } from "@/jotai/announcement/announcement";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

interface ScheduleFormValues {
  publishDate: Date | undefined;
  expiryDate: Date | undefined;
}

export default function AddAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [, getAllClasses] = useAtom(classesAPI.getAll);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "",
    targetAudience: "",
    classId: "",
    category: "",
    attachments: [] as File[],
    isPublished: true,
    sendNotification: true,
    emailNotification: false,
    smsNotification: false,
  });

  // Publish/expiry date are managed by their own react-hook-form instance
  // (FormDate requires a react-hook-form context), scoped just to the
  // scheduling fields - the rest of the form stays on the existing
  // useState-driven formData above.
  const scheduleForm = useForm<ScheduleFormValues>({
    defaultValues: { publishDate: new Date(), expiryDate: undefined },
    mode: "onChange",
  });
  const publishDate = scheduleForm.watch("publishDate");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesData = await getAllClasses();
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      }
    };
    fetchClasses();
  }, [getAllClasses]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, attachments: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduleValid = await scheduleForm.trigger();
    if (!scheduleValid) {
      toast.error("Please fix the schedule errors before submitting the form.");
      return;
    }
    const schedule = scheduleForm.getValues();

    setLoading(true);

    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        classId: formData.classId ? parseInt(formData.classId) : null,
        date: schedule.publishDate ? schedule.publishDate.toISOString() : "",
        expiryDate: schedule.expiryDate ? schedule.expiryDate.toISOString() : null,
        category: formData.category,
        isPublished: formData.isPublished,
        notificationSettings: {
          push: formData.sendNotification,
          email: formData.emailNotification,
          sms: formData.smsNotification,
        },
      };

      await announcementsAPI.create(announcementData);
      toast.success("Announcement created!");
      router.push("/portal/announcements");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(
        `Failed to create announcement. Please try again. ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={"Create Announcement"}
        subtitle={"Share important information with students and parents"}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Announcement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <InputField
                label={"Title"}
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <TextareaField
                label="Content"
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Write your announcement content here..."
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SelectField
                  label={"Priority Level"}
                  placeholder="Select priority"
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectItem value="LOW">🟢 Low Priority</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium Priority</SelectItem>
                  <SelectItem value="HIGH">🔴 High Priority</SelectItem>
                  <SelectItem value="URGENT">⚠️ Urgent</SelectItem>
                </SelectField>
              </div>

              <div>
                <Label htmlFor="category"></Label>
                <SelectField
                  label="Category"
                  placeholder="Select category"
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectItem value="general">📢 General</SelectItem>
                  <SelectItem value="academic">📚 Academic</SelectItem>
                  <SelectItem value="events">🎉 Events</SelectItem>
                  <SelectItem value="exams">📝 Exams</SelectItem>
                  <SelectItem value="holidays">🏖️ Holidays</SelectItem>
                  <SelectItem value="sports">⚽ Sports</SelectItem>
                  <SelectItem value="health">🏥 Health & Safety</SelectItem>
                  <SelectItem value="admission">🎓 Admissions</SelectItem>
                </SelectField>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SelectField
                  label="Audience"
                  value={formData.targetAudience}
                  placeholder="Select target audience"
                  onValueChange={(value) =>
                    handleInputChange("targetAudience", value)
                  }
                >
                  <SelectItem value="all">👥 Everyone</SelectItem>
                  <SelectItem value="students">🎓 Students Only</SelectItem>
                  <SelectItem value="parents">👨‍👩‍👧‍👦 Parents Only</SelectItem>
                  <SelectItem value="teachers">👨‍🏫 Teachers Only</SelectItem>
                  <SelectItem value="staff">💼 Staff Only</SelectItem>
                  <SelectItem value="specific_class">
                    🏫 Specific Class
                  </SelectItem>
                </SelectField>
              </div>

              {formData.targetAudience === "specific_class" && (
                <div>
                  <Label htmlFor="classId"></Label>
                  <SelectField
                    label={"Select Class"}
                    placeholder="Select class"
                    value={formData.classId}
                    onValueChange={(value) =>
                      handleInputChange("classId", value)
                    }
                  >
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectField>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...scheduleForm}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormDate
                  name="publishDate"
                  label="Publish Date"
                  placeholder="Select publish date"
                  rules={{ required: "Publish date is required" }}
                />

                <FormDate
                  name="expiryDate"
                  label="Expiry Date (Optional)"
                  placeholder="Select expiry date"
                  disableRule={
                    publishDate ? (date) => date < publishDate : undefined
                  }
                  rules={{
                    validate: (value: Date | undefined) => {
                      if (value && publishDate && value < publishDate) {
                        return "Expiry date cannot be before publish date";
                      }
                      return true;
                    },
                  }}
                />
              </div>
            </Form>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    handleInputChange("isPublished", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="isPublished">Publish immediately</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="sendNotification"
                  type="checkbox"
                  checked={formData.sendNotification}
                  onChange={(e) =>
                    handleInputChange("sendNotification", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="sendNotification">Send push notification</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="emailNotification"
                  type="checkbox"
                  checked={formData.emailNotification}
                  onChange={(e) =>
                    handleInputChange("emailNotification", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="emailNotification">
                  Send email notification
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="smsNotification"
                  type="checkbox"
                  checked={formData.smsNotification}
                  onChange={(e) =>
                    handleInputChange("smsNotification", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="smsNotification">Send SMS notification</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <InputField
                label={"Upload Files (Optional)"}
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max 5MB each)
              </p>
              {formData.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Selected files:</p>
                  <ul className="text-sm text-muted-foreground">
                    {formData.attachments.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">
                  {formData.title || "Announcement Title"}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    formData.priority === "HIGH"
                      ? "bg-red-100 text-red-800"
                      : formData.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : formData.priority === "URGENT"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {formData.priority || "Low Priority"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {formData.content || "Announcement content will appear here..."}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  📅 {publishDate ? publishDate.toLocaleDateString() : ""}
                </span>
                <span>👥 {formData.targetAudience || "Not selected"}</span>
                {formData.category && <span>🏷️ {formData.category}</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/announcements">Cancel</Link>
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleInputChange("isPublished", false)}
            >
              Save as Draft
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Creating..."
                : formData.isPublished
                ? "Publish Announcement"
                : "Save Draft"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
