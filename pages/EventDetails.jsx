import React, { useState, useEffect } from "react";
import { Event } from "@/entities/Event";
import { EventApplication } from "@/entities/EventApplication";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users, Music, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ApplicationForm from "../components/events/ApplicationForm";

export default function EventDetailsPage() {
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEventDetails();
  }, []);

  const loadEventDetails = async () => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");

    try {
      const userData = await User.me();
      setUser(userData);
      
      const eventData = await Event.filter({ id: eventId });
      if (eventData.length > 0) {
        setEvent(eventData[0]);
        
        // Check for existing application
        const applications = await EventApplication.filter({
          event_id: eventId,
          user_email: userData.email
        });
        if (applications.length > 0) {
          setExistingApplication(applications[0]);
        }
      }
    } catch (error) {
      console.error("Error loading event details:", error);
    }
    setLoading(false);
  };

  const handleApplicationSubmitted = () => {
    setShowApplicationForm(false);
    loadEventDetails();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-64"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
        <Button onClick={() => navigate(createPageUrl("Events"))}>
          Back to Events
        </Button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
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
          <p className="text-gray-400">Event Details & Application</p>
        </div>
      </div>

      {/* Event Cover */}
      {event.cover_image && (
        <div className="h-64 overflow-hidden rounded-xl">
          <img 
            src={event.cover_image} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Event Info */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Date & Time</p>
                <p className="text-white font-medium">
                  {format(eventDate, "EEE, MMM d 'at' h:mm a")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white font-medium">{event.location_name}</p>
                {existingApplication?.status === "approved" && (
                  <p className="text-sm text-green-400 mt-1">
                    Address: {event.location_address}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Capacity</p>
                <p className="text-white font-medium">{event.capacity} people</p>
              </div>
            </div>
            
            {event.genres && (
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-pink-400" />
 
