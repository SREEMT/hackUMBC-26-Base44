import React, { useState } from "react";
import { Event } from "@/entities/Event";
import { EventRole } from "@/entities/EventRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Calendar, MapPin, Users, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GENRES = [
  "house", "techno", "drum-and-bass", "dubstep", "trance", 
  "hardstyle", "ambient", "breakbeat"
];

export default function CreateEventModal({ user, onClose, onEventCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location_name: "",
    location_address: "",
    capacity: 50,
    guest_passes_per_attendee: 1,
    genres: [],
    screening_required: true
  });
  const [loading, setLoading] = useState(false);

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        created_by: user.email,
        status: "published"
      };

      const newEvent = await Event.create(eventData);
      
      // Create organizer role for the creator
      await EventRole.create({
        event_id: newEvent.id,
        user_email: user.email,
        role: "organizer",
        permissions: ["manage_event", "screen_attendees", "view_dashboard", "check_in", "flag_attendees"],
        assigned_by: user.email
      });

      onEventCreated();
    } catch (error) {
      console.error("Error creating event:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Create New Event
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Event Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="bg-gray-800 border-gray-600 text-white h-24"
                placeholder="Tell people what makes this event special..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-200">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-gray-200">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({...prev, capacity: parseInt(e.target.value)}))}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_name" className="text-gray-200">Location Name</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({...prev, location_name: e.target.value}))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., The Underground Warehouse"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address" className="text-gray-200">Full Address (Hidden until approved)</Label>
              <Input
                id="location_address"
                value={formData.location_address}
                onChange={(e) => setFormData(prev => ({...prev, location_address: e.target.value}))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="123 Secret St, City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest_passes" className="text-gray-200">Guest Passes per Attendee</Label>
              <Select
                value={formData.guest_passes_per_attendee.toString()}
                onValueChange={(value) => setFormData(prev => ({...prev, guest_passes_per_attendee: parseInt(value)}))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="0">No Guests Allowed</SelectItem>
                  <SelectItem value="1">1 Guest</SelectItem>
                  <SelectItem value="2">2 Guests</SelectItem>
                  <SelectItem value="3">3 Guests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-200">Music Genres</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={formData.genres.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer text-center justify-center transition-all duration-300 ${
                      formData.genres.includes(genre)
                        ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
                        : "border-gray-600 text-gray-400 hover:border-blue-500"
                    }`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
