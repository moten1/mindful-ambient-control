
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTensorFlowBiometrics } from './useTensorFlowBiometrics';

export type VoiceMetrics = {
  volume: number;
  tone: 'calm' | 'neutral' | 'stressed';
  clarity: number;
  breathing: 'deep' | 'shallow' | 'normal';
  frequencyData?: Uint8Array;
};

export const useEnhancedVoiceAnalysis = (isActive: boolean) => {
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
  const analysisIntervalRef = useRef<number | null>(null);
  
  const { analyzeVoiceData, isProcessing } = useTensorFlowBiometrics();

  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          } 
        });
        
        setIsPermissionGranted(true);
        mediaStreamRef.current = stream;
        
        // Initialize audio context and analyser
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 2048;
          analyserRef.current.smoothingTimeConstant = 0.8;
          
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          
          console.log("TensorFlow.js audio analysis initialized");
        }
        
        toast({
          title: "Microphone Access Granted",
          description: "TensorFlow.js voice analysis is now active",
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
        description: "Please allow microphone access for TensorFlow voice analysis",
        variant: "destructive" 
      });
      return false;
    }
  };

  const performTensorFlowAnalysis = useCallback(async () => {
    if (!dataArrayRef.current || isProcessing) {
      return;
    }

    // Get current frequency data
    const frequencyData = Array.from(dataArrayRef.current);
    
    // Analyze with TensorFlow.js
    const result = await analyzeVoiceData('', frequencyData);
    
    if (result) {
      console.log('TensorFlow voice analysis result:', result);
      setMetrics(prev => ({
        ...prev,
        ...result,
        frequencyData: dataArrayRef.current || undefined
      }));
    }
  }, [analyzeVoiceData, isProcessing]);

  const analyzeAudio = () => {
    if (!isListening || !analyserRef.current || !dataArrayRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate real-time volume
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;
    const volume = Math.min(100, Math.max(0, average * 2));
    
    // Update metrics with real-time data
    setMetrics(prev => ({
      ...prev,
      volume,
      frequencyData: new Uint8Array(dataArray)
    }));
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startListening = () => {
    if (!isPermissionGranted || !analyserRef.current) {
      console.log("Cannot start listening, missing permissions or components");
      return false;
    }
    
    // Resume AudioContext if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    setIsListening(true);
    
    // Start real-time frequency analysis
    analyzeAudio();
    
    // Perform TensorFlow analysis every 3 seconds
    analysisIntervalRef.current = window.setInterval(() => {
      performTensorFlowAnalysis();
    }, 3000);
    
    console.log("TensorFlow.js voice analysis started");
    return true;
  };
  
  const stopListening = () => {
    setIsListening(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    
    console.log("TensorFlow.js voice analysis stopped");
  };

  // Handle active state changes
  useEffect(() => {
    if (isActive && isPermissionGranted && !isListening) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isPermissionGranted]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  return {
    metrics,
    isPermissionGranted,
    isListening,
    requestPermission,
    startListening,
    stopListening,
    error,
    isProcessing
  };
};
