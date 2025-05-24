
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseMeditationPlayerOptions {
  audioSrc: string;
  videoSrc?: string;
  duration: number;
  onComplete?: () => void;
}

export const useMeditationPlayer = ({
  audioSrc,
  videoSrc,
  duration,
  onComplete
}: UseMeditationPlayerOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [muted, setMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Fallback audio sources for when primary audio fails
  const fallbackAudioSources = [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Simple bell sound
    'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmBBA' // Simple tone
  ];

  // Initialize audio element
  useEffect(() => {
    console.log('Initializing audio with source:', audioSrc);
    
    // Clean up previous audio element if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleEnd);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
    }
    
    // Reset audio error state
    setAudioError(false);
    
    // Create new audio element with updated source
    audioRef.current = new Audio();
    
    // Set up event listeners before setting source
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnd);
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.addEventListener('canplaythrough', handleCanPlay);
      audioRef.current.loop = true; // Loop the audio
      audioRef.current.muted = muted;
      audioRef.current.preload = 'auto';
      
      // Set source after event listeners are attached
      audioRef.current.src = audioSrc;
    }
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnd);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
      }
    };
  }, [audioSrc]); // Re-initialize when audio source changes

  // Initialize video if available
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoSrc]);

  // Reset video source when it changes
  useEffect(() => {
    if (videoRef.current) {
      // Video source changed, reset video element
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        pauseSession();
      }
      
      // Small timeout to ensure the video element is properly updated
      setTimeout(() => {
        if (wasPlaying && videoRef.current && videoSrc) {
          videoRef.current.play().catch(console.error);
          startSession();
        }
      }, 100);
    }
  }, [videoSrc]);

  // Handle audio can play event
  const handleCanPlay = () => {
    console.log('Audio can play successfully');
    setAudioError(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  // Start session
  const startSession = () => {
    console.log('Starting meditation session');
    
    // If there's an audio error, start without audio
    if (audioError) {
      console.log('Starting session without audio due to previous error');
      setIsPlaying(true);
      startTimer();
      
      toast({
        title: "Session started (Silent Mode)",
        description: "Audio unavailable, continuing with visual meditation",
      });
      return;
    }

    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
            setIsPlaying(true);
            startTimer();
            
            toast({
              title: "Session started",
              description: "Your meditation session has begun",
            });
          })
          .catch((error) => {
            console.error('Audio play failed:', error);
            // Start session without audio if play fails
            setIsPlaying(true);
            startTimer();
            
            toast({
              title: "Session started (Silent Mode)",
              description: "Audio unavailable, continuing with visual meditation",
            });
          });
      }
      
      // Start video if available
      if (videoRef.current && videoSrc) {
        videoRef.current.play().catch(console.error);
      }
    } else {
      // No audio element, start timer only
      setIsPlaying(true);
      startTimer();
      
      toast({
        title: "Session started (Silent Mode)",
        description: "Visual meditation session has begun",
      });
    }
  };

  // Start timer function
  const startTimer = () => {
    if (intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          setTimeRemaining(duration - newTime);
          
          // End session if time is up
          if (newTime >= duration) {
            handleEnd();
            return duration;
          }
          
          return newTime;
        });
      }, 1000);
    }
  };

  // Pause session
  const pauseSession = () => {
    if (audioRef.current && !audioError) {
      audioRef.current.pause();
    }
    
    setIsPlaying(false);
    
    // Pause video if available
    if (videoRef.current && videoSrc) {
      videoRef.current.pause();
    }
    
    // Pause timer
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    toast({
      title: "Session paused",
      description: "Your meditation session is paused",
    });
  };

  // Stop session
  const stopSession = () => {
    if (audioRef.current && !audioError) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
    setTimeRemaining(duration);
    
    // Reset video if available
    if (videoRef.current && videoSrc) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Stop timer
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    toast({
      title: "Session ended",
      description: "Your meditation session has ended",
    });
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSession();
    } else {
      startSession();
    }
  };

  // Handle session end
  const handleEnd = () => {
    stopSession();
    if (onComplete) {
      onComplete();
    }
  };

  // Handle audio errors
  const handleError = (error: any) => {
    console.error("Audio playback error:", error);
    setAudioError(true);
    
    // Don't stop the session on audio error, just continue without audio
    if (!isPlaying) {
      toast({
        title: "Audio Unavailable",
        description: "Continuing with visual meditation",
        variant: "destructive",
      });
    }
  };

  return {
    isPlaying,
    currentTime,
    timeRemaining,
    muted,
    videoRef,
    toggleMute,
    togglePlayPause,
    startSession,
    pauseSession,
    stopSession,
    duration
  };
};
