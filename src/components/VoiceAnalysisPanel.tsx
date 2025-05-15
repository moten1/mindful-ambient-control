
import { VoiceMetrics } from '@/hooks/useVoiceSensing';
import { Slider } from '@/components/ui/slider';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useRef } from 'react';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioVisualizerRef = useRef<number | null>(null);
  
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

  // Sound wave visualization effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isListening) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Create visualizer function
    const visualize = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Base the wave height on the current volume
      const waveHeight = Math.max(5, (metrics.volume / 100) * (height * 0.8));
      
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      
      // Draw a wavy line based on voice metrics
      for (let x = 0; x < width; x++) {
        // Create a sine wave that's influenced by volume
        const frequency = 0.02 + (metrics.clarity / 1000);
        const amplitude = waveHeight * (metrics.volume > 10 ? 1 : 0.2);
        
        // Make the wave more chaotic when tone is stressed
        const chaosFactorForTone = metrics.tone === 'stressed' ? 0.3 : 
                                 metrics.tone === 'calm' ? 0.05 : 0.15;
        
        const randomFactor = Math.random() * chaosFactorForTone * amplitude;
        
        // Combine regular sine wave with randomness for natural voice effect
        const y = (height / 2) + 
                  Math.sin(x * frequency) * amplitude + 
                  Math.sin(x * frequency * 1.5) * (amplitude * 0.3) +
                  randomFactor;
        
        ctx.lineTo(x, y);
      }
      
      // Finish the path
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = metrics.volume > 50 ? '#7CE0C6' : '#2E9E83';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Request next frame only if still listening
      if (isListening) {
        audioVisualizerRef.current = requestAnimationFrame(visualize);
      }
    };
    
    // Start visualization
    audioVisualizerRef.current = requestAnimationFrame(visualize);
    
    // Cleanup
    return () => {
      if (audioVisualizerRef.current) {
        cancelAnimationFrame(audioVisualizerRef.current);
      }
    };
  }, [isListening, metrics.volume, metrics.clarity, metrics.tone]);

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
          {isListening && (
            <div className="audio-visualizer h-12 mb-2">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={48}
                className="w-full h-full"
              ></canvas>
            </div>
          )}
          
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
