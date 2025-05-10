
import React, { useState } from 'react';
import { Volume, Thermometer, Vibrate, Lightbulb, Mic } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [soundLevel, setSoundLevel] = useState<number[]>([50]);
  const [temperatureLevel, setTemperatureLevel] = useState<number[]>([50]);
  const [vibrationLevel, setVibrationLevel] = useState<number[]>([70]);
  const [lightLevel, setLightLevel] = useState<number[]>([40]);
  const [brightnessLevel, setBrightnessLevel] = useState<number[]>([60]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(1200); // 20:00 in seconds
  const [sessionActive, setSessionActive] = useState(false);

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
    // In a real app, we would start countdown and other processes
  };

  const toggleMicrophone = () => {
    if (isRecording) {
      toast({
        title: "Voice sensing stopped",
        description: "Voice analysis is now disabled",
      });
    } else {
      toast({
        title: "Voice sensing active",
        description: "Analyzing voice patterns...",
      });
    }
    setIsRecording(!isRecording);
  };

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
        {sessionActive && (
          <div className="absolute top-4 right-0 bg-transparent border border-[#2E9E83] rounded-full p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#2E9E83]">
              <path d="M20.4 12.9C20 13.5 18.5 15.4 17 17C15.5 18.7 14 20 12 20C10 20 8.5 18.7 7 17C5.5 15.4 4 13.5 3.6 12.9" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 17V15" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 7V5" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 7L4 15" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 7L20 15" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Microphone Button */}
      <div 
        onClick={toggleMicrophone}
        className={`rounded-full p-6 cursor-pointer mt-8 mb-4 ${isRecording ? 'bg-[#2E9E83]/50' : 'border-2 border-[#2E9E83]'}`}
      >
        <Mic size={32} className={`${isRecording ? 'text-[#7CE0C6] animate-pulse-slow' : 'text-[#2E9E83]'}`} />
      </div>
      
      {/* Timer display */}
      <div className="text-6xl font-light mb-8">{formatTime(timer)}</div>
      
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
