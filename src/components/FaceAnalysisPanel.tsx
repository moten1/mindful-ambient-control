
import { FacialMetrics } from '@/hooks/useFaceAnalysis';
import { Slider } from '@/components/ui/slider';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FaceAnalysisPanelProps {
  metrics: FacialMetrics;
  isAnalyzing: boolean;
  isPermissionGranted: boolean;
  onRequestPermission: () => Promise<boolean>;
  onToggleAnalyzing: () => void;
}

export const FaceAnalysisPanel = ({
  metrics,
  isAnalyzing,
  isPermissionGranted,
  onRequestPermission,
  onToggleAnalyzing
}: FaceAnalysisPanelProps) => {
  return (
    <Card className="bg-[#132920] border-[#2E9E83]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7CE0C6] text-lg flex items-center justify-between">
          <span>Face Analysis</span>
          {isPermissionGranted ? (
            <Button
              onClick={onToggleAnalyzing}
              variant="ghost"
              size="icon"
              className={isAnalyzing ? 'text-[#7CE0C6] animate-pulse-slow' : 'text-[#2E9E83]'}
            >
              {isAnalyzing ? <Camera /> : <CameraOff />}
            </Button>
          ) : (
            <Button
              onClick={onRequestPermission}
              variant="outline"
              className="bg-[#143024] text-[#7CE0C6] border-[#2E9E83] hover:bg-[#1d4230] hover:text-[#7CE0C6]"
            >
              Enable Camera
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-2 bg-[#143024] rounded-md flex items-center justify-between">
            <span className="text-sm text-gray-300">Face Detected</span>
            <span className={`text-sm font-medium ${metrics.faceDetected ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.faceDetected ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Attention Level</span>
              <span className="text-sm text-[#7CE0C6]">{metrics.attentionLevel}%</span>
            </div>
            <Slider value={[metrics.attentionLevel]} max={100} step={1} disabled />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Eye Openness</span>
              <span className="text-sm text-[#7CE0C6]">{metrics.eyeOpenness}%</span>
            </div>
            <Slider value={[metrics.eyeOpenness]} max={100} step={1} disabled />
          </div>

          <div className="bg-[#143024] rounded-md p-2">
            <div className="text-sm text-gray-300">Emotion</div>
            <div className={`font-medium ${
              metrics.emotion === 'happy' || metrics.emotion === 'relaxed'
                ? 'text-green-400' 
                : metrics.emotion === 'stressed' || metrics.emotion === 'sad'
                  ? 'text-red-400' 
                  : 'text-[#7CE0C6]'
            }`}>
              {metrics.emotion.charAt(0).toUpperCase() + metrics.emotion.slice(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceAnalysisPanel;
