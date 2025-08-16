/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  eventsAPI,
  eventListAtom,
  eventLoadingAtom,
  eventErrorAtom,
} from "@/jotai/events/event";
import { Event } from "@/jotai/events/event-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/form-field";
import {
  isParentAtom,
  isStudentAtom,
  isTeacherAtom,
  userAtom,
} from "@/jotai/auth/auth";
import {
  EventCalendar,
  AddEventModal,
  CalendarEvent,
} from "@/components/calendar";
import { toast } from "sonner";
import EventCard from "@/components/portal/dashboards/event/event-card";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const [user] = useAtom(userAtom);
  const [events] = useAtom(eventListAtom);
  const [loading] = useAtom(eventLoadingAtom);
  const [error] = useAtom(eventErrorAtom);
  const [, getAllEvents] = useAtom(eventsAPI.getAll);
  const [isParent] = useAtom(isParentAtom);
  const [isStudent] = useAtom(isStudentAtom);
  const [isTeacher] = useAtom(isTeacherAtom);

  useEffect(() => {
    getAllEvents();
  }, [getAllEvents]);

  // Convert backend Event to CalendarEvent
  const eventsToCalendarEvents = (events: Event[]): CalendarEvent[] => {
    return events.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      color: event.color,
      createdById: event.createdById,
    }));
  };

  // Convert CalendarEvent to backend Event format for creation
  const calendarEventToEventData = (
    calendarEvent: Omit<CalendarEvent, "id">
  ) => {
    return {
      ...calendarEvent,
      date: selectedDate.toISOString(),
      createdById: user?.id,
    };
  };

  // Event handlers
  const handleEventAdd = async (
    calendarEventData: Omit<CalendarEvent, "id">
  ) => {
    try {
      const eventData = calendarEventToEventData(calendarEventData);
      await eventsAPI.create(eventData);

      toast.success(`Event "${calendarEventData.title}" created successfully!`);

      // Refresh the events list
      getAllEvents();
    } catch (error: any) {
      console.error("Failed to create event:", error);
      toast.error(
        `Failed to create event: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleDeleteEvent = async (eventId: number, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      toast.success(`Event "${eventTitle}" deleted successfully!`);

      // Refresh the events list
      getAllEvents();
    } catch (error: any) {
      console.error("Failed to delete event:", error);
      toast.error(
        `Failed to delete event: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (canModifyEvents) {
      setIsAddModalOpen(true);
    }
  };

  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Convert events for calendar display
  const calendarEvents = events ? eventsToCalendarEvents(events) : [];

  // Check if user can modify events
  const canModifyEvents = !(isParent || isStudent || isTeacher);

  if (loading && !events) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load Events. {error}</p>
        <Button onClick={() => getAllEvents()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage school events and calendar activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-r-none"
            >
              Calendar
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>

          {canModifyEvents && (
            <>
              <Button
                onClick={() => {
                  setSelectedDate(new Date());
                  setIsAddModalOpen(true);
                }}
              >
                Add Event
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="space-y-4">
          <EventCalendar
            events={calendarEvents}
            onEventAdd={canModifyEvents ? handleEventAdd : undefined}
            onDateSelect={handleDateSelect}
            className="w-full"
          />

          {/* Event Statistics */}
          {events && events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {events.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Events
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        events.filter((e) => new Date(e.date) > new Date())
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Upcoming
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        events.filter(
                          (e) =>
                            new Date(e.date).toDateString() ===
                            new Date().toDateString()
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {
                        events.filter((e) => new Date(e.date) < new Date())
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Past</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
          {/* Search */}
          <div className="flex items-center gap-4">
            <InputField
              label=""
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm w-full md:w-[20rem]"
            />
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                canModify={canModifyEvents}
                onDelete={() => handleDeleteEvent(event.id, event.title)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredEvents?.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No events found matching your search."
                  : "No events scheduled yet."}
              </p>
              {!searchTerm && canModifyEvents && (
                <Button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setIsAddModalOpen(true);
                  }}
                  className="mt-4"
                >
                  Create First Event
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleEventAdd}
        selectedDate={selectedDate}
      />
    </div>
  );
}
