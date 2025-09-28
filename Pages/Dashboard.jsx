import React, { useState, useEffect } from "react";
import { Event } from "@/entities/Event";
import { EventRole } from "@/entities/EventRole";
import { EventApplication } from "@/entities/EventApplication";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Shield, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

import OrganizerDashboard from "../components/dashboard/OrganizerDashboard";
import BouncerDashboard from "../components/dashboard/BouncerDashboard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [bouncerEvents, setBouncerEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Get all events created by user (they're automatically organizers)
      const allEvents = await Event.list("-created_date");
      const userCreatedEvents = allEvents.filter(event => event.created_by === userData.email);
      setOrganizerEvents(userCreatedEvents);

      // Also check for explicit organizer roles
      try {
        const organizerRoles = await EventRole.filter({ user_email: userData.email, role: "organizer" });
        const additionalOrganizerEventIds = organizerRoles.map(role => role.event_id);
        
        const additionalEvents = allEvents.filter(event => 
          additionalOrganizerEventIds.includes(event.id) && 
          !userCreatedEvents.some(created => created.id === event.id)
        );
        
        if (additionalEvents.length > 0) {
          setOrganizerEvents(prev => [...prev, ...additionalEvents]);
        }
      } catch (error) {
        console.log("No additional organizer roles found");
      }

      // Get events where user is bouncer
      try {
        const bouncerRoles = await EventRole.filter({ user_email: userData.email, role: "bouncer" });
        const bouncerEventIds = bouncerRoles.map(role => role.event_id);
        
        if (bouncerEventIds.length > 0) {
          const userBouncerEvents = allEvents.filter(event => bouncerEventIds.includes(event.id));
          setBouncerEvents(userBouncerEvents);
        }
      } catch (error) {
        console.log("No bouncer roles found");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-black min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 border-2 border-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasOrganizerRole = organizerEvents.length > 0;
  const hasBouncerRole = bouncerEvents.length > 0;

  if (!hasOrganizerRole && !hasBouncerRole) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-black min-h-screen">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 font-mono">ACCESS DENIED</h2>
          <p className="text-gray-400 mb-6 font-mono">
            CLEARANCE_LEVEL_INSUFFICIENT
          </p>
          <div className="h-1 w-48 bg-red-600 mx-auto mb-6"></div>
          <Button 
            className="bg-red-600 text-black font-bold py-3 px-6 uppercase border-2 border-red-700 tracking-wide font-mono"
            onClick={() => window.location.href = "/events"}
          >
            CREATE FIRST EVENT
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono tracking-wider mb-2">
          CONTROL CENTER
        </h1>
        <div className="h-1 w-40 bg-gradient-to-r from-red-600 to-orange-600 mb-3"></div>
        <p className="text-gray-400 font-mono">SYSTEM_ADMIN_INTERFACE</p>
      </div>

      <Tabs defaultValue={hasOrganizerRole ? "organizer" : "bouncer"} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800 border-2 border-gray-700 p-1">
          {hasOrganizerRole && (
            <TabsTrigger 
              value="organizer" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-black font-mono font-bold"
            >
              ORGANIZER [{organizerEvents.length}]
            </TabsTrigger>
          )}
          {hasBouncerRole && (
            <TabsTrigger 
              value="bouncer"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-black font-mono font-bold"
            >
              SECURITY [{bouncerEvents.length}]
            </TabsTrigger>
          )}
        </TabsList>

        {hasOrganizerRole && (
          <TabsContent value="organizer">
            <OrganizerDashboard events={organizerEvents} user={user} onRefresh={loadDashboardData} />
          </TabsContent>
        )}

        {hasBouncerRole && (
          <TabsContent value="bouncer">
            <BouncerDashboard events={bouncerEvents} user={user} onRefresh={loadDashboardData} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
