
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(audioSrc);
    
    // Set up event listeners
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnd);
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.loop = true; // Loop the audio
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
      }
    };
  }, [audioSrc]);

  // Initialize video if available
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      if (isPlaying) {
        videoRef.current.play().catch(handleError);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoSrc]);

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  // Start session
  const startSession = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(handleError);
      setIsPlaying(true);
      
      // Start video if available
      if (videoRef.current && videoSrc) {
        videoRef.current.play().catch(console.error);
      }
      
      // Start timer
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
      
      toast({
        title: "Session started",
        description: "Your meditation session has begun",
      });
    }
  };

  // Pause session
  const pauseSession = () => {
    if (audioRef.current) {
      audioRef.current.pause();
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
    }
  };

  // Stop session
  const stopSession = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
    }
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
    toast({
      title: "Playback Error",
      description: "There was an error playing the meditation audio",
      variant: "destructive",
    });
    stopSession();
  };

  return {
    isPlaying,
    currentTime,
    timeRemaining,
    muted,
    videoRef,
    toggleMute,
    togglePlayPause,
    stopSession,
    duration
  };
};
