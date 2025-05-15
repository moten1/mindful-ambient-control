
import { VoiceMetrics } from '@/hooks/useVoiceSensing';
import { Slider } from '@/components/ui/slider';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

interface VoiceAnalysisPanelProps {
  metrics: VoiceMetrics;
  isListening: boolean;
  isPermissionGranted: boolean;
  onRequestPermission: () => Promise<boolean>;
  onToggleListening: () => void;
}

export const VoiceAnalysisPanel = ({
  metrics,
  isListening,
  isPermissionGranted,
  onRequestPermission,
  onToggleListening
}: VoiceAnalysisPanelProps) => {
  const [showWave, setShowWave] = useState(false);
  const [volumeClass, setVolumeClass] = useState('bg-[#0A1A14]');
  
  // Show wave animation when actively listening and volume is above threshold
  useEffect(() => {
    if (isListening && metrics.volume > 15) {
      setShowWave(true);
    } else {
      setShowWave(false);
    }
    
    // Set volume bar color based on level
    if (metrics.volume > 80) {
      setVolumeClass('bg-red-500');
    } else if (metrics.volume > 50) {
      setVolumeClass('bg-yellow-500');
    } else if (metrics.volume > 20) {
      setVolumeClass('bg-green-500');
    } else {
      setVolumeClass('bg-[#0A1A14]');
    }
  }, [isListening, metrics.volume]);

  return (
    <Card className="bg-[#132920] border-[#2E9E83]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7CE0C6] text-lg flex items-center justify-between">
          <span>Voice Analysis</span>
          {isPermissionGranted ? (
            <Button
              onClick={onToggleListening}
              variant="ghost"
              size="icon"
              className={isListening ? 'text-[#7CE0C6] animate-pulse-slow' : 'text-[#2E9E83]'}
            >
              {isListening ? <Mic /> : <MicOff />}
            </Button>
          ) : (
            <Button
              onClick={onRequestPermission}
              variant="outline"
              className="bg-[#143024] text-[#7CE0C6] border-[#2E9E83] hover:bg-[#1d4230] hover:text-[#7CE0C6]"
            >
              Enable Mic
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isListening && showWave && (
            <div className="vocal-wave mb-2">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Volume</span>
              <span className={`text-sm ${metrics.volume > 50 ? 'text-yellow-400' : 'text-[#7CE0C6]'}`}>
                {metrics.volume}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className={metrics.volume > 20 ? 'text-[#7CE0C6]' : 'text-[#2E9E83]'} size={16} />
              <Progress 
                className={`h-2 transition-all duration-300 ${volumeClass}`} 
                value={metrics.volume} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Clarity</span>
              <span className="text-sm text-[#7CE0C6]">{metrics.clarity}%</span>
            </div>
            <Slider value={[metrics.clarity]} max={100} step={1} disabled />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#143024] rounded-md p-2">
              <div className="text-sm text-gray-300">Tone</div>
              <div className={`font-medium ${
                metrics.tone === 'calm' 
                  ? 'text-blue-400' 
                  : metrics.tone === 'stressed' 
                    ? 'text-red-400' 
                    : 'text-[#7CE0C6]'
              }`}>
                {metrics.tone.charAt(0).toUpperCase() + metrics.tone.slice(1)}
              </div>
            </div>
            <div className="bg-[#143024] rounded-md p-2">
              <div className="text-sm text-gray-300">Breathing</div>
              <div className={`font-medium ${
                metrics.breathing === 'deep' 
                  ? 'text-blue-400' 
                  : metrics.breathing === 'shallow' 
                    ? 'text-red-400' 
                    : 'text-[#7CE0C6]'
              }`}>
                {metrics.breathing.charAt(0).toUpperCase() + metrics.breathing.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAnalysisPanel;
