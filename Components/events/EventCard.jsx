
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Music, Crown, Settings } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";

export default function EventCard({ event, user, isOwner = false }) {
  const isLive = event.status === "live";
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <Card className="group concrete-card hover:neon-accent transition-all duration-300 overflow-hidden bg-black border-iron-gray">
      {event.cover_image && (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={event.cover_image} 
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}
      
      <CardHeader className="pb-3 bg-concrete-dark">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mono-text tracking-wide">
              {event.name.toUpperCase()}
            </h3>
            {isLive && (
              <Badge className="bg-red-600 text-black animate-pulse mt-2 mono-text font-bold">
                ● LIVE
              </Badge>
            )}
            {isOwner && (
              <Badge className="bg-orange-600 text-black mt-2 mono-text font-bold">
                OWNED
              </Badge>
            )}
          </div>
          
          {isOwner && (
            <Link to={createPageUrl(`EventManagement?eventId=${event.id}`)}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 hover:bg-red-900/20">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 bg-concrete-dark">
        <div className="flex items-center gap-2 text-sm text-gray-300 mono-text">
          <Calendar className="w-4 h-4" />
          <span>
            {format(eventDate, "dd.MM.yy - HH:mm").toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-300 mono-text">
          <MapPin className="w-4 h-4" />
          <span>{event.location_name.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-300 mono-text">
          <Users className="w-4 h-4" />
          <span>CAP: {event.capacity}</span>
        </div>

        {event.genres && event.genres.length > 0 && (
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {event.genres.slice(0, 3).map(genre => (
                <Badge key={genre} className="text-xs bg-steel-gray text-gray-300 border-iron-gray mono-text">
                  {genre.replace(/-/g, "_").toUpperCase()}
                </Badge>
              ))}
              {event.genres.length > 3 && (
                <Badge className="text-xs bg-steel-gray text-gray-300 border-iron-gray mono-text">
                  +{event.genres.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {event.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mono-text">
            {event.description}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          {user && !isOwner && (
            <Link to={createPageUrl(`EventDetails?eventId=${event.id}`)} className="flex-1">
              <Button className="w-full brutalist-button text-sm mono-text">
                REQUEST ACCESS
              </Button>
            </Link>
          )}
          
          {!user && (
            <Button 
              className="w-full bg-steel-gray hover:bg-iron-gray text-sm mono-text border-2 border-iron-gray" 
              onClick={() => User.login()}
            >
              LOGIN REQUIRED
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
