
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export type VoiceMetrics = {
  volume: number;
  tone: 'calm' | 'neutral' | 'stressed';
  clarity: number;
  breathing: 'deep' | 'shallow' | 'normal';
  frequencyData?: Uint8Array;  // Raw frequency data for visualization
};

export const useVoiceSensing = (isActive: boolean) => {
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    volume: 0,
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
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const volumeHistoryRef = useRef<number[]>([]);
  
  // Request microphone permissions
  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        setIsPermissionGranted(true);
        mediaStreamRef.current = stream;
        
        // Initialize audio processing
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 2048;
          analyserRef.current.smoothingTimeConstant = 0.8;
          
          // Create the data array for audio analysis
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          console.log("Audio context successfully initialized");
        }
        
        toast({
          title: "Microphone Access Granted",
          description: "You can now use voice sensing features",
        });
        
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
      console.error("Microphone permission error:", err);
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
      console.log("Cannot start listening, permission not granted or analyser not initialized");
      return false;
    }
    
    // Resume AudioContext if it was suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    setIsListening(true);
    analyzeAudio();
    console.log("Started listening to microphone");
    return true;
  };
  
  // Stop voice analysis
  const stopListening = () => {
    setIsListening(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      console.log("Stopped listening to microphone");
    }
    
    // Optionally suspend AudioContext to save resources
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
  };
  
  // Calculate the volume level from raw audio data
  const calculateVolume = (dataArray: Uint8Array): number => {
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;
    // Scale to 0-100 range
    return Math.min(100, Math.max(0, average * 2));
  };
  
  // Analyze breath patterns based on volume history
  const analyzeBreathing = (volumeHistory: number[]): VoiceMetrics['breathing'] => {
    if (volumeHistory.length < 10) return 'normal';
    
    // Calculate variations in volume
    let variations = 0;
    for (let i = 1; i < volumeHistory.length; i++) {
      variations += Math.abs(volumeHistory[i] - volumeHistory[i - 1]);
    }
    
    const avgVariation = variations / volumeHistory.length;
    
    if (avgVariation < 2) return 'deep';
    if (avgVariation > 8) return 'shallow';
    return 'normal';
  };
  
  // Analyze tone based on frequency distribution
  const analyzeTone = (dataArray: Uint8Array): VoiceMetrics['tone'] => {
    // Split the frequency spectrum into low, mid, high ranges
    const lowFreqEnd = Math.floor(dataArray.length / 4);
    const highFreqStart = Math.floor(dataArray.length * 3 / 4);
    
    const lowFreqSum = dataArray.slice(0, lowFreqEnd).reduce((acc, val) => acc + val, 0);
    const highFreqSum = dataArray.slice(highFreqStart).reduce((acc, val) => acc + val, 0);
    
    // Detect tone based on frequency distribution
    if (lowFreqSum > highFreqSum * 1.5) return 'calm';
    if (highFreqSum > lowFreqSum * 1.2) return 'stressed';
    return 'neutral';
  };
  
  // Calculate clarity based on signal-to-noise ratio
  const calculateClarity = (dataArray: Uint8Array): number => {
    const sumTotal = dataArray.reduce((acc, val) => acc + val, 0);
    if (sumTotal === 0) return 50; // Default when no sound
    
    // Calculate noise level (higher frequencies often contain more noise)
    const highFreqStart = Math.floor(dataArray.length * 3 / 4);
    const noiseLevel = dataArray.slice(highFreqStart).reduce((acc, val) => acc + val, 0) / (dataArray.length / 4);
    const signalLevel = sumTotal / dataArray.length;
    
    // Calculate signal-to-noise ratio (simplified)
    const snr = signalLevel > 0 ? signalLevel / (noiseLevel + 1) : 0;
    
    // Scale SNR to clarity percentage (0-100)
    return Math.min(95, Math.max(20, 40 + snr * 30));
  };
  
  // Analyze audio data
  const analyzeAudio = () => {
    if (!isListening || !analyserRef.current || !dataArrayRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate volume
    const volumeLevel = calculateVolume(dataArray);
    
    // Add to volume history (keep last 20 samples)
    volumeHistoryRef.current.push(volumeLevel);
    if (volumeHistoryRef.current.length > 20) {
      volumeHistoryRef.current.shift();
    }
    
    // Only update other metrics if we detect sound
    if (volumeLevel > 5) {
      // Analyze tone based on frequency distribution
      const tone = analyzeTone(dataArray);
      
      // Calculate clarity based on frequency characteristics
      const clarityLevel = calculateClarity(dataArray);
      
      // Analyze breathing pattern based on volume history
      const breathing = analyzeBreathing(volumeHistoryRef.current);
      
      // Create a copy of the frequency data for visualization purposes
      const frequencyData = new Uint8Array(dataArray);
      
      setMetrics({
        volume: volumeLevel,
        tone,
        clarity: clarityLevel,
        breathing,
        frequencyData
      });
    } else {
      // When no significant sound, only update volume
      setMetrics(prev => ({
        ...prev,
        volume: volumeLevel,
        frequencyData: new Uint8Array(dataArray)
      }));
    }
    
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
