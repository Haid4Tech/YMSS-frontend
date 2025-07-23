/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventFormData, CalendarEvent } from "@/types/calendar";
import {
  formatDate,
  getCategories,
  findCategoryByLabel,
} from "@/utils/calendar";
import { userAtom } from "@/jotai/auth/auth";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<CalendarEvent, "id">) => void;
  selectedDate: Date;
  initialData?: CalendarEvent; // For editing existing events
}

export function AddEventModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  initialData,
}: AddEventModalProps) {
  const isEditing = !!initialData;
  const [user] = useAtom(userAtom);

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: selectedDate,
    startTime: initialData?.startTime || "09:00",
    endTime: initialData?.endTime || "10:00",
    category: initialData?.category || "Other",
    color:
      initialData?.color || findCategoryByLabel("Other")?.color || "#6b7280",
    createdById: initialData?.createdById ?? user?.id ?? 0,
  });

  // Form validation
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    // Validate time format and logic
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);

      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Create the event object
    const eventData: Omit<CalendarEvent, "id"> = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      date: formData.date,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      category: formData.category,
      color: formData.color,
      createdById: user?.id ?? 0,
    };

    console.log("EVENT DATA ", eventData);

    onSubmit(eventData);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: selectedDate,
      startTime: "09:00",
      endTime: "10:00",
      category: "Other",
      color: findCategoryByLabel("Other")?.color || "#6b7280",
      createdById: 0,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const categoryColors = getCategories();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event" : "Add New Event"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the event details below."
              : `Create a new event for ${formatDate(selectedDate)}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter event title..."
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Event Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter event description..."
              rows={3}
            />
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className={errors.endTime ? "border-destructive" : ""}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                handleInputChange("category", value);
                // Find the correct color for the selected category
                const selectedCategory = findCategoryByLabel(value);
                if (selectedCategory) {
                  handleInputChange("color", selectedCategory.color);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryColors.map((item, index) => (
                  <SelectItem key={index} value={item.label}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
