
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, Book, Timer } from 'lucide-react';
import { MeditationScript } from '@/types/meditation';

interface MeditationPlayerProps {
  meditation: MeditationScript;
  onComplete?: () => void;
  onClose: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  meditation,
  onComplete,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [timer, setTimer] = useState(meditation.duration);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Calculate time for each script segment
  const segmentTime = Math.floor(meditation.duration / meditation.script.length);
  
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsPlaying(false);
    } else {
      // Play
      const id = window.setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(id);
            setIsPlaying(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          
          // Calculate which script segment to show based on remaining time
          const newIndex = meditation.script.length - 
            Math.ceil((prev - 1) / segmentTime);
          
          if (newIndex !== currentScriptIndex && newIndex < meditation.script.length) {
            setCurrentScriptIndex(newIndex);
          }
          
          return prev - 1;
        });
      }, 1000);
      
      setIntervalId(id);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-[#132920] border-[#2E9E83] w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#7CE0C6] text-lg">{meditation.title}</CardTitle>
          <Badge variant="outline" className="bg-[#2E9E83]/20 text-[#7CE0C6] border-[#2E9E83]">
            {meditation.energyType}
          </Badge>
        </div>
        <p className="text-gray-300 text-sm">{meditation.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="text-[#7CE0C6]" size={16} />
            <span className="text-gray-300 text-sm">Guided Meditation</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="text-[#7CE0C6]" size={16} />
            <span className="text-gray-300 text-sm">{formatTime(meditation.duration)}</span>
          </div>
        </div>
        
        <Progress 
          className="h-2 bg-[#0A1A14]" 
          value={((meditation.duration - timer) / meditation.duration) * 100} 
        />
        
        <div className="bg-[#0A1A14] p-4 rounded-md min-h-[120px] flex items-center">
          <p className="text-gray-100 text-center w-full">
            {meditation.script[currentScriptIndex]}
          </p>
        </div>
        
        <div className="flex gap-2">
          {meditation.recommendedFor.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-[#1d4230] text-[#7CE0C6] border-none">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div>
          <span className="text-[#7CE0C6] text-lg">{formatTime(timer)}</span>
          <span className="text-gray-400 text-sm ml-2">remaining</span>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            className="border-[#2E9E83] text-gray-300"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={togglePlayPause}
            className={isPlaying ? "bg-[#39BF9D]" : "bg-[#2E9E83]"}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2" size={16} />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2" size={16} />
                {timer < meditation.duration ? 'Resume' : 'Begin'}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MeditationPlayer;
