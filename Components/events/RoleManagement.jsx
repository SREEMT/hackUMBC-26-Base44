import React, { useState } from "react";
import { EventRole } from "@/entities/EventRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Crown, Shield, Music } from "lucide-react";

const ROLE_CONFIGS = {
  organizer: {
    icon: Crown,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    permissions: ["manage_event", "screen_attendees", "view_dashboard", "check_in", "flag_attendees"]
  },
  bouncer: {
    icon: Shield,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    permissions: ["check_in", "flag_attendees", "view_dashboard"]
  },
  performer: {
    icon: Music,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    permissions: ["view_dashboard"]
  }
};

export default function RoleManagement({ event, roles, currentUser, onRolesUpdated }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRole, setNewRole] = useState({
    user_email: "",
    role: "bouncer"
  });
  const [loading, setLoading] = useState(false);

  const handleAddRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = ROLE_CONFIGS[newRole.role];
      await EventRole.create({
        event_id: event.id,
        user_email: newRole.user_email,
        role: newRole.role,
        permissions: config.permissions,
        assigned_by: currentUser.email
      });
      
      setNewRole({ user_email: "", role: "bouncer" });
      setShowAddForm(false);
      onRolesUpdated();
    } catch (error) {
      console.error("Error adding role:", error);
    }
    setLoading(false);
  };

  const handleRemoveRole = async (roleId) => {
    if (window.confirm("Are you sure you want to remove this person's access?")) {
      try {
        // In a real app, you'd implement role deletion
        // For now, we'll just refresh the data
        onRolesUpdated();
      } catch (error) {
        console.error("Error removing role:", error);
      }
    }
  };

  const isCreator = event.created_by === currentUser.email;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Team Members</CardTitle>
          {isCreator && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showAddForm && (
            <Card className="bg-gray-700/30 border-gray-600">
              <CardContent className="p-4">
                <form onSubmit={handleAddRole} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-200">Email Address</Label>
                    <Input
                      type="email"
                      value={newRole.user_email}
                      onChange={(e) => setNewRole(prev => ({...prev, user_email: e.target.value}))}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-200">Role</Label>
                    <Select
                      value={newRole.role}
                      onValueChange={(value) => setNewRole(prev => ({...prev, role: value}))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="bouncer">Bouncer - Check-in & Security</SelectItem>
                        <SelectItem value="organizer">Organizer - Full Management</SelectItem>
                        <SelectItem value="performer">Performer - Dashboard Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
