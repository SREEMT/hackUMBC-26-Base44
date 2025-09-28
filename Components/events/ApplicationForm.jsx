import React, { useState } from "react";
import { EventApplication } from "@/entities/EventApplication";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Phone } from "lucide-react";

export default function ApplicationForm({ event, user, onSubmitted, onCancel }) {
  const [formData, setFormData] = useState({
    application_message: "",
    guests_requested: 0
  });
  const [step, setStep] = useState(1); // 1: Application, 2: Verification
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const application = await EventApplication.create({
        event_id: event.id,
        user_email: user.email,
        application_message: formData.application_message,
        guests_requested: formData.guests_requested,
        status: "pending",
        verified: false
      });
      
      setApplicationId(application.id);
      setStep(2);
    } catch (error) {
      console.error("Error submitting application:", error);
    }
    setIsSubmitting(false);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd verify the SMS code here
      // For demo purposes, we'll just mark as verified
      await EventApplication.update(applicationId, {
        verified: true,
        verification_code: verificationCode
      });
      
      onSubmitted();
    } catch (error) {
      console.error("Error verifying application:", error);
    }
    setIsSubmitting(false);
  };

  if (step === 2) {
    return (
      <div className="space-y-6">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="font-medium text-blue-400">Verification Required</h4>
                <p className="text-sm text-blue-300 mt-1">
                  We've sent a verification code to {user.phone || "your phone number"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-200">Verification Code</Label>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="bg-gray-700 border-gray-600 text-white text-center text-lg tracking-wider"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-400">
              Didn't receive a code? Check your messages or try again in 60 seconds.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || verificationCode.length !== 6}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {isSubmitting ? "Verifying..." : "Complete Application"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleApplicationSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-gray-200">
          Why do you want to attend this event? *
        </Label>
        <Textarea
          value={formData.application_message}
          onChange={(e) => setFormData(prev => ({...prev, application_message: e.target.value}))}
          placeholder="Tell us about your connection to the underground scene, what draws you to this event, and why you'd be a good addition to the crowd..."
