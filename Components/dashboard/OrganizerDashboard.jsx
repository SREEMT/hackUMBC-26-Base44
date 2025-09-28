import React, { useState, useEffect, useCallback } from "react";
import { EventApplication } from "@/entities/EventApplication";
import { EventRole } from "@/entities/EventRole";
import { Event } from "@/entities/Event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Settings, Plus, Shield, Crown } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import EventOverviewCard from "./EventOverviewCard";
import ApplicationsList from "./ApplicationsList";
import TeamManagement from "./TeamManagement";

export default function OrganizerDashboard({ events, user, onRefresh }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEventData = useCallback(async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      // Load applications for selected event
      const eventApplications = await EventApplication.filter({ event_id: selectedEvent.id }, "-created_date");
      setApplications(eventApplications);
      
      // Load team members for selected event
      const roles = await EventRole.filter({ event_id: selectedEvent.id });
      setTeamMembers(roles);
    } catch (error) {
      console.error("Error loading event data:", error);
    }
    setLoading(false);
  }, [selectedEvent]);

  useEffect(() => {
    // Select first live event, then first event if no live events
    if (events.length > 0 && !selectedEvent) {
      const liveEvent = events.find(e => e.status === "live");
      setSelectedEvent(liveEvent || events[0]);
    }
  }, [events, selectedEvent]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await EventApplication.update(applicationId, { 
        status,
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString()
      });
      loadEventData();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const getEventStats = (event) => {
    const eventApps = applications.filter(a => a.event_id === event.id);
    return {
      total: eventApps.length,
      pending: eventApps.filter(a => a.status === "pending").length,
      approved: eventApps.filter(a => a.status === "approved").length,
      denied: eventApps.filter(a => a.status === "denied").length,
      waitlisted: eventApps.filter(a => a.status === "waitlisted").length,
      checkedIn: 0 // TODO: implement when we have check-in data
    };
  };

  const liveEvents = events.filter(e => e.status === "live");
  const upcomingEvents = events.filter(e => e.status === "published" && new Date(e.date) > new Date());

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {liveEvents.length > 0 && (
        <Card className="bg-red-900/20 border-2 border-red-500 animate-pulse">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2 font-mono">
              <AlertTriangle className="w-5 h-5" />
              LIVE EVENTS ACTIVE [{liveEvents.length}]
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {liveEvents.map(event => (
                <Button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  variant={selectedEvent?.id === event.id ? "default" : "outline"}
                  className={`font-mono ${
                    selectedEvent?.id === event.id 
                      ? "bg-red-600 text-black" 
                      : "border-red-500 text-red-400 hover:bg-red-900/30"
                  }`}
                >
                  {event.name}
                  <Badge className="ml-2 bg-red-500 text-black text-xs animate-pulse">LIVE</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Selection */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white font-mono flex items-center justify-between">
            EVENT CONTROL MATRIX
            <Badge className="bg-blue-600 text-white font-mono">{events.length} TOTAL</Badge>
