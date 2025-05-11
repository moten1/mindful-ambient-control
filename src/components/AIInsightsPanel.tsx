
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Brain, ChartLine, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MeditationScript } from '@/types/meditation';

interface InsightMessage {
  message: string;
  type: 'info' | 'suggestion' | 'alert';
}

interface AIInsightsPanelProps {
  insights: InsightMessage[];
  adaptationScore: number;
  sessionRecommendation: string;
  onApplyRecommendation: () => void;
  isActive: boolean;
  recommendedMeditation?: MeditationScript;
  onStartMeditation?: (meditation: MeditationScript) => void;
}

const AIInsightsPanel = ({
  insights,
  adaptationScore,
  sessionRecommendation,
  onApplyRecommendation,
  isActive,
  recommendedMeditation,
  onStartMeditation
}: AIInsightsPanelProps) => {
  return (
    <Card className="bg-[#132920] border-[#2E9E83]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7CE0C6] text-lg flex items-center justify-between">
          <span>AI Insights</span>
          <Brain className={`${isActive ? 'text-[#7CE0C6]' : 'text-[#2E9E83]'}`} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AI Adaptation Score */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">AI Adaptation</span>
              <span className="text-sm text-[#7CE0C6]">{adaptationScore}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="text-[#2E9E83]" size={16} />
              <Progress className="h-2 bg-[#0A1A14]" value={adaptationScore} />
            </div>
          </div>
          
          {/* Recommendation */}
          <div className="p-3 bg-[#143024] rounded-md">
            <div className="flex items-start gap-2">
              <ChartLine className="text-[#7CE0C6] mt-1" size={18} />
              <div>
                <div className="text-sm font-medium text-[#7CE0C6]">Session Recommendation</div>
                <p className="text-sm text-gray-300 mt-1">{sessionRecommendation}</p>
                <Button 
                  onClick={onApplyRecommendation}
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-[#143024] text-[#7CE0C6] border-[#2E9E83] hover:bg-[#1d4230]"
                >
                  Apply Recommendation
                </Button>
              </div>
            </div>
          </div>
          
          {/* Meditation Recommendation */}
          {recommendedMeditation && onStartMeditation && (
            <div className="p-3 bg-[#143024] rounded-md">
              <div className="flex items-start gap-2">
                <BookOpen className="text-[#7CE0C6] mt-1" size={18} />
                <div>
                  <div className="text-sm font-medium text-[#7CE0C6]">Meditation Suggestion</div>
                  <p className="text-sm text-gray-300 mt-1">
                    Try "{recommendedMeditation.title}" ({Math.floor(recommendedMeditation.duration / 60)} min) to {recommendedMeditation.energyType === 'calming' ? 'reduce stress' : 
                      recommendedMeditation.energyType === 'energizing' ? 'boost your energy' : 
                      recommendedMeditation.energyType === 'focusing' ? 'improve focus' : 
                      'restore balance'}.
                  </p>
                  <Button 
                    onClick={() => onStartMeditation(recommendedMeditation)}
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-[#143024] text-[#7CE0C6] border-[#2E9E83] hover:bg-[#1d4230]"
                  >
                    <BookOpen size={14} className="mr-1" /> 
                    Start Meditation
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Insights List */}
          <div className="space-y-2">
            <div className="text-sm text-gray-300">Real-time Insights</div>
            {insights.length === 0 ? (
              <div className="text-sm text-gray-400 italic">Gathering insights...</div>
            ) : (
              insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded-md flex items-start gap-2 ${
                    insight.type === 'alert' 
                      ? 'bg-red-500/10 border border-red-500/30' 
                      : insight.type === 'suggestion'
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'bg-[#143024]'
                  }`}
                >
                  <Lightbulb 
                    size={16} 
                    className={
                      insight.type === 'alert' 
                        ? 'text-red-400' 
                        : insight.type === 'suggestion' 
                          ? 'text-blue-400' 
                          : 'text-[#7CE0C6]'
                    } 
                  />
                  <span className="text-sm">{insight.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
