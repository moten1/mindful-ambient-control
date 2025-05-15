import React, { useState, useEffect } from 'react';
import { Volume, Thermometer, Vibrate, Lightbulb, Mic, Heart, Brain, BookOpen, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useVoiceSensing from '@/hooks/useVoiceSensing';
import useFaceAnalysis from '@/hooks/useFaceAnalysis';
import useWearableDevice from '@/hooks/useWearableDevice';
import VoiceAnalysisPanel from '@/components/VoiceAnalysisPanel';
import FaceAnalysisPanel from '@/components/FaceAnalysisPanel';
import WearableDevicePanel from '@/components/WearableDevicePanel';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import MeditationPlayer from '@/components/MeditationPlayer';
import MeditationSelector from '@/components/MeditationSelector';
import { generateEnvironmentSettings, generateInsights, generateSessionRecommendation } from '@/utils/aiEngine';
import { meditationScripts, getRecommendedMeditation } from '@/data/meditationScripts';
import { MeditationScript } from '@/types/meditation';
import { useSettings } from '@/contexts/SettingsContext';
import SettingsPanel from '@/components/SettingsPanel';

const Index = () => {
  const [soundLevel, setSoundLevel] = useState<number[]>([50]);
  const [temperatureLevel, setTemperatureLevel] = useState<number[]>([50]);
  const [vibrationLevel, setVibrationLevel] = useState<number[]>([70]);
  const [lightLevel, setLightLevel] = useState<number[]>([40]);
  const [brightnessLevel, setBrightnessLevel] = useState<number[]>([60]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(1200); // 20:00 in seconds
  const [sessionActive, setSessionActive] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAdaptationEnabled, setAiAdaptationEnabled] = useState(false);
  const [aiAdaptationScore, setAiAdaptationScore] = useState(68);
  const [insights, setInsights] = useState<{message: string; type: 'info' | 'suggestion' | 'alert'}[]>([]);
  const [sessionRecommendation, setSessionRecommendation] = useState('');
  const [aiUpdateInterval, setAiUpdateInterval] = useState<number | null>(null);
  const [showMeditationSelector, setShowMeditationSelector] = useState(false);
  const [showMeditationPlayer, setShowMeditationPlayer] = useState(false);
  const [currentMeditation, setCurrentMeditation] = useState<MeditationScript | null>(null);
  const [recommendedMeditation, setRecommendedMeditation] = useState<MeditationScript | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { elevenLabsApiKey } = useSettings();

  // Initialize hooks for sensor data
  const voice = useVoiceSensing(isRecording);
  const face = useFaceAnalysis(showAnalysis);
  const wearable = useWearableDevice();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setSessionActive(true);
    toast({
      title: "Session started",
      description: "Your energy recalibration session has begun",
    });
    // Start a countdown timer
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setSessionActive(false);
          toast({
            title: "Session complete",
            description: "Your energy recalibration session has ended",
          });
          return 1200; // Reset to 20:00
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleMicrophone = async () => {
    if (isRecording) {
      voice.stopListening();
      setIsRecording(false);
      toast({
        title: "Voice sensing stopped",
        description: "Voice analysis is now disabled",
      });
    } else {
      // If permission isn't granted, request it first
      if (!voice.isPermissionGranted) {
        const granted = await voice.requestPermission();
        if (!granted) return;
      }
      const started = voice.startListening();
      if (started) {
        setIsRecording(true);
        toast({
          title: "Voice sensing active",
          description: "Analyzing voice patterns...",
        });
      }
    }
  };

  const toggleAnalysisPanel = () => {
    setShowAnalysis(!showAnalysis);
  };

  const toggleAIAdaptation = () => {
    const newState = !aiAdaptationEnabled;
    setAiAdaptationEnabled(newState);
    
    if (newState) {
      toast({
        title: "AI Adaptation Enabled",
        description: "Environment will automatically adapt to your state",
      });
      // Initialize with first recommendation
      updateAIInsights();
      // Set interval for continuous updates
      const intervalId = window.setInterval(() => {
        updateAIInsights();
      }, 10000);
      setAiUpdateInterval(intervalId);
    } else {
      toast({
        title: "AI Adaptation Disabled",
        description: "Returning to manual control mode",
      });
      // Clear interval
      if (aiUpdateInterval !== null) {
        clearInterval(aiUpdateInterval);
        setAiUpdateInterval(null);
      }
    }
  };

  // Handle opening the meditation selector
  const handleOpenMeditationSelector = () => {
    setShowMeditationSelector(true);
  };

  // Handle selecting a meditation
  const handleSelectMeditation = (meditation: MeditationScript) => {
    setCurrentMeditation(meditation);
    setShowMeditationSelector(false);
    setShowMeditationPlayer(true);
  };

  // Handle meditation completion
  const handleMeditationComplete = () => {
    toast({
      title: "Meditation Complete",
      description: "Your guided meditation session has ended",
    });
    setCurrentMeditation(null);
    setShowMeditationPlayer(false);
  };

  // Handle closing meditation player
  const handleCloseMeditationPlayer = () => {
    setShowMeditationPlayer(false);
    setCurrentMeditation(null);
  };

  // Update AI insights based on current sensor data
  const updateAIInsights = () => {
    // Create sensor data object
    const sensorData = {
      voice: {
        volume: voice.metrics.volume,
        tone: voice.metrics.tone,
        clarity: voice.metrics.clarity,
        breathing: voice.metrics.breathing
      },
      face: {
        emotion: face.metrics.emotion,
        attentionLevel: face.metrics.attentionLevel,
        eyeOpenness: face.metrics.eyeOpenness,
        faceDetected: face.metrics.faceDetected
      },
      wearable: {
        heartRate: wearable.metrics.heartRate,
        bodyTemperature: wearable.metrics.bodyTemperature,
        bloodOxygen: wearable.metrics.bloodOxygen,
        energyLevel: wearable.metrics.energyLevel
      }
    };
    
    // Generate new insights
    const newInsights = generateInsights(sensorData);
    setInsights(newInsights);
    
    // Generate session recommendation
    const recommendation = generateSessionRecommendation(sensorData);
    setSessionRecommendation(recommendation);
    
    // Generate meditation recommendation
    const meditationRec = getRecommendedMeditation({
      heartRate: wearable.metrics.heartRate,
      emotion: face.metrics.emotion,
      energyLevel: wearable.metrics.energyLevel,
      attentionLevel: face.metrics.attentionLevel
    });
    setRecommendedMeditation(meditationRec);
    
    // Apply settings if AI adaptation is enabled
    if (aiAdaptationEnabled && sessionActive) {
      applyRecommendedSettings();
    }
    
    // Simulate AI learning by increasing score over time
    setAiAdaptationScore(prev => Math.min(98, prev + Math.random() * 3 - 1));
  };

  // Apply AI recommended settings
  const applyRecommendedSettings = () => {
    // Create sensor data object
    const sensorData = {
      voice: {
        volume: voice.metrics.volume,
        tone: voice.metrics.tone,
        clarity: voice.metrics.clarity,
        breathing: voice.metrics.breathing
      },
      face: {
        emotion: face.metrics.emotion,
        attentionLevel: face.metrics.attentionLevel,
        eyeOpenness: face.metrics.eyeOpenness,
        faceDetected: face.metrics.faceDetected
      },
      wearable: {
        heartRate: wearable.metrics.heartRate,
        bodyTemperature: wearable.metrics.bodyTemperature,
        bloodOxygen: wearable.metrics.bloodOxygen,
        energyLevel: wearable.metrics.energyLevel
      }
    };
    
    // Get recommended settings
    const recommended = generateEnvironmentSettings(sensorData);
    
    // Gradually apply settings
    setSoundLevel([recommended.sound]);
    setTemperatureLevel([recommended.temperature]);
    setVibrationLevel([recommended.vibration]);
    setLightLevel([recommended.light]);
    setBrightnessLevel([recommended.brightness]);
    
    toast({
      title: "Environment Adjusted",
      description: "AI has optimized your environment based on biometrics",
    });
  };

  // Handle FaceAnalysis permission and toggling
  const handleFaceAnalysisToggle = () => {
    if (face.isAnalyzing) {
      face.stopAnalyzing();
    } else {
      if (face.isPermissionGranted) {
        face.startAnalyzing();
      }
    }
  };

  // Update environment based on sensor data when session is active
  useEffect(() => {
    if (sessionActive && !aiAdaptationEnabled) {
      // Non-AI automatic adjustments (keep existing functionality)
      // ... keep existing code (environment adjustment logic based on sensor data)
    }
  }, [voice.metrics, face.metrics, wearable.metrics, sessionActive]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (aiUpdateInterval !== null) {
        clearInterval(aiUpdateInterval);
      }
    };
  }, [aiUpdateInterval]);

  // Toggle settings panel
  const toggleSettingsPanel = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A14] to-[#132920] text-white flex flex-col items-center justify-between py-8 px-4">
      <div className="text-center relative w-full">
        <button
          onClick={toggleSettingsPanel}
          className="absolute right-4 top-0 p-2 rounded-full bg-[#143024] border border-[#2E9E83] hover:bg-[#1d4230]"
          title="Settings"
        >
          <Settings size={20} className="text-[#7CE0C6]" />
        </button>
        <h1 className="text-[#7CE0C6] text-xl mb-2">Inner Current</h1>
        <h2 className="text-4xl md:text-5xl font-light mb-8 max-w-3xl">
          Begin an AI-assisted<br />energy recalibration session
        </h2>
      </div>
      
      {/* Portrait Circle */}
      <div className="relative">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-[#2E9E83] flex items-center justify-center relative">
          {sessionActive ? (
            <div className="absolute inset-0 bg-[#0A1A14] flex items-center justify-center">
              <div className="text-6xl font-light">{formatTime(timer)}</div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#0A1A14] flex items-center justify-center">
              <Button 
                onClick={startSession}
                className="bg-[#2E9E83] hover:bg-[#39BF9D] text-white rounded-full h-16 px-8"
              >
                Start Session
              </Button>
            </div>
          )}
        </div>
        
        {/* AI Indicator */}
        <div className={`absolute top-0 left-0 bg-transparent border ${aiAdaptationEnabled ? 'border-[#7CE0C6] animate-pulse' : 'border-[#2E9E83]'} rounded-full p-2`}>
          <Brain size={16} className={aiAdaptationEnabled ? "text-[#7CE0C6]" : "text-[#2E9E83]"} />
        </div>
        
        {/* Heart rate indicator */}
        {sessionActive && wearable.isConnected && (
          <div className="absolute top-4 right-0 bg-transparent border border-[#2E9E83] rounded-full p-2">
            <div className="flex items-center gap-1">
              <Heart size={16} className="text-red-400" />
              <span className="text-xs text-[#7CE0C6]">{wearable.metrics.heartRate}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Control Buttons Row */}
      <div className="flex flex-wrap gap-4 items-center mt-8 mb-4 justify-center">
        {/* Microphone Button */}
        <div 
          onClick={toggleMicrophone}
          className={`rounded-full p-6 cursor-pointer ${isRecording ? 'bg-[#2E9E83]/50 mic-pulse' : 'border-2 border-[#2E9E83]'}`}
        >
          <Mic size={32} className={`${isRecording ? 'text-[#7CE0C6]' : 'text-[#2E9E83]'}`} />
        </div>
        
        {/* Meditation Button */}
        <div 
          onClick={handleOpenMeditationSelector}
          className="rounded-full p-6 cursor-pointer border-2 border-[#2E9E83]"
        >
          <BookOpen size={32} className="text-[#2E9E83]" />
        </div>
        
        {/* Analysis Panel Toggle */}
        <Button
          onClick={toggleAnalysisPanel}
          variant="outline"
          className="border-[#2E9E83] text-[#7CE0C6]"
        >
          {showAnalysis ? 'Hide Analysis Panels' : 'Show Analysis Panels'}
        </Button>
        
        {/* AI Adaptation Toggle */}
        <Button
          onClick={toggleAIAdaptation}
          variant="outline"
          className={`border-[#2E9E83] ${aiAdaptationEnabled ? 'bg-[#2E9E83]/20 text-[#7CE0C6]' : 'text-[#2E9E83]'}`}
        >
          <Brain className="mr-2" size={18} />
          {aiAdaptationEnabled ? 'Disable AI' : 'Enable AI'}
        </Button>
      </div>
      
      {/* Timer display - only show when not active */}
      {!sessionActive && (
        <div className="text-6xl font-light mb-8">{formatTime(timer)}</div>
      )}
      
      {/* Analysis Panels (conditionally rendered) */}
      {showAnalysis && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <VoiceAnalysisPanel
            metrics={voice.metrics}
            isListening={isRecording}
            isPermissionGranted={voice.isPermissionGranted}
            onRequestPermission={voice.requestPermission}
            onToggleListening={toggleMicrophone}
          />
          
          <FaceAnalysisPanel
            metrics={face.metrics}
            isAnalyzing={face.isAnalyzing}
            isPermissionGranted={face.isPermissionGranted}
            onRequestPermission={face.requestPermission}
            onToggleAnalyzing={handleFaceAnalysisToggle}
          />
          
          <WearableDevicePanel
            metrics={wearable.metrics}
            isConnected={wearable.isConnected}
            isScanning={wearable.isScanning}
            isAvailable={wearable.isAvailable}
            onStartScanning={wearable.startScanning}
            onDisconnect={wearable.disconnect}
          />
          
          <AIInsightsPanel
            insights={insights}
            adaptationScore={aiAdaptationScore}
            sessionRecommendation={sessionRecommendation}
            onApplyRecommendation={applyRecommendedSettings}
            isActive={aiAdaptationEnabled}
            recommendedMeditation={recommendedMeditation || undefined}
            onStartMeditation={handleSelectMeditation}
          />
        </div>
      )}
      
      {/* Controls */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sound Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Volume size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Sound</span>
            {aiAdaptationEnabled && <div className="ml-auto text-xs text-[#7CE0C6]">AI Controlled</div>}
          </div>
          <Slider
            value={soundLevel}
            onValueChange={setSoundLevel}
            max={100}
            step={1}
            className={`w-full ${aiAdaptationEnabled ? 'opacity-80' : ''}`}
          />
        </div>
        
        {/* Temperature Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Thermometer size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Temperature</span>
            {aiAdaptationEnabled && <div className="ml-auto text-xs text-[#7CE0C6]">AI Controlled</div>}
          </div>
          <Slider
            value={temperatureLevel}
            onValueChange={setTemperatureLevel}
            max={100}
            step={1}
            className={`w-full ${aiAdaptationEnabled ? 'opacity-80' : ''}`}
          />
        </div>
        
        {/* Vibration Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Vibrate size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Vibration</span>
            {aiAdaptationEnabled && <div className="ml-auto text-xs text-[#7CE0C6]">AI Controlled</div>}
          </div>
          <Slider
            value={vibrationLevel}
            onValueChange={setVibrationLevel}
            max={100}
            step={1}
            className={`w-full ${aiAdaptationEnabled ? 'opacity-80' : ''}`}
          />
        </div>
        
        {/* Light Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Light</span>
            {aiAdaptationEnabled && <div className="ml-auto text-xs text-[#7CE0C6]">AI Controlled</div>}
          </div>
          <Slider
            value={lightLevel}
            onValueChange={setLightLevel}
            max={100}
            step={1}
            className={`w-full ${aiAdaptationEnabled ? 'opacity-80' : ''}`}
          />
        </div>

        {/* Brightness Control */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#2E9E83]">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 21V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16.95 7.05L18.364 5.636" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M5.636 18.364L7.05 16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M16.95 16.95L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M5.636 5.636L7.05 7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-gray-300">Brightness</span>
            {aiAdaptationEnabled && <div className="ml-auto text-xs text-[#7CE0C6]">AI Controlled</div>}
          </div>
          <Slider
            value={brightnessLevel}
            onValueChange={setBrightnessLevel}
            max={100}
            step={1}
            className={`w-full ${aiAdaptationEnabled ? 'opacity-80' : ''}`}
          />
        </div>
      </div>
      
      {/* Meditation Selector Dialog */}
      <Dialog open={showMeditationSelector} onOpenChange={setShowMeditationSelector}>
        <DialogContent className="bg-[#0A1A14] border-[#2E9E83] text-white max-w-2xl">
          <MeditationSelector 
            meditations={meditationScripts}
            onSelectMeditation={handleSelectMeditation}
            recommendedMeditation={recommendedMeditation || undefined}
          />
        </DialogContent>
      </Dialog>
      
      {/* Meditation Player Dialog */}
      <Dialog open={showMeditationPlayer} onOpenChange={setShowMeditationPlayer}>
        <DialogContent className="bg-[#0A1A14] border-[#2E9E83] text-white p-0 max-w-3xl">
          {currentMeditation && (
            <MeditationPlayer 
              meditation={currentMeditation}
              onComplete={handleMeditationComplete}
              onClose={handleCloseMeditationPlayer}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0A1A14] border-[#2E9E83] text-white p-0">
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
