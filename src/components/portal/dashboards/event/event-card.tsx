import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/jotai/events/event-types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IEventCard {
  event: Event;
  canModify: boolean;
  onDelete: (id: number, title: string) => void;
}

const EventCard: FC<IEventCard> = ({ event, canModify, onDelete }) => {
  return (
    <Card key={event?.id} className="hover-scale">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{event?.title}</span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/portal/events/${event?.id}`}>View</Link>
            </Button>
            {canModify && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(event.id, event.title)}
              >
                Delete
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event?.description || "No description"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Date:</span>{" "}
            {event?.date
              ? new Date(event.date).toLocaleDateString()
              : "Not scheduled"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Created by:</span>{" "}
            {event?.createdBy?.name || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Event ID:</span> {event?.id}
          </p>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Status:</span>{" "}
            <Badge
              variant="secondary"
              className={`text-xs ${
                new Date(event?.date) > new Date()
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {new Date(event?.date) > new Date() ? "Upcoming" : "Past"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
