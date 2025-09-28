import React, { useState, useEffect, useCallback } from "react";
import { Attendee } from "@/entities/Attendee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Flag, Search, UserCheck } from "lucide-react";
import { format } from "date-fns";

export default function BouncerDashboard({ events, user }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAttendees = useCallback(async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      const eventAttendees = await Attendee.filter({ event_id: selectedEvent.id, status: "approved" });
      setAttendees(eventAttendees);
    } catch (error) {
      console.error("Error loading attendees:", error);
    }
    setLoading(false);
  }, [selectedEvent]);

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      // Prioritize live events
      const liveEvent = events.find(e => e.status === "live");
      setSelectedEvent(liveEvent || events[0]);
    }
  }, [events, selectedEvent]);

  useEffect(() => {
    loadAttendees();
  }, [loadAttendees]);

  const checkInAttendee = async (attendeeId) => {
    try {
      await Attendee.update(attendeeId, {
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.email
      });
      loadAttendees();
    } catch (error) {
      console.error("Error checking in attendee:", error);
    }
  };

  const flagAttendee = async (attendeeId, reason) => {
    try {
      const attendee = attendees.find(a => a.id === attendeeId);
      const newNote = {
        by: user.email,
        text: `FLAGGED: ${reason}`,
        timestamp: new Date().toISOString()
      };
      
      await Attendee.update(attendeeId, {
        flagged: true,
        flag_reason: reason,
        notes: [...(attendee.notes || []), newNote]
      });
      loadAttendees();
    } catch (error) {
      console.error("Error flagging attendee:", error);
    }
  };

  const filteredAttendees = attendees.filter(attendee =>
    attendee.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedInCount = attendees.filter(a => a.checked_in).length;
  const flaggedCount = attendees.filter(a => a.flagged).length;

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <div className="flex flex-wrap gap-3">
        {events.map(event => (
          <Button
            key={event.id}
            variant={selectedEvent?.id === event.id ? "default" : "outline"}
            onClick={() => setSelectedEvent(event)}
            className={selectedEvent?.id === event.id 
              ? "bg-green-600 hover:bg-green-700" 
              : "border-gray-600 hover:border-green-500"
            }
          >
            {event.name}
            {event.status === "live" && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1 animate-pulse">LIVE</Badge>
 
