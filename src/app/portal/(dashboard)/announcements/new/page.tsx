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
import { announcementsAPI } from "@/jotai/announcement/announcement";
import { classesAPI } from "@/jotai/class/class";
import { Class } from "@/jotai/class/class-type";

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
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    category: "",
    attachments: [] as File[],
    isPublished: true,
    sendNotification: true,
    emailNotification: false,
    smsNotification: false
  });

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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, attachments: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        classId: formData.classId ? parseInt(formData.classId) : null,
        date: formData.publishDate,
        expiryDate: formData.expiryDate || null,
        category: formData.category,
        isPublished: formData.isPublished,
        notificationSettings: {
          push: formData.sendNotification,
          email: formData.emailNotification,
          sms: formData.smsNotification
        }
      };

      await announcementsAPI.create(announcementData);
      router.push("/portal/announcements");
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Failed to create announcement. Please try again.");
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
            <Link href="/portal/announcements">← Back to Announcements</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Announcement</h1>
            <p className="text-muted-foreground">Share important information with students and parents</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Announcement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
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
                <Label htmlFor="priority">Priority Level *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">🟢 Low Priority</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium Priority</SelectItem>
                    <SelectItem value="HIGH">🔴 High Priority</SelectItem>
                    <SelectItem value="URGENT">⚠️ Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">📢 General</SelectItem>
                    <SelectItem value="academic">📚 Academic</SelectItem>
                    <SelectItem value="events">🎉 Events</SelectItem>
                    <SelectItem value="exams">📝 Exams</SelectItem>
                    <SelectItem value="holidays">🏖️ Holidays</SelectItem>
                    <SelectItem value="sports">⚽ Sports</SelectItem>
                    <SelectItem value="health">🏥 Health & Safety</SelectItem>
                    <SelectItem value="admission">🎓 Admissions</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="targetAudience">Audience *</Label>
                <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange("targetAudience", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">👥 Everyone</SelectItem>
                    <SelectItem value="students">🎓 Students Only</SelectItem>
                    <SelectItem value="parents">👨‍👩‍👧‍👦 Parents Only</SelectItem>
                    <SelectItem value="teachers">👨‍🏫 Teachers Only</SelectItem>
                    <SelectItem value="staff">💼 Staff Only</SelectItem>
                    <SelectItem value="specific_class">🏫 Specific Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.targetAudience === "specific_class" && (
                <div>
                  <Label htmlFor="classId">Select Class</Label>
                  <Select value={formData.classId} onValueChange={(value) => handleInputChange("classId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publishDate">Publish Date *</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => handleInputChange("publishDate", e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => handleInputChange("isPublished", e.target.checked)}
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
                  onChange={(e) => handleInputChange("sendNotification", e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="sendNotification">Send push notification</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="emailNotification"
                  type="checkbox"
                  checked={formData.emailNotification}
                  onChange={(e) => handleInputChange("emailNotification", e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="emailNotification">Send email notification</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="smsNotification"
                  type="checkbox"
                  checked={formData.smsNotification}
                  onChange={(e) => handleInputChange("smsNotification", e.target.checked)}
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
              <Label htmlFor="attachments">Upload Files (Optional)</Label>
              <Input
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
                <h3 className="font-medium">{formData.title || "Announcement Title"}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.priority === "HIGH" ? "bg-red-100 text-red-800" :
                  formData.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                  formData.priority === "URGENT" ? "bg-purple-100 text-purple-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {formData.priority || "Low Priority"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {formData.content || "Announcement content will appear here..."}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>📅 {formData.publishDate}</span>
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
              {loading ? "Creating..." : formData.isPublished ? "Publish Announcement" : "Save Draft"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 