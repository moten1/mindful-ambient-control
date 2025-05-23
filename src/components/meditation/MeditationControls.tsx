
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square } from 'lucide-react';

interface MeditationControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

const MeditationControls: React.FC<MeditationControlsProps> = ({
  isPlaying,
  onPlayPause,
  onStop,
}) => {
  return (
    <div className="flex justify-center gap-4 py-6">
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full border-[#2E9E83] text-[#7CE0C6] hover:bg-[#1d4230] hover:text-white"
        onClick={onStop}
      >
        <Square size={24} />
      </Button>
      
      <Button
        size="icon"
        className={`h-16 w-16 rounded-full ${isPlaying ? "bg-[#39BF9D]" : "bg-[#2E9E83]"} hover:bg-[#39BF9D]`}
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause size={28} />
        ) : (
          <Play size={28} />
        )}
      </Button>
    </div>
  );
};

export default MeditationControls;
