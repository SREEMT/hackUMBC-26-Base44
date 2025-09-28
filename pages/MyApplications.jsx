import React, { useState, useEffect } from "react";
import { EventApplication } from "@/entities/EventApplication";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userApplications = await EventApplication.filter({ user_email: userData.email }, "-created_date");
      setApplications(userApplications);
      
      // Load event details for each application
      const eventIds = [...new Set(userApplications.map(app => app.event_id))];
      const eventData = {};
      
      for (const eventId of eventIds) {
        try {
          const eventList = await Event.filter({ id: eventId });
          if (eventList.length > 0) {
            eventData[eventId] = eventList[0];
          }
        } catch (error) {
          console.error("Error loading event:", eventId, error);
        }
      }
      
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading applications:", error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "denied": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "waitlisted": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "denied": return <XCircle className="w-4 h-4" />;
      case "waitlisted": return <Eye className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const upcomingApplications = applications.filter(app => {
    const event = events[app.event_id];
    return event && new Date(event.date) > new Date();
  });

  const pastApplications = applications.filter(app => {
    const event = events[app.event_id];
    return event && new Date(event.date) <= new Date();
  });

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-64"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <Button onClick={() => User.login()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          My Applications
        </h1>
        <p className="text-gray-400 mt-2">Track your event applications and status</p>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Upcoming Events ({upcomingApplications.length})
        </h2>
        
        {upcomingApplications.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No upcoming applications</p>
              <Link to={createPageUrl("Events")}>
                <Button className="mt-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingApplications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                event={events[application.event_id]}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastApplications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
 
