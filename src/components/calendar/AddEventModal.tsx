/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
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
import { Form } from "@/components/ui/form";
import FormTime from "@/components/general/form-time";
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

interface EventTimeFormValues {
  startTime: string;
  endTime: string;
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

  // Start/end time are managed by their own react-hook-form instance
  // (FormTime requires a react-hook-form context), scoped just to those two
  // fields - the rest of the form stays on the existing useState-driven
  // formData above. "End time after start time" is enforced via the
  // endTime field's validate rule below instead of validateForm().
  const timeForm = useForm<EventTimeFormValues>({
    defaultValues: {
      startTime: initialData?.startTime || "09:00",
      endTime: initialData?.endTime || "10:00",
    },
    mode: "onChange",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const timeValid = await timeForm.trigger();
    if (!validateForm() || !timeValid) return;

    const { startTime, endTime } = timeForm.getValues();

    // Create the event object
    const eventData: Omit<CalendarEvent, "id"> = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      date: formData.date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category: formData.category,
      color: formData.color,
      createdById: user?.id ?? 0,
    };


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
    timeForm.reset({ startTime: "09:00", endTime: "10:00" });
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
          <Form {...timeForm}>
            <div className="grid grid-cols-2 gap-4">
              <FormTime
                name="startTime"
                label="Start Time"
                placeholder="Select start time"
                interval={15}
              />
              <FormTime
                name="endTime"
                label="End Time"
                placeholder="Select end time"
                interval={15}
                rules={{
                  validate: (value: string) => {
                    const start = timeForm.getValues("startTime");
                    if (start && value && start >= value) {
                      return "End time must be after start time";
                    }
                    return true;
                  },
                }}
              />
            </div>
          </Form>

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
