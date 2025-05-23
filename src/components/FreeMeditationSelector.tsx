
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, PlayCircle, Video } from 'lucide-react';

export interface MeditationOption {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  audioSrc: string;
  videoSrc?: string;
}

interface FreeMeditationSelectorProps {
  meditations: MeditationOption[];
  onSelect: (meditation: MeditationOption) => void;
}

const FreeMeditationSelector: React.FC<FreeMeditationSelectorProps> = ({
  meditations,
  onSelect
}) => {
  return (
    <Card className="bg-[#132920] border-[#2E9E83] w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7CE0C6] text-lg">Free Meditations</CardTitle>
        <p className="text-gray-300 text-sm">Select a meditation to begin your practice</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {meditations.map((meditation) => (
          <div 
            key={meditation.id}
            className="bg-[#0A1A14] hover:bg-[#1d4230] transition-colors rounded-md p-4 cursor-pointer"
            onClick={() => onSelect(meditation)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">{meditation.title}</div>
                <div className="text-gray-300 text-sm mt-1">{meditation.description}</div>
                <div className="flex items-center gap-3 text-gray-400 text-xs mt-2">
                  <div className="flex items-center">
                    <Timer size={12} className="mr-1" />
                    {Math.floor(meditation.duration / 60)} minutes
                  </div>
                  {meditation.videoSrc && (
                    <div className="flex items-center">
                      <Video size={12} className="mr-1" />
                      Video
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-[#7CE0C6] hover:text-white hover:bg-[#2E9E83]"
              >
                <PlayCircle size={24} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FreeMeditationSelector;
