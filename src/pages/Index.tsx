import React, { useState, useEffect } from 'react';
import { Volume, Thermometer, Vibrate, Lightbulb, Mic, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import useVoiceSensing from '@/hooks/useVoiceSensing';
import useFaceAnalysis from '@/hooks/useFaceAnalysis';
import useWearableDevice from '@/hooks/useWearableDevice';
import VoiceAnalysisPanel from '@/components/VoiceAnalysisPanel';
import FaceAnalysisPanel from '@/components/FaceAnalysisPanel';
import WearableDevicePanel from '@/components/WearableDevicePanel';

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
    if (sessionActive) {
      // Adjust sound based on voice volume
      if (voice.metrics.volume > 70) {
        setSoundLevel([Math.max(20, soundLevel[0] - 5)]);
      } else if (voice.metrics.volume < 30) {
        setSoundLevel([Math.min(80, soundLevel[0] + 5)]);
      }

      // Adjust light based on facial emotion if face is detected
      if (face.metrics.faceDetected) {
        if (face.metrics.emotion === 'stressed') {
          setLightLevel([Math.max(20, lightLevel[0] - 5)]);
          setBrightnessLevel([Math.max(30, brightnessLevel[0] - 5)]);
        } else if (face.metrics.emotion === 'relaxed' || face.metrics.emotion === 'happy') {
          setLightLevel([Math.min(70, lightLevel[0] + 5)]);
          setBrightnessLevel([Math.min(80, brightnessLevel[0] + 5)]);
        }
      }

      // Adjust temperature based on wearable data if connected
      if (wearable.isConnected) {
        if (wearable.metrics.bodyTemperature > 37.0) {
          setTemperatureLevel([Math.max(30, temperatureLevel[0] - 5)]);
        } else if (wearable.metrics.bodyTemperature < 36.5) {
          setTemperatureLevel([Math.min(70, temperatureLevel[0] + 5)]);
        }

        // Adjust vibration based on heart rate
        if (wearable.metrics.heartRate > 80) {
          setVibrationLevel([Math.max(30, vibrationLevel[0] - 10)]);
        } else if (wearable.metrics.heartRate < 65) {
          setVibrationLevel([Math.min(90, vibrationLevel[0] + 10)]);
        }
      }
    }
  }, [voice.metrics, face.metrics, wearable.metrics, sessionActive]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A14] to-[#132920] text-white flex flex-col items-center justify-between py-8 px-4">
      <div className="text-center">
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
      
      {/* Microphone Button */}
      <div className="flex gap-4 items-center mt-8 mb-4">
        <div 
          onClick={toggleMicrophone}
          className={`rounded-full p-6 cursor-pointer ${isRecording ? 'bg-[#2E9E83]/50 mic-pulse' : 'border-2 border-[#2E9E83]'}`}
        >
          <Mic size={32} className={`${isRecording ? 'text-[#7CE0C6]' : 'text-[#2E9E83]'}`} />
        </div>
        
        <Button
          onClick={toggleAnalysisPanel}
          variant="outline"
          className="border-[#2E9E83] text-[#7CE0C6]"
        >
          {showAnalysis ? 'Hide Analysis Panels' : 'Show Analysis Panels'}
        </Button>
      </div>
      
      {/* Timer display */}
      <div className="text-6xl font-light mb-8">{formatTime(timer)}</div>
      
      {/* Analysis Panels (conditionally rendered) */}
      {showAnalysis && (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
        </div>
      )}
      
      {/* Controls */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sound Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Volume size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Sound</span>
          </div>
          <Slider
            value={soundLevel}
            onValueChange={setSoundLevel}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Temperature Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Thermometer size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Temperature</span>
          </div>
          <Slider
            value={temperatureLevel}
            onValueChange={setTemperatureLevel}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Vibration Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Vibrate size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Vibration</span>
          </div>
          <Slider
            value={vibrationLevel}
            onValueChange={setVibrationLevel}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Light Control */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-[#2E9E83]" />
            <span className="text-gray-300">Light</span>
          </div>
          <Slider
            value={lightLevel}
            onValueChange={setLightLevel}
            max={100}
            step={1}
            className="w-full"
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
          </div>
          <Slider
            value={brightnessLevel}
            onValueChange={setBrightnessLevel}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
