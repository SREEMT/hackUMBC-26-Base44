
import React, { useState, useEffect } from "react";
import { Event } from "@/entities/Event";
import { EventRole } from "@/entities/EventRole";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Music } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CreateEventModal from "../components/events/CreateEventModal";
import EventCard from "../components/events/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const allEvents = await Event.list("-created_date");
      const publishedEvents = allEvents.filter(event => event.status === "published" || event.status === "live");
      setEvents(publishedEvents);

      const userCreatedEvents = allEvents.filter(event => event.created_by === userData.email);
      setMyEvents(userCreatedEvents);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleEventCreated = () => {
    setShowCreateModal(false);
    loadData();
  };

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const liveEvents = events.filter(event => event.status === "live");

  return (
    <div className="p-6 max-w-7xl mx-auto bg-black min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mono-text tracking-wider mb-2">
            UNDERGROUND
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-red-600 to-orange-600 mb-3"></div>
          <p className="text-gray-400 mono-text">EXCLUSIVE_ACCESS_EVENTS</p>
        </div>
        
        {user && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="brutalist-button neon-accent mono-text"
          >
            + CREATE EVENT
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-steel-gray p-1 concrete-card">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-3 px-4 font-semibold mono-text transition-all duration-300 ${
            activeTab === "all"
              ? "bg-red-600 text-black"
              : "text-gray-400 hover:text-white hover:bg-iron-gray"
          }`}
        >
          ALL EVENTS [{upcomingEvents.length}]
        </button>
        {liveEvents.length > 0 && (
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-3 px-4 font-semibold mono-text transition-all duration-300 ${
              activeTab === "live"
                ? "bg-red-600 text-black pulse-danger"
                : "text-gray-400 hover:text-white hover:bg-iron-gray"
            }`}
          >
            LIVE NOW [{liveEvents.length}]
          </button>
        )}
        {user && myEvents.length > 0 && (
          <button
            onClick={() => setActiveTab("mine")}
            className={`flex-1 py-3 px-4 font-semibold mono-text transition-all duration-300 ${
              activeTab === "mine"
                ? "bg-red-600 text-black"
                : "text-gray-400 hover:text-white hover:bg-iron-gray"
            }`}
          >
            MY EVENTS [{myEvents.length}]
          </button>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="concrete-card h-80"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "all" && upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} user={user} />
          ))}
          {activeTab === "live" && liveEvents.map(event => (
            <EventCard key={event.id} event={event} user={user} />
          ))}
          {activeTab === "mine" && myEvents.map(event => (
            <EventCard key={event.id} event={event} user={user} isOwner={true} />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
