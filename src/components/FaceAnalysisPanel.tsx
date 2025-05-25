'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTensorFlowBiometrics } from '@/hooks/useTensorFlowBiometrics';
import { Slider } from '@/components/ui/slider';
import { Camera, CameraOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FaceAnalysisPanelProps {
  isPermissionGranted: boolean;
  onRequestPermission: () => Promise<boolean>;
  onToggleAnalyzing: () => void;
  isAnalyzing: boolean;
}

const FaceAnalysisPanel = ({
  isPermissionGranted,
  onRequestPermission,
  onToggleAnalyzing,
  isAnalyzing,
}: FaceAnalysisPanelProps) => {
  const { videoRef, faceData, loading, error } = useTensorFlowBiometrics();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [metrics, setMetrics] = useState({
    faceDetected: false,
    attentionLevel: 0,
    eyeOpenness: 0,
    emotion: 'neutral',
  });

  useEffect(() => {
    if (!faceData) {
      setMetrics({
        faceDetected: false,
        attentionLevel: 0,
        eyeOpenness: 0,
        emotion: 'neutral',
      });
      return;
    }

    setMetrics({
      faceDetected: true,
      attentionLevel: faceData.attention || 50,
      eyeOpenness: faceData.eyeOpenness || 50,
      emotion: faceData.emotion || 'neutral',
    });
  }, [faceData]);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (faceData?.landmarks) {
      ctx.strokeStyle = '#7CE0C6';
      ctx.lineWidth = 2;
      faceData.landmarks.forEach((point: { x: number; y: number }) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#7CE0C6';
        ctx.fill();
      });
    }
  }, [faceData]);

  return (
    <Card className="bg-[#132920] border-[#2E9E83] relative">
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="text-[#7CE0C6] text-lg flex items-center gap-2">
          Face Analysis
          {loading && <span className="text-sm text-gray-400">Loading...</span>}
          {error && <span className="text-sm text-red-500">Error: {error}</span>}
        </CardTitle>

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
      </CardHeader>

      <div className="relative w-full h-64 mb-4 bg-black rounded-md overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

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
            <div className="flex items-center gap-2">
              <Eye className="text-[#2E9E83]" size={16} />
              <Progress className="h-2 bg-[#0A1A14]" value={metrics.eyeOpenness} />
            </div>
          </div>

          <div className="bg-[#143024] rounded-md p-2">
            <div className="text-sm text-gray-300 mb-1">Emotion</div>
            <div
              className={`font-medium ${
                metrics.emotion === 'happy' || metrics.emotion === 'relaxed'
                  ? 'text-green-400'
                  : metrics.emotion === 'stressed' || metrics.emotion === 'sad'
                    ? 'text-red-400'
                    : 'text-[#7CE0C6]'
              }`}
            >
              {metrics.emotion.charAt(0).toUpperCase() + metrics.emotion.slice(1)}
            </div>
            <div className="mt-2 flex gap-1">
              {['happy', 'neutral', 'sad', 'stressed', 'relaxed'].map(emotion => (
                <div
                  key={emotion}
                  className={`h-1 flex-1 rounded-full ${
                    metrics.emotion === emotion
                      ? emotion === 'happy' || emotion === 'relaxed'
                        ? 'bg-green-400'
                        : emotion === 'stressed' || emotion === 'sad'
                          ? 'bg-red-400'
                          : 'bg-[#7CE0C6]'
                      : 'bg-[#0A1A14]'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceAnalysisPanel;
