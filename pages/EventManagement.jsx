import React, { useState, useEffect } from "react";
import { Event } from "@/entities/Event";
import { EventRole } from "@/entities/EventRole";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Users, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import RoleManagement from "../components/events/RoleManagement";
import EventSettings from "../components/events/EventSettings";

export default function EventManagementPage() {
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");

    try {
      const userData = await User.me();
      setUser(userData);
      
      const eventData = await Event.filter({ id: eventId });
      if (eventData.length > 0) {
        const eventItem = eventData[0];
        setEvent(eventItem);
        
        // Check permissions - must be creator or organizer
        if (eventItem.created_by === userData.email) {
          setHasPermission(true);
        } else {
          const userRoles = await EventRole.filter({
            event_id: eventId,
            user_email: userData.email,
            role: "organizer"
          });
          setHasPermission(userRoles.length > 0);
        }
        
        // Load all roles for this event
        const allRoles = await EventRole.filter({ event_id: eventId });
        setRoles(allRoles);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
    }
    setLoading(false);
  };

  const handleEventUpdated = () => {
    loadEventData();
  };

  const deleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      try {
        // In a real app, you'd implement event deletion
        // For now, we'll just redirect back
        navigate(createPageUrl("Events"));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const toggleEventVisibility = async () => {
    try {
      const newStatus = event.status === "published" ? "draft" : "published";
      await Event.update(event.id, { status: newStatus });
      loadEventData();
    } catch (error) {
      console.error("Error updating event visibility:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-64"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event || !hasPermission) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          {!event ? "Event Not Found" : "Access Denied"}
        </h2>
        <p className="text-gray-400 mb-6">
          {!event 
            ? "The event you're looking for doesn't exist."
            : "You don't have permission to manage this event."
          }
        </p>
        <Button onClick={() => navigate(createPageUrl("Events"))}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Events"))}
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
            <p className="text-gray-400">Event Management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={event.status === "published" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
            {event.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-800">
          <TabsTrigger 
            value="settings"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
 
