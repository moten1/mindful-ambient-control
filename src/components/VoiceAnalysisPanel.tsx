
import { VoiceMetrics } from '@/hooks/useVoiceSensing';
import { Slider } from '@/components/ui/slider';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Volume</span>
              <span className="text-sm text-[#7CE0C6]">{metrics.volume}%</span>
            </div>
            <Slider value={[metrics.volume]} max={100} step={1} disabled />
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
