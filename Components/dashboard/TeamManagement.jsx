import React, { useState } from "react";
import { EventRole } from "@/entities/EventRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Crown, Shield, Music, UserPlus } from "lucide-react";

const ROLE_CONFIGS = {
  organizer: {
    icon: Crown,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    permissions: ["manage_event", "screen_attendees", "view_dashboard", "check_in", "flag_attendees"],
    description: "Full event control + team management"
  },
  bouncer: {
    icon: Shield,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    permissions: ["check_in", "flag_attendees", "view_dashboard"],
    description: "Door control + security operations"
  },
  performer: {
    icon: Music,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    permissions: ["view_dashboard"],
    description: "Dashboard access only"
  }
};

export default function TeamManagement({ event, teamMembers, currentUser, onTeamUpdated }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    user_email: "",
    role: "bouncer"
  });
  const [loading, setLoading] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = ROLE_CONFIGS[newMember.role];
      await EventRole.create({
        event_id: event.id,
        user_email: newMember.user_email,
        role: newMember.role,
        permissions: config.permissions,
        assigned_by: currentUser.email
      });
      
      setNewMember({ user_email: "", role: "bouncer" });
      setShowAddForm(false);
      onTeamUpdated();
    } catch (error) {
      console.error("Error adding team member:", error);
    }
    setLoading(false);
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Remove this team member's access?")) {
      try {
        // In a real implementation, you'd delete the role
        console.log("Removing member:", memberId);
        onTeamUpdated();
      } catch (error) {
        console.error("Error removing team member:", error);
      }
    }
  };

  const isCreator = event.created_by === currentUser.email;
  const bouncers = teamMembers.filter(m => m.role === "bouncer");
  const organizers = teamMembers.filter(m => m.role === "organizer");
  const performers = teamMembers.filter(m => m.role === "performer");

  return (
    <div className="space-y-6">
      {/* Add New Member */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white font-mono flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            TEAM MANAGEMENT
          </CardTitle>
          {isCreator && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 font-mono"
            >
              <Plus className="w-4 h-4 mr-2" />
              ADD MEMBER
            </Button>
          )}
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-gray-700 pt-6">
            <form onSubmit={handleAddMember} className="space-y-4 bg-gray-700/30 p-4 rounded border-2 border-gray-600">
              <div className="space-y-2">
                <Label className="text-gray-200 font-mono">EMAIL ADDRESS</Label>
                <Input
                  type="email"
                  value={newMember.user_email}
                  onChange={(e) => setNewMember(prev => ({...prev, user_email: e.target.value}))}
                  className="bg-gray-800 border-gray-600 text-white font-mono"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-200 font-mono">ROLE</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember(prev => ({...prev, role: value}))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="bouncer" className="font-mono">BOUNCER - Security & Check-in</SelectItem>
                    <SelectItem value="organizer" className="font-mono">ORGANIZER - Full Control</SelectItem>
                    <SelectItem value="performer" className="font-mono">PERFORMER - Dashboard Access</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 font-mono">
                  {ROLE_CONFIGS[newMember.role].description}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 font-mono"
                >
                  {loading ? "ADDING..." : "ADD TO TEAM"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-gray-600 font-mono"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Event Creator */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white font-mono flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-400" />
            EVENT CREATOR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-purple-900/10 rounded border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold font-mono">
                  {event.created_by.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-white font-mono">{event.created_by}</h4>
                <p className="text-sm text-purple-300 font-mono">SUPREME COMMANDER</p>
              </div>
            </div>
            <Badge className="bg-purple-600 text-black font-mono font-bold">
              <Crown className="w-3 h-3 mr-1" />
              CREATOR
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Team Roles */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Organizers */}
        <Card className="bg-purple-900/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400 font-mono flex items-center gap-2">
              <Crown className="w-5 h-5" />
              ORGANIZERS [{organizers.length}]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {organizers.length === 0 ? (
              <p className="text-gray-500 font-mono text-sm">NO ADDITIONAL ORGANIZERS</p>
            ) : (
              organizers.map(member => (
                <TeamMemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={handleRemoveMember}
                  canRemove={isCreator}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Bouncers */}
        <Card className="bg-blue-900/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-blue-400 font-mono flex items-center gap-2">
              <Shield className="w-5 h-5" />
              SECURITY [{bouncers.length}]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bouncers.length === 0 ? (
              <p className="text-gray-500 font-mono text-sm">NO BOUNCERS ASSIGNED</p>
            ) : (
              bouncers.map(member => (
                <TeamMemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={handleRemoveMember}
                  canRemove={isCreator}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Performers */}
        <Card className="bg-green-900/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono flex items-center gap-2">
              <Music className="w-5 h-5" />
              PERFORMERS [{performers.length}]
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performers.length === 0 ? (
              <p className="text-gray-500 font-mono text-sm">NO PERFORMERS ADDED</p>
            ) : (
              performers.map(member => (
                <TeamMemberCard 
                  key={member.id} 
                  member={member} 
                  onRemove={handleRemoveMember}
                  canRemove={isCreator}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Permissions Reference */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white font-mono">PERMISSION MATRIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(ROLE_CONFIGS).map(([roleName, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={roleName} className="p-4 bg-gray-700/30 rounded border border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <IconComponent className="w-5 h-5 text-gray-400" />
                  <h4 className="font-medium text-white font-mono uppercase">{roleName}</h4>
                  <Badge className={config.color + " font-mono"}>{config.description}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {config.permissions.map(permission => (
                    <div key={permission} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="font-mono">{permission.replace(/_/g, '_').toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamMemberCard({ member, onRemove, canRemove }) {
  const config = ROLE_CONFIGS[member.role];
  const IconComponent = config.icon;
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700/20 rounded border border-gray-600">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm font-mono">
            {member.user_email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-medium text-white font-mono text-sm">{member.user_email}</h4>
          <p className="text-xs text-gray-400 font-mono">
            Added by {member.assigned_by}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge className={config.color + " font-mono text-xs"}>
          <IconComponent className="w-3 h-3 mr-1" />
          {member.role.toUpperCase()}
        </Badge>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(member.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-6 h-6"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
