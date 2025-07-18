"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import { eventsAPI, eventListAtom, eventLoadingAtom, eventErrorAtom } from "@/jotai/events/event";
import { Event } from "@/jotai/events/event-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [events] = useAtom(eventListAtom);
  const [loading] = useAtom(eventLoadingAtom);
  const [error] = useAtom(eventErrorAtom);
  const [, getAllEvents] = useAtom(eventsAPI.getAll);

  useEffect(() => {
    getAllEvents();
  }, [getAllEvents]);

  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          event?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          event?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Failed to load Events. {error}
        </p>
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
        <Button asChild>
          <Link href="/portal/events/new">Create Event</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event?.id} className="hover-scale">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{event?.title}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/events/${event?.id}`}>View</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event?.description || "No description"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Date:</span>{" "}
                  {event?.date ? new Date(event.date).toLocaleDateString() : "Not scheduled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Created by:</span>{" "}
                  {event?.createdBy?.name || "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Event ID:</span> {event?.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    new Date(event?.date) > new Date()
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {new Date(event?.date) > new Date() ? "Upcoming" : "Past"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
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
          {!searchTerm && (
            <Button asChild className="mt-4">
              <Link href="/portal/events/new">Create First Event</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 