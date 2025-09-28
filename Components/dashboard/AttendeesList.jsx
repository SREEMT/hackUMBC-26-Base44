import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, MessageSquare, Flag, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AttendeesList({ attendees, onUpdateStatus, showActions, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "denied": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "waitlisted": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (attendees.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No attendees in this category yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {attendees.map(attendee => (
        <Card key={attendee.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-blue-500/50 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {attendee.user_email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{attendee.user_email}</h4>
                    <Badge className={`text-xs ${getStatusColor(attendee.status)}`}>
                      {attendee.status}
                    </Badge>
                    {attendee.checked_in && (
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                        Checked In
                      </Badge>
                    )}
                    {attendee.flagged && (
                      <Badge className="bg-red-500/20 text-red-400 text-xs">
                        <Flag className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    Applied {format(new Date(attendee.created_date), "MMM d 'at' h:mm a")}
                  </p>
                  
                  {attendee.application_text && (
                    <div className="bg-gray-700/30 rounded-lg p-3 mb-2">
                      <p className="text-sm text-gray-300">{attendee.application_text}</p>
                    </div>
                  )}
                  
                  {attendee.guests_brought > 0 && (
                    <div className="text-sm text-gray-400">
                      <span className="font-medium">Guests:</span> {attendee.guests_brought}
 
