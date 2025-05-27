import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function MeditationApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [accessType, setAccessType] = useState(null);
  const [code, setCode] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [freeAccessAllowed, setFreeAccessAllowed] = useState(true);

  // Helper to get date string like 'YYYY-MM-DD'
  const getTodayString = () => new Date().toISOString().split("T")[0];

  // Check on mount if free session was accessed today
  useEffect(() => {
    const lastFreeAccess = localStorage.getItem("lastFreeAccessDate");
    if (lastFreeAccess === getTodayString()) {
      setFreeAccessAllowed(false);
    }
  }, []);

  // Handle free session start
  const handleStartFree = () => {
    if (!freeAccessAllowed) return;
    setAccessType("free");
    setShowVideo(true);
    localStorage.setItem("lastFreeAccessDate", getTodayString());
    setFreeAccessAllowed(false);
  };

  // Reset to choices after 11 minutes of free session
  useEffect(() => {
    let timeout;
    if (accessType === "free" && showVideo) {
      timeout = setTimeout(() => {
        setShowVideo(false);
        setAccessType(null);
      }, 660000); // 11 minutes
    }
    return () => clearTimeout(timeout);
  }, [accessType, showVideo]);

  const handleLogin = () => setLoggedIn(true);
  const handleCodeSubmit = () => {
    if (code === "PREMIUM123") setAccessType("premium");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf4ea] to-[#fffaf3] text-[#014421] p-4">
      {showVideo ? (
        <div className="fixed inset-0 z-50 bg-black">
          <video
            className="w-full h-full object-cover"
            src="/free-session.mp4"
            autoPlay
            controls={false}
            muted
          />
        </div>
      ) : !loggedIn ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md mx-auto mt-24 bg-white p-6 rounded-2xl shadow-xl border border-[#d4af37]"
        >
          <h1 className="text-2xl font-serif text-center mb-4 text-[#014421]">Welcome to Serene AI</h1>
          <Input placeholder="Enter email / phone" className="mb-2" />
          <Button className="w-full bg-[#d4af37] text-white" onClick={handleLogin}>
            Continue
          </Button>
        </motion.div>
      ) : !accessType ? (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
        >
          <Card className="bg-[#fffaf3] border-[#d4af37] shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif text-[#014421] mb-2">Free Meditation</h2>
              <p className="mb-4">Enjoy an 11-minute pre-recorded session.</p>
              <Button
                onClick={handleStartFree}
                className="bg-[#d4af37] text-white"
                disabled={!freeAccessAllowed}
                title={!freeAccessAllowed ? "Free session is available once daily." : ""}
              >
                {freeAccessAllowed ? "Start Free" : "Free Session Used Today"}
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#d4af37] shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif text-[#014421] mb-2">Premium AI Meditation</h2>
              <p className="mb-4">Personalized sessions based on your mood & vitals.</p>
              <Input
                placeholder="Enter access code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mb-2"
              />
              <Button className="bg-[#d4af37] text-white" onClick={handleCodeSubmit}>
                Access Premium
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : accessType === "premium" ? (
        <div className="mt-10 text-center">
          <Tabs defaultValue="mood" className="max-w-3xl mx-auto mt-8">
            <TabsList className="grid grid-cols-3 gap-2 bg-[#d4af37] text-white">
              <TabsTrigger value="mood">Mood Input</TabsTrigger>
              <TabsTrigger value="session">Live Session</TabsTrigger>
              <TabsTrigger value="insights">Progress</TabsTrigger>
            </TabsList>
            <TabsContent value="mood">
              <div className="p-4 bg-[#fffaf3] rounded-xl shadow">
                <h3 className="text-lg font-semibold text-[#014421]">How are you feeling today?</h3>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline">😌 Calm</Button>
                  <Button variant="outline">😔 Stressed</Button>
                  <Button variant="outline">😊 Happy</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="session">
              <div className="p-4 bg-[#fffaf3] rounded-xl shadow">
                <h3 className="text-lg font-semibold text-[#014421]">AI-Driven Live Session</h3>
                <p className="mt-2">Real-time adaptive visuals and audio based on your inputs...</p>
              </div>
            </TabsContent>
            <TabsContent value="insights">
              <div className="p-4 bg-[#fffaf3] rounded-xl shadow">
                <h3 className="text-lg font-semibold text-[#014421]">Your Progress</h3>
                <p className="mt-2">Mood trends, breath rate changes, personalized suggestions...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
