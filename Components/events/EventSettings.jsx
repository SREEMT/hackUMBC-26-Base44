import React, { useState } from "react";
import { Event } from "@/entities/Event";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";

const GENRES = [
  "house", "techno", "drum-and-bass", "dubstep", "trance", 
  "hardstyle", "ambient", "breakbeat"
];

export default function EventSettings({ event, onEventUpdated }) {
  const [formData, setFormData] = useState({
    name: event.name || "",
    description: event.description || "",
    date: event.date ? event.date.slice(0, 16) : "",
    location_name: event.location_name || "",
    location_address: event.location_address || "",
    capacity: event.capacity || 50,
    guest_passes_per_attendee: event.guest_passes_per_attendee || 1,
    genres: event.genres || [],
    screening_required: event.screening_required !== false
  });
  const [saving, setSaving] = useState(false);

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Event.update(event.id, formData);
      onEventUpdated();
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setSaving(false);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Event Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Event Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-200">Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              className="bg-gray-700 border-gray-600 text-white h-24"
              placeholder="Tell people what makes this event special..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Location Name</Label>
              <Input
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({...prev, location_name: e.target.value}))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g., The Underground Warehouse"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-200">Full Address (Hidden until approved)</Label>
              <Input
                value={formData.location_address}
                onChange={(e) => setFormData(prev => ({...prev, location_address: e.target.value}))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="123 Secret St, City, State"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-200">Capacity</Label>
              <Input
                type="number"
                min="1"
