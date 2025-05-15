
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { textToSpeech, releaseAudioUrl } from '@/utils/elevenlabs';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from '@/hooks/use-toast';

interface VoiceNarrationPlayerProps {
  scriptLines: string[];
  isPlaying: boolean;
  currentLineIndex: number;
  onComplete: () => void;
}

const VoiceNarrationPlayer: React.FC<VoiceNarrationPlayerProps> = ({
  scriptLines,
  isPlaying,
  currentLineIndex,
  onComplete
}) => {
  const [audioUrls, setAudioUrls] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { elevenLabsApiKey, selectedVoice, narrationEnabled } = useSettings();
  
  // Generate audio for current line if needed
  useEffect(() => {
    const generateAudio = async () => {
      if (!narrationEnabled || !elevenLabsApiKey || currentLineIndex >= scriptLines.length || !isPlaying) {
        return;
      }
      
      // If we don't have audio for this line yet, generate it
      if (!audioUrls[currentLineIndex]) {
        setIsLoading(true);
        
        const audioUrl = await textToSpeech(
          scriptLines[currentLineIndex],
          selectedVoice.id,
          elevenLabsApiKey
        );
        
        setAudioUrls(prev => {
          const newUrls = [...prev];
          newUrls[currentLineIndex] = audioUrl;
          return newUrls;
        });
        
        setIsLoading(false);
      }
    };
    
    generateAudio();
  }, [currentLineIndex, scriptLines, elevenLabsApiKey, selectedVoice, isPlaying, narrationEnabled, audioUrls]);
  
  // Play audio when available and when line changes
  useEffect(() => {
    if (
      isPlaying && 
      narrationEnabled && 
      !isMuted && 
      audioUrls[currentLineIndex] && 
      audioRef.current
    ) {
      audioRef.current.src = audioUrls[currentLineIndex] || '';
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  }, [currentLineIndex, audioUrls, isPlaying, narrationEnabled, isMuted]);
  
  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      audioUrls.forEach(url => {
        if (url) releaseAudioUrl(url);
      });
    };
  }, [audioUrls]);
  
  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };
  
  return (
    <div className="relative">
      <audio 
        ref={audioRef} 
        onError={() => {
          toast({
            title: "Audio Error",
            description: "Failed to play audio narration",
            variant: "destructive"
          });
        }}
        onEnded={() => {
          // Audio for this line has ended
          if (currentLineIndex === scriptLines.length - 1) {
            // Last line finished, trigger complete
            onComplete();
          }
        }}
      />
      
      {narrationEnabled && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={isMuted ? "text-gray-400" : "text-[#7CE0C6]"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default VoiceNarrationPlayer;
