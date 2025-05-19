
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, Square as Stop, Timer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MeditationScript } from '@/types/meditation';

interface MeditationPlayerProps {
  title?: string;
  description?: string;
  audioSrc?: string;
  duration?: number; // in seconds
  meditation?: MeditationScript;
  onComplete?: () => void;
  onClose?: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  title,
  description,
  audioSrc,
  duration = 600, // default 10 minutes
  meditation,
  onComplete,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(meditation?.duration || duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  // Use meditation properties if provided, otherwise use direct props
  const meditationTitle = meditation?.title || title || "";
  const meditationDescription = meditation?.description || description || "";
  const meditationDuration = meditation?.duration || duration;
  const meditationAudioSrc = audioSrc || "https://assets.mixkit.co/music/preview/mixkit-meditation-music-577.mp3"; // Default audio
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(meditationAudioSrc);
    
    // Set up event listeners
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnd);
      audioRef.current.addEventListener('error', handleError);
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
  }, [meditationAudioSrc]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSession();
    } else {
      startSession();
    }
  };

  // Start session
  const startSession = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(handleError);
      setIsPlaying(true);
      
      // Start timer
      if (intervalRef.current === null) {
        intervalRef.current = window.setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 1;
            setTimeRemaining(meditationDuration - newTime);
            
            // End session if time is up
            if (newTime >= meditationDuration) {
              handleEnd();
              return meditationDuration;
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
      setTimeRemaining(meditationDuration);
      
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

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = (currentTime / meditationDuration) * 100;

  return (
    <Card className="bg-[#132920] border-[#2E9E83] w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#7CE0C6] text-lg">{meditationTitle}</CardTitle>
          <Badge variant="outline" className="bg-[#2E9E83]/20 text-[#7CE0C6] border-[#2E9E83]">
            Free Session
          </Badge>
        </div>
        <p className="text-gray-300 text-sm">{meditationDescription}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="text-[#7CE0C6]" size={16} />
            <span className="text-gray-300 text-sm">{formatTime(meditationDuration)} Session</span>
          </div>
        </div>
        
        <Progress 
          className="h-2 bg-[#0A1A14]" 
          value={progressPercentage} 
        />
        
        <div className="bg-[#0A1A14] p-6 rounded-md min-h-[120px] flex items-center justify-center">
          <p className="text-5xl font-light text-[#7CE0C6]">
            {formatTime(timeRemaining)}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center gap-4 py-6">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-[#2E9E83] text-[#7CE0C6] hover:bg-[#1d4230] hover:text-white"
          onClick={stopSession}
        >
          <Stop size={24} />
        </Button>
        
        <Button
          size="icon"
          className={`h-16 w-16 rounded-full ${isPlaying ? "bg-[#39BF9D]" : "bg-[#2E9E83]"} hover:bg-[#39BF9D]`}
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause size={28} />
          ) : (
            <Play size={28} />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MeditationPlayer;
