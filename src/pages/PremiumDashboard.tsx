
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Brain, Sparkles, Settings, Play } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import FaceAnalysisPanel from '@/components/FaceAnalysisPanel';
import VoiceAnalysisPanel from '@/components/VoiceAnalysisPanel';
import WearableDevicePanel from '@/components/WearableDevicePanel';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import MeditationPlayer from '@/components/MeditationPlayer';

import { useEnhancedFaceAnalysis } from '@/hooks/useEnhancedFaceAnalysis';
import { useEnhancedVoiceAnalysis } from '@/hooks/useEnhancedVoiceAnalysis';
import { useWearableDevice } from '@/hooks/useWearableDevice';
import { useRealBiometrics } from '@/hooks/useRealBiometrics';
import { MeditationScript } from '@/types/meditation';
import { meditationScripts } from '@/data/meditationScripts';

const PremiumDashboard: React.FC = () => {
  const [isAnalysisActive, setIsAnalysisActive] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationScript | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [adaptationScore, setAdaptationScore] = useState(75);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [sessionRecommendation, setSessionRecommendation] = useState('');
  const [environmentSettings, setEnvironmentSettings] = useState({
    sound: 50,
    temperature: 50,
    brightness: 50,
    vibration: 50,
    light: 50
  });

  // Enhanced biometric hooks with real backend integration
  const faceAnalysis = useEnhancedFaceAnalysis(isAnalysisActive);
  const voiceAnalysis = useEnhancedVoiceAnalysis(isAnalysisActive);
  const wearableDevice = useWearableDevice();
  const { generateAIInsights, isProcessing } = useRealBiometrics();

  console.log('Enhanced Face Analysis State:', {
    isAnalyzing: faceAnalysis.isAnalyzing,
    isPermissionGranted: faceAnalysis.isPermissionGranted,
    metrics: faceAnalysis.metrics,
    isProcessing: faceAnalysis.isProcessing
  });

  console.log('Enhanced Voice Analysis State:', {
    isListening: voiceAnalysis.isListening,
    isPermissionGranted: voiceAnalysis.isPermissionGranted,
    metrics: voiceAnalysis.metrics,
    isProcessing: voiceAnalysis.isProcessing
  });

  // Generate real AI insights
  useEffect(() => {
    if (isAnalysisActive) {
      const generateInsights = async () => {
        const biometricData = {
          face: faceAnalysis.metrics,
          voice: voiceAnalysis.metrics,
          wearable: wearableDevice.metrics
        };

        const result = await generateAIInsights(biometricData);
        if (result) {
          console.log('Generated AI insights:', result);
          setAiInsights(result.insights || []);
          setAdaptationScore(result.adaptationScore || 75);
          setSessionRecommendation(result.recommendation || '');
          setEnvironmentSettings(result.environmentSettings || environmentSettings);
        }
      };

      // Generate insights every 10 seconds when analysis is active
      const interval = setInterval(generateInsights, 10000);
      
      // Generate initial insights
      generateInsights();

      return () => clearInterval(interval);
    }
  }, [isAnalysisActive, faceAnalysis.metrics, voiceAnalysis.metrics, wearableDevice.metrics, generateAIInsights]);

  // Get recommended meditation based on current state
  const getRecommendedMeditation = (): MeditationScript | undefined => {
    if (faceAnalysis.metrics.emotion === 'stressed' || voiceAnalysis.metrics.tone === 'stressed') {
      return meditationScripts.find(m => m.energyType === 'calming');
    } else if (faceAnalysis.metrics.attentionLevel < 60) {
      return meditationScripts.find(m => m.energyType === 'focusing');
    } else if (wearableDevice.metrics.energyLevel === 'low') {
      return meditationScripts.find(m => m.energyType === 'energizing');
    }
    return meditationScripts.find(m => m.energyType === 'balancing');
  };

  const handleStartAnalysis = async () => {
    console.log('Starting Enhanced AI Analysis...');
    
    // Request permissions first if not granted
    if (!faceAnalysis.isPermissionGranted) {
      console.log('Requesting enhanced face analysis permission...');
      const facePermission = await faceAnalysis.requestPermission();
      if (!facePermission) {
        toast({
          title: "Camera Permission Required",
          description: "Please enable camera access for AI-powered face analysis",
          variant: "destructive"
        });
      }
    }

    if (!voiceAnalysis.isPermissionGranted) {
      console.log('Requesting enhanced voice analysis permission...');
      try {
        const voicePermission = await voiceAnalysis.requestPermission();
        if (!voicePermission) {
          toast({
            title: "Microphone Permission Required", 
            description: "Please enable microphone access for AI-powered voice analysis",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Voice permission error:', error);
        toast({
          title: "Microphone Access Error",
          description: "Unable to access microphone for enhanced analysis",
          variant: "destructive"
        });
      }
    }

    setIsAnalysisActive(true);
    
    // Start individual analyses
    if (faceAnalysis.isPermissionGranted && !faceAnalysis.isAnalyzing) {
      console.log('Starting enhanced face analysis...');
      faceAnalysis.startAnalyzing();
    }
    
    if (voiceAnalysis.isPermissionGranted && !voiceAnalysis.isListening) {
      console.log('Starting enhanced voice analysis...');
      voiceAnalysis.startListening();
    }

    toast({
      title: "AI Analysis Started",
      description: "Enhanced biometric monitoring with real AI insights now active",
    });
  };

  const handleStopAnalysis = () => {
    console.log('Stopping Enhanced AI Analysis...');
    setIsAnalysisActive(false);
    
    if (faceAnalysis.isAnalyzing) {
      faceAnalysis.stopAnalyzing();
    }
    
    if (voiceAnalysis.isListening) {
      voiceAnalysis.stopListening();
    }

    toast({
      title: "AI Analysis Stopped",
      description: "Enhanced biometric monitoring paused",
    });
  };

  const handleApplyRecommendation = () => {
    console.log('Applying AI recommendation:', environmentSettings);
    toast({
      title: "Environment Adapted",
      description: "AI has optimized your meditation environment using real-time biometric analysis",
    });
  };

  const handleStartMeditation = (meditation: MeditationScript) => {
    console.log('Starting meditation:', meditation.title);
    setSelectedMeditation(meditation);
    setShowPlayer(true);
  };

  const handleMeditationComplete = () => {
    setShowPlayer(false);
    setSelectedMeditation(null);
    toast({
      title: "Session Complete",
      description: "Your meditation session with AI insights has been completed.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A14] to-[#132920] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#7CE0C6] text-xl mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            Inner Current Premium - AI Enhanced
          </h1>
          <h2 className="text-4xl md:text-5xl font-light mb-4">
            Real-Time AI Biometric Analysis
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Advanced biometric monitoring with real AI processing, personalized insights using open-source LLMs, 
            and adaptive environment controls powered by machine learning.
          </p>
        </div>

        {/* Control Panel */}
        <div className="mb-8 flex justify-center gap-4">
          <Button
            onClick={isAnalysisActive ? handleStopAnalysis : handleStartAnalysis}
            disabled={isProcessing}
            className={`${
              isAnalysisActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#2E9E83] hover:bg-[#39BF9D]'
            } flex items-center gap-2`}
          >
            <Brain className="w-4 h-4" />
            {isProcessing ? 'Processing...' : isAnalysisActive ? 'Stop AI Analysis' : 'Start AI Analysis'}
          </Button>
          
          <Button 
            variant="outline" 
            className="border-[#2E9E83] text-[#7CE0C6] hover:bg-[#143024]"
          >
            <Settings className="w-4 h-4 mr-2" />
            AI Settings
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

          {/* AI Insights - Enhanced with real backend */}
          <div className="xl:col-span-3">
            <AIInsightsPanel
              insights={aiInsights}
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
              <CardTitle className="text-[#7CE0C6] text-sm">Real-Time Environment</CardTitle>
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
              <CardTitle className="text-[#7CE0C6] text-sm">AI Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">AI Insights</span>
                  <span className="text-white">{aiInsights.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Adaptation Score</span>
                  <span className="text-white">{adaptationScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Processing Status</span>
                  <span className="text-white">{isProcessing ? 'Active' : 'Ready'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#132920] border-[#2E9E83]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#7CE0C6] text-sm">AI Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => {
                  const recommended = getRecommendedMeditation();
                  if (recommended) handleStartMeditation(recommended);
                }}
                className="w-full bg-[#2E9E83] hover:bg-[#39BF9D] flex items-center gap-2"
                disabled={isProcessing}
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
            <DialogTitle className="sr-only">
              {selectedMeditation ? `Playing ${selectedMeditation.title}` : 'AI-Enhanced Meditation Player'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              AI-powered meditation session with real-time biometric monitoring and adaptive environment controls
            </DialogDescription>
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
