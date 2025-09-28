import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Music, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function EventOverviewCard({ event, stats }) {
  const getStatusColor = () => {
    switch (event.status) {
      case "live": return "bg-green-500 animate-pulse";
      case "published": return "bg-blue-500";
      case "ended": return "bg-gray-500";
      default: return "bg-yellow-500";
    }
  };

  const capacityPercentage = ((stats.approved / event.capacity) * 100).toFixed(1);

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl text-white">{event.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${getStatusColor()} text-white`}>
                {event.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {capacityPercentage}% Full
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.date), "EEE, MMM d 'at' h:mm a")}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>{event.location_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4" />
            <span>{stats.approved}/{event.capacity} capacity</span>
          </div>

          {event.genres && (
            <div className="flex items-center gap-2 text-gray-300">
              <Music className="w-4 h-4" />
              <span>{event.genres.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-bold text-lg">{stats.pending}</span>
            </div>
            <p className="text-xs text-gray-400">Pending</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold text-lg">{stats.approved}</span>
            </div>
            <p className="text-xs text-gray-400">Approved</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="font-bold text-lg">{stats.denied}</span>
            </div>
            <p className="text-xs text-gray-400">Denied</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="font-bold text-lg">{stats.checkedIn}</span>
            </div>
            <p className="text-xs text-gray-400">Checked In</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
