
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Brain, Sparkles, Settings, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import FaceAnalysisPanel from '@/components/FaceAnalysisPanel';
import VoiceAnalysisPanel from '@/components/VoiceAnalysisPanel';
import WearableDevicePanel from '@/components/WearableDevicePanel';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import MeditationPlayer from '@/components/MeditationPlayer';

import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';
import { useVoiceSensing } from '@/hooks/useVoiceSensing';
import { useWearableDevice } from '@/hooks/useWearableDevice';
import { generateEnvironmentSettings, generateInsights, generateSessionRecommendation } from '@/utils/aiEngine';
import { MeditationScript } from '@/types/meditation';
import { meditationScripts } from '@/data/meditationScripts';

const PremiumDashboard: React.FC = () => {
  const [isAnalysisActive, setIsAnalysisActive] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationScript | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [adaptationScore, setAdaptationScore] = useState(75);

  // Biometric hooks
  const faceAnalysis = useFaceAnalysis(isAnalysisActive);
  const voiceAnalysis = useVoiceSensing(isAnalysisActive);
  const wearableDevice = useWearableDevice();

  // Generate AI insights based on biometric data
  const sensorData = {
    voice: voiceAnalysis.metrics,
    face: faceAnalysis.metrics,
    wearable: wearableDevice.metrics
  };

  const insights = generateInsights(sensorData);
  const sessionRecommendation = generateSessionRecommendation(sensorData);
  const environmentSettings = generateEnvironmentSettings(sensorData);

  // Update adaptation score based on active analysis
  useEffect(() => {
    if (isAnalysisActive) {
      const activeComponents = [
        faceAnalysis.isAnalyzing,
        voiceAnalysis.isListening,
        wearableDevice.isConnected
      ].filter(Boolean).length;
      
      const baseScore = activeComponents * 25;
      const biometricBonus = Math.round((faceAnalysis.metrics.attentionLevel + 
                                       voiceAnalysis.metrics.clarity + 
                                       wearableDevice.metrics.heartRate) / 3);
      
      setAdaptationScore(Math.min(100, baseScore + biometricBonus));
    }
  }, [isAnalysisActive, faceAnalysis.metrics, voiceAnalysis.metrics, wearableDevice.metrics]);

  // Get recommended meditation based on current state
  const getRecommendedMeditation = (): MeditationScript | undefined => {
    if (sensorData.face.emotion === 'stressed' || sensorData.voice.tone === 'stressed') {
      return meditationScripts.find(m => m.energyType === 'calming');
    } else if (sensorData.face.attentionLevel < 60) {
      return meditationScripts.find(m => m.energyType === 'focusing');
    } else if (wearableDevice.metrics.energyLevel === 'low') {
      return meditationScripts.find(m => m.energyType === 'energizing');
    }
    return meditationScripts.find(m => m.energyType === 'balancing');
  };

  const handleStartAnalysis = () => {
    setIsAnalysisActive(true);
    toast({
      title: "AI Analysis Started",
      description: "Beginning biometric monitoring and environment adaptation",
    });
  };

  const handleStopAnalysis = () => {
    setIsAnalysisActive(false);
    toast({
      title: "AI Analysis Stopped",
      description: "Biometric monitoring paused",
    });
  };

  const handleApplyRecommendation = () => {
    toast({
      title: "Environment Adapted",
      description: "AI has optimized your meditation environment based on your biometrics",
    });
  };

  const handleStartMeditation = (meditation: MeditationScript) => {
    setSelectedMeditation(meditation);
    setShowPlayer(true);
  };

  const handleMeditationComplete = () => {
    setShowPlayer(false);
    setSelectedMeditation(null);
    toast({
      title: "Session Complete",
      description: "Great job! Your meditation session data has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A14] to-[#132920] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#7CE0C6] text-xl mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            Inner Current Premium
          </h1>
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            AI-Powered Meditation Experience
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Advanced biometric monitoring, personalized AI insights, and adaptive environment 
            controls for the ultimate meditation experience.
          </p>
        </div>

        {/* Control Panel */}
        <div className="mb-8 flex justify-center gap-4">
          <Button
            onClick={isAnalysisActive ? handleStopAnalysis : handleStartAnalysis}
            className={`${
              isAnalysisActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#2E9E83] hover:bg-[#39BF9D]'
            } flex items-center gap-2`}
          >
            <Brain className="w-4 h-4" />
            {isAnalysisActive ? 'Stop AI Analysis' : 'Start AI Analysis'}
          </Button>
          
          <Button 
            variant="outline" 
            className="border-[#2E9E83] text-[#7CE0C6] hover:bg-[#143024]"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Face Analysis */}
          <FaceAnalysisPanel
            metrics={faceAnalysis.metrics}
            isAnalyzing={faceAnalysis.isAnalyzing}
            isPermissionGranted={faceAnalysis.isPermissionGranted}
            onRequestPermission={faceAnalysis.requestPermission}
            onToggleAnalyzing={() => {
              if (faceAnalysis.isAnalyzing) {
                faceAnalysis.stopAnalyzing();
              } else {
                faceAnalysis.startAnalyzing();
              }
            }}
          />

          {/* Voice Analysis */}
          <VoiceAnalysisPanel
            metrics={voiceAnalysis.metrics}
            isListening={voiceAnalysis.isListening}
            isPermissionGranted={voiceAnalysis.isPermissionGranted}
            onRequestPermission={voiceAnalysis.requestPermission}
            onToggleListening={() => {
              if (voiceAnalysis.isListening) {
                voiceAnalysis.stopListening();
              } else {
                voiceAnalysis.startListening();
              }
            }}
          />

          {/* Wearable Device */}
          <WearableDevicePanel
            metrics={wearableDevice.metrics}
            isConnected={wearableDevice.isConnected}
            isScanning={wearableDevice.isScanning}
            isAvailable={wearableDevice.isAvailable}
            onStartScanning={wearableDevice.startScanning}
            onDisconnect={wearableDevice.disconnect}
          />

          {/* AI Insights - spans full width on larger screens */}
          <div className="xl:col-span-3">
            <AIInsightsPanel
              insights={insights}
              adaptationScore={adaptationScore}
              sessionRecommendation={sessionRecommendation}
              onApplyRecommendation={handleApplyRecommendation}
              isActive={isAnalysisActive}
              recommendedMeditation={getRecommendedMeditation()}
              onStartMeditation={handleStartMeditation}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#132920] border-[#2E9E83]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#7CE0C6] text-sm">Environment Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Sound Level</span>
                  <span className="text-white">{environmentSettings.sound}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Temperature</span>
                  <span className="text-white">{environmentSettings.temperature}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Lighting</span>
                  <span className="text-white">{environmentSettings.brightness}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#132920] border-[#2E9E83]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#7CE0C6] text-sm">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Sessions Today</span>
                  <span className="text-white">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Time</span>
                  <span className="text-white">45 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Streak</span>
                  <span className="text-white">7 days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#132920] border-[#2E9E83]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#7CE0C6] text-sm">Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  const recommended = getRecommendedMeditation();
                  if (recommended) handleStartMeditation(recommended);
                }}
                className="w-full bg-[#2E9E83] hover:bg-[#39BF9D] flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start AI Session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Meditation Player Dialog */}
        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
          <DialogContent className="bg-[#0A1A14] border-[#2E9E83] text-white p-0 max-w-4xl">
            {selectedMeditation && (
              <MeditationPlayer
                meditation={selectedMeditation}
                onComplete={handleMeditationComplete}
                onClose={() => setShowPlayer(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PremiumDashboard;
