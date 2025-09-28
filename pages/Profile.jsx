
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Phone, Mail, Calendar, Settings } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    bio: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        phone: userData.phone || "",
        bio: userData.bio || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await User.updateMyUserData(formData);
      await loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-black min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-64"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-black min-h-screen">
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 mono-text">SIGN IN REQUIRED</h2>
          <p className="text-gray-400 mb-6 mono-text">YOU NEED TO SIGN IN TO VIEW YOUR PROFILE.</p>
          <Button 
            onClick={() => User.login()}
            className="brutalist-button mono-text"
          >
            SIGN IN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-black min-h-screen">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-black flex items-center justify-center brutalist-surface">
          <span className="text-white font-bold text-2xl mono-text">
            {user.full_name?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mono-text tracking-wider mb-2">
            USER PROFILE
          </h1>
          <div className="h-1 w-32 bg-red-600 mb-2"></div>
          <p className="text-gray-400 mono-text">SYSTEM_USER_CONFIG</p>
        </div>
      </div>

      {/* Profile Overview */}
      <Card className="concrete-card">
        <CardHeader className="bg-concrete-dark border-b-2 border-iron-gray">
          <CardTitle className="text-white flex items-center gap-2 mono-text">
            <UserIcon className="w-5 h-5" />
            ACCOUNT DATA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-steel-gray">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400 mono-text">EMAIL</p>
                <p className="text-white font-medium mono-text">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400 mono-text">USER_ID</p>
                <p className="text-white font-medium mono-text">{user.full_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400 mono-text">CREATED</p>
                <p className="text-white font-medium mono-text">
                  {new Date(user.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-black mono-text font-bold">
                {user.role === 'admin' ? 'ADMIN' : 'USER'}
              </Badge>
              <Badge className={`mono-text font-bold ${
                user.verification_status === 'verified' 
                  ? 'bg-green-600 text-black' 
                  : 'bg-orange-600 text-black'
              }`}>
                {(user.verification_status || 'pending').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile */}
      <Card className="concrete-card">
        <CardHeader className="bg-concrete-dark border-b-2 border-iron-gray">
 
