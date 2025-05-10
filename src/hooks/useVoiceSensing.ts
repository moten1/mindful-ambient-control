
import { useState, useEffect, useRef } from 'react';
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
  const [isListening, setIsListening] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Request microphone permissions
  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsPermissionGranted(true);
        mediaStreamRef.current = stream;
        
        // Initialize audio processing
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 2048;
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
        }
        
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
  
  // Start voice analysis
  const startListening = () => {
    if (!isPermissionGranted || !analyserRef.current) {
      return false;
    }
    
    setIsListening(true);
    analyzeAudio();
    return true;
  };
  
  // Stop voice analysis
  const stopListening = () => {
    setIsListening(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
  // Analyze audio data
  const analyzeAudio = () => {
    if (!isListening || !analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Simple volume calculation based on frequency data
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;
    const volumeLevel = Math.min(100, Math.max(0, average * 2)); // Scale to 0-100
    
    // Simulate tone analysis based on frequency pattern
    // In a real app, this would use more sophisticated algorithms
    const lowFreqSum = dataArray.slice(0, dataArray.length / 3).reduce((acc, val) => acc + val, 0);
    const highFreqSum = dataArray.slice(dataArray.length * 2 / 3).reduce((acc, val) => acc + val, 0);
    const midFreqSum = sum - lowFreqSum - highFreqSum;
    
    let tone: VoiceMetrics['tone'] = 'neutral';
    if (lowFreqSum > highFreqSum * 1.5) tone = 'calm';
    else if (highFreqSum > lowFreqSum * 1.2) tone = 'stressed';
    
    // Calculate clarity based on signal-to-noise ratio (simplified)
    const clarityLevel = Math.min(95, Math.max(20, 60 + (midFreqSum / sum) * 40));
    
    // Simulate breathing pattern detection based on volume variations
    // In a real app, this would analyze amplitude patterns over time
    let breathing: VoiceMetrics['breathing'] = 'normal';
    const variability = Math.random() * 10; // Simulated for demo purposes
    if (variability < 3) breathing = 'deep';
    else if (variability > 7) breathing = 'shallow';
    
    setMetrics({
      volume: volumeLevel,
      tone,
      clarity: clarityLevel,
      breathing,
    });
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };
  
  // Cleanup resources on unmount or when inactive
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Handle active state changes
  useEffect(() => {
    if (isActive && isPermissionGranted && !isListening) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isPermissionGranted]);
  
  return {
    metrics,
    isPermissionGranted,
    isListening,
    requestPermission,
    startListening,
    stopListening,
    error
  };
};

export default useVoiceSensing;
