
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRealBiometrics } from './useRealBiometrics';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analysisIntervalRef = useRef<number | null>(null);
  
  const { analyzeVoiceData, isProcessing } = useRealBiometrics();

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
          
          console.log("Enhanced audio context initialized");
        }
        
        // Initialize media recorder for real analysis
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        toast({
          title: "Microphone Access Granted",
          description: "Enhanced voice analysis is now active",
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
        description: "Please allow microphone access for voice analysis",
        variant: "destructive" 
      });
      return false;
    }
  };

  const performRealAnalysis = useCallback(async () => {
    if (!mediaRecorderRef.current || audioChunksRef.current.length === 0 || isProcessing) {
      return;
    }

    // Convert audio chunks to base64
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Get current frequency data
    const frequencyData = dataArrayRef.current ? Array.from(dataArrayRef.current) : [];
    
    // Clear audio chunks for next analysis
    audioChunksRef.current = [];
    
    // Send to backend for real analysis
    const result = await analyzeVoiceData(base64Audio, frequencyData);
    
    if (result) {
      console.log('Real voice analysis result:', result);
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
    if (!isPermissionGranted || !analyserRef.current || !mediaRecorderRef.current) {
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
    
    // Start recording for backend analysis
    mediaRecorderRef.current.start();
    
    // Perform backend analysis every 5 seconds
    analysisIntervalRef.current = window.setInterval(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setTimeout(() => {
          if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.start();
          }
        }, 100);
      }
      performRealAnalysis();
    }, 5000);
    
    console.log("Enhanced voice analysis started");
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
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend();
    }
    
    console.log("Enhanced voice analysis stopped");
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
