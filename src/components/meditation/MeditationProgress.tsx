
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Timer, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MeditationProgressProps {
  duration: number;
  currentTime: number;
  timeRemaining: number;
  muted: boolean;
  onToggleMute: () => void;
  videoSrc?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const MeditationProgress: React.FC<MeditationProgressProps> = ({
  duration,
  currentTime,
  timeRemaining,
  muted,
  onToggleMute,
  videoSrc,
  videoRef
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = (currentTime / duration) * 100;
  
  // Check if the video is from YouTube
  const isYouTubeVideo = videoSrc?.includes('youtube.com') || videoSrc?.includes('youtu.be');
  
  // Extract YouTube video ID if it's a YouTube link
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  const youtubeVideoId = videoSrc ? getYouTubeVideoId(videoSrc) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="text-[#7CE0C6]" size={16} />
          <span className="text-gray-300 text-sm">{formatTime(duration)} Session</span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          className="text-[#7CE0C6] hover:bg-[#1d4230]"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
      </div>
      
      <Progress 
        className="h-2 bg-[#0A1A14]" 
        value={progressPercentage} 
      />
      
      {videoSrc ? (
        <div className="relative rounded-md overflow-hidden aspect-video">
          {isYouTubeVideo && youtubeVideoId ? (
            <iframe 
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&mute=1&loop=1&playlist=${youtubeVideoId}&rel=0`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={false}
              className="w-full h-full object-cover"
              title="Meditation Video"
            />
          ) : (
            <video 
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              muted={true}
              loop
              playsInline
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-5xl font-light text-[#7CE0C6] bg-[#0A1A14]/50 px-8 py-4 rounded-lg">
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0A1A14] p-6 rounded-md min-h-[120px] flex items-center justify-center">
          <p className="text-5xl font-light text-[#7CE0C6]">
            {formatTime(timeRemaining)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MeditationProgress;

