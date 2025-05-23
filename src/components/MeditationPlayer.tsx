
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { MeditationScript } from '@/types/meditation';
import MeditationHeader from './meditation/MeditationHeader';
import MeditationProgress from './meditation/MeditationProgress';
import MeditationControls from './meditation/MeditationControls';
import MeditationLinkInput from './meditation/MeditationLinkInput';
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
  
  const [customAudioSrc, setCustomAudioSrc] = useState<string | undefined>(undefined);
  const [customVideoSrc, setCustomVideoSrc] = useState<string | undefined>(undefined);
  
  // Use custom sources if provided, otherwise fall back to props or defaults
  const effectiveAudioSrc = customAudioSrc || audioSrc || meditation?.audioSrc || "https://assets.mixkit.co/music/preview/mixkit-meditation-music-577.mp3";
  const effectiveVideoSrc = customVideoSrc || videoSrc || meditation?.videoSrc;
  
  const handleLinkSubmit = (newVideoSrc: string | undefined, newAudioSrc: string | undefined) => {
    if (newVideoSrc) setCustomVideoSrc(newVideoSrc);
    if (newAudioSrc) setCustomAudioSrc(newAudioSrc);
    
    // Reset the player when new sources are provided
    if (isPlaying) {
      stopSession();
      // Small timeout to ensure the audio/video elements are properly reset
      setTimeout(() => {
        startSession();
      }, 100);
    }
  };
  
  const {
    isPlaying,
    currentTime,
    timeRemaining,
    muted,
    videoRef,
    toggleMute,
    togglePlayPause,
    stopSession,
    startSession,
    duration: playerDuration
  } = useMeditationPlayer({
    audioSrc: effectiveAudioSrc,
    videoSrc: effectiveVideoSrc,
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
        <MeditationLinkInput onLinkSubmit={handleLinkSubmit} />
        
        <MeditationProgress 
          duration={playerDuration}
          currentTime={currentTime}
          timeRemaining={timeRemaining}
          muted={muted}
          onToggleMute={toggleMute}
          videoSrc={effectiveVideoSrc}
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
