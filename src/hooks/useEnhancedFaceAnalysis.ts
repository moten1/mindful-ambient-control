
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useTensorFlowBiometrics } from './useTensorFlowBiometrics';

export type FacialMetrics = {
  emotion: 'happy' | 'sad' | 'neutral' | 'stressed' | 'relaxed';
  attentionLevel: number;
  eyeOpenness: number;
  faceDetected: boolean;
  confidence?: number;
};

export const useEnhancedFaceAnalysis = (isActive: boolean) => {
  const [metrics, setMetrics] = useState<FacialMetrics>({
    emotion: 'neutral',
    attentionLevel: 70,
    eyeOpenness: 80,
    faceDetected: false,
  });

  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const { initializeModels, analyzeFaceData, isProcessing, isModelLoaded } = useTensorFlowBiometrics();

  // Initialize TensorFlow models on mount
  useEffect(() => {
    initializeModels();
  }, [initializeModels]);

  // Create video and canvas elements
  useEffect(() => {
    if (!videoRef.current) {
      videoRef.current = document.createElement('video');
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.style.display = 'none';
      document.body.appendChild(videoRef.current);
    }
    
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 320;
      canvasRef.current.height = 240;
      canvasRef.current.style.display = 'none';
      document.body.appendChild(canvasRef.current);
    }
    
    return () => {
      if (videoRef.current && document.body.contains(videoRef.current)) {
        document.body.removeChild(videoRef.current);
        videoRef.current = null;
      }
      
      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);

  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 320, height: 240 } 
        });
        
        setIsPermissionGranted(true);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
        
        toast({
          title: "Camera Access Granted",
          description: "TensorFlow.js face analysis is now active",
        });
        
        return true;
      } else {
        setError('Camera not supported in this browser');
        toast({
          title: "Error",
          description: "Camera access is not supported in your browser",
          variant: "destructive"
        });
        return false;
      }
    } catch (err) {
      setError('Permission denied for camera access');
      toast({
        title: "Permission Denied",
        description: "Please allow camera access to use TensorFlow face analysis",
        variant: "destructive"
      });
      return false;
    }
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !isModelLoaded) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Capture frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Analyze with TensorFlow.js
      const result = await analyzeFaceData(imageData);
      
      if (result) {
        console.log('TensorFlow face analysis result:', result);
        setMetrics(prev => ({
          ...prev,
          ...result
        }));
      }
    }
  }, [analyzeFaceData, isProcessing, isModelLoaded]);

  const startAnalyzing = () => {
    if (!isPermissionGranted || !videoRef.current || !canvasRef.current || !isModelLoaded) {
      if (!isModelLoaded) {
        toast({
          title: "Models Loading",
          description: "TensorFlow.js models are still loading. Please wait...",
        });
      }
      return false;
    }
    
    setIsAnalyzing(true);
    
    // Analyze every 2 seconds for better performance with TensorFlow.js
    intervalRef.current = window.setInterval(captureAndAnalyze, 2000);
    
    return true;
  };

  const stopAnalyzing = () => {
    setIsAnalyzing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle active state changes
  useEffect(() => {
    if (isActive && isPermissionGranted && !isAnalyzing && isModelLoaded) {
      startAnalyzing();
    } else if (!isActive && isAnalyzing) {
      stopAnalyzing();
    }
  }, [isActive, isPermissionGranted, isModelLoaded]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    metrics,
    isPermissionGranted,
    isAnalyzing,
    requestPermission,
    startAnalyzing,
    stopAnalyzing,
    error,
    isProcessing,
    isModelLoaded
  };
};
