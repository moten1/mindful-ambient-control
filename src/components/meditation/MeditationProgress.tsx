
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
          <video 
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            muted={true}
            loop
            playsInline
          />
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
