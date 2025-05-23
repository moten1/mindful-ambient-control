
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { MeditationScript } from '@/types/meditation';
import MeditationHeader from './meditation/MeditationHeader';
import MeditationProgress from './meditation/MeditationProgress';
import MeditationControls from './meditation/MeditationControls';
import { useMeditationPlayer } from '@/hooks/useMeditationPlayer';

interface MeditationPlayerProps {
  title?: string;
  description?: string;
  audioSrc?: string;
  videoSrc?: string;
  duration?: number; // in seconds
  meditation?: MeditationScript;
  onComplete?: () => void;
  onClose?: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  title,
  description,
  audioSrc,
  videoSrc,
  duration = 600, // default 10 minutes
  meditation,
  onComplete,
  onClose
}) => {
  // Use meditation properties if provided, otherwise use direct props
  const meditationTitle = meditation?.title || title || "";
  const meditationDescription = meditation?.description || description || "";
  const meditationDuration = meditation?.duration || duration;
  const meditationAudioSrc = audioSrc || meditation?.audioSrc || "https://assets.mixkit.co/music/preview/mixkit-meditation-music-577.mp3"; // Default audio
  const meditationVideoSrc = videoSrc || meditation?.videoSrc;
  
  const {
    isPlaying,
    currentTime,
    timeRemaining,
    muted,
    videoRef,
    toggleMute,
    togglePlayPause,
    stopSession,
    duration: playerDuration
  } = useMeditationPlayer({
    audioSrc: meditationAudioSrc,
    videoSrc: meditationVideoSrc,
    duration: meditationDuration,
    onComplete
  });

  return (
    <Card className="bg-[#132920] border-[#2E9E83] w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <MeditationHeader 
          title={meditationTitle} 
          description={meditationDescription}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <MeditationProgress 
          duration={playerDuration}
          currentTime={currentTime}
          timeRemaining={timeRemaining}
          muted={muted}
          onToggleMute={toggleMute}
          videoSrc={meditationVideoSrc}
          videoRef={videoRef}
        />
      </CardContent>
      
      <CardFooter>
        <MeditationControls 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onStop={stopSession}
        />
      </CardFooter>
    </Card>
  );
};

export default MeditationPlayer;
