
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export type FacialMetrics = {
  emotion: 'happy' | 'sad' | 'neutral' | 'stressed' | 'relaxed';
  attentionLevel: number; // 0-100
  eyeOpenness: number; // 0-100
  faceDetected: boolean;
};

export const useFaceAnalysis = (isActive: boolean) => {
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
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Create video and canvas elements for face processing
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
      if (videoRef.current) {
        document.body.removeChild(videoRef.current);
        videoRef.current = null;
      }
      
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);

  // Request camera permission
  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        
        setIsPermissionGranted(true);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
        
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
        description: "Please allow camera access to use face analysis features",
        variant: "destructive"
      });
      return false;
    }
  };

  // Start face analysis
  const startAnalyzing = () => {
    if (!isPermissionGranted || !videoRef.current || !canvasRef.current) {
      return false;
    }
    
    setIsAnalyzing(true);
    analyzeFace();
    return true;
  };

  // Stop face analysis
  const stopAnalyzing = () => {
    setIsAnalyzing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Analyze face from video stream
  // Note: In a real app, this would use a face detection library like face-api.js
  const analyzeFace = () => {
    if (!isAnalyzing || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Draw video frame to canvas for analysis
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simulate face detection and analysis
      // In a real app, this would use computer vision algorithms
      const faceDetected = Math.random() > 0.1; // 90% chance of detecting a face
      
      if (faceDetected) {
        // Generate simulated metrics based on random variations
        // In a real app, these would come from actual facial analysis
        const emotionValue = Math.random();
        let emotion: FacialMetrics['emotion'];
        
        if (emotionValue < 0.2) emotion = 'happy';
        else if (emotionValue < 0.4) emotion = 'sad';
        else if (emotionValue < 0.6) emotion = 'neutral';
        else if (emotionValue < 0.8) emotion = 'stressed';
        else emotion = 'relaxed';
        
        // Add slight variations to previous values for realistic transitions
        setMetrics(prev => {
          const attentionChange = (Math.random() * 20) - 10;
          const eyeChange = (Math.random() * 10) - 5;
          
          return {
            emotion,
            attentionLevel: Math.max(0, Math.min(100, prev.attentionLevel + attentionChange)),
            eyeOpenness: Math.max(0, Math.min(100, prev.eyeOpenness + eyeChange)),
            faceDetected: true
          };
        });
      } else {
        // No face detected
        setMetrics(prev => ({
          ...prev,
          faceDetected: false
        }));
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(analyzeFace);
  };

  // Handle active state changes
  useEffect(() => {
    if (isActive && isPermissionGranted && !isAnalyzing) {
      startAnalyzing();
    } else if (!isActive && isAnalyzing) {
      stopAnalyzing();
    }
  }, [isActive, isPermissionGranted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
    error
  };
};

export default useFaceAnalysis;
