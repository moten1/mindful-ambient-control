
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type VoiceMetrics = {
  volume: number;
  tone: 'calm' | 'neutral' | 'stressed';
  clarity: number;
  breathing: 'deep' | 'shallow' | 'normal';
};

export const useVoiceSensing = (isActive: boolean) => {
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    volume: 50,
    tone: 'neutral',
    clarity: 75,
    breathing: 'normal',
  });
  
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request microphone permissions
  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsPermissionGranted(true);
        // Close the audio stream since we're just checking permissions
        stream.getTracks().forEach(track => track.stop());
        return true;
      } else {
        setError('Media devices not supported in this browser');
        toast({
          title: "Error",
          description: "Microphone access is not supported in your browser",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      setError('Permission denied for audio capture');
      toast({
        title: "Permission Denied",
        description: "Please allow microphone access to use voice sensing features",
        variant: "destructive" 
      });
      return false;
    }
  };
  
  // Simulate voice analysis with random data
  // In a real app, this would process actual microphone input
  useEffect(() => {
    if (!isActive || !isPermissionGranted) return;
    
    const interval = setInterval(() => {
      // Generate some random fluctuations to simulate voice analysis
      setMetrics(prev => {
        const volumeChange = Math.random() * 10 - 5; // -5 to +5
        const clarityChange = Math.random() * 6 - 3; // -3 to +3
        
        const newVolume = Math.max(10, Math.min(90, prev.volume + volumeChange));
        const newClarity = Math.max(20, Math.min(95, prev.clarity + clarityChange));
        
        // Randomly change tone and breathing occasionally
        const toneOptions: VoiceMetrics['tone'][] = ['calm', 'neutral', 'stressed'];
        const breathingOptions: VoiceMetrics['breathing'][] = ['deep', 'shallow', 'normal'];
        
        const shouldChangeTone = Math.random() > 0.8;
        const shouldChangeBreathing = Math.random() > 0.85;
        
        return {
          volume: newVolume,
          tone: shouldChangeTone ? toneOptions[Math.floor(Math.random() * toneOptions.length)] : prev.tone,
          clarity: newClarity,
          breathing: shouldChangeBreathing ? breathingOptions[Math.floor(Math.random() * breathingOptions.length)] : prev.breathing,
        };
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isActive, isPermissionGranted]);
  
  return {
    metrics,
    isPermissionGranted,
    requestPermission,
    error
  };
};

export default useVoiceSensing;
