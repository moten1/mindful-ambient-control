
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Timer, ChevronRight } from 'lucide-react';
import { MeditationScript } from '@/types/meditation';

interface MeditationSelectorProps {
  meditations: MeditationScript[];
  onSelectMeditation: (meditation: MeditationScript) => void;
  recommendedMeditation?: MeditationScript;
}

const MeditationSelector: React.FC<MeditationSelectorProps> = ({
  meditations,
  onSelectMeditation,
  recommendedMeditation
}) => {
  // Group meditations by energy type
  const meditationsByType: Record<string, MeditationScript[]> = {
    calming: [],
    energizing: [],
    focusing: [],
    balancing: []
  };
  
  meditations.forEach(med => {
    meditationsByType[med.energyType].push(med);
  });

  return (
    <Card className="bg-[#132920] border-[#2E9E83] w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#7CE0C6] text-lg">Guided Meditations</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Recommended Meditation */}
        {recommendedMeditation && (
          <div className="mb-4">
            <div className="text-sm text-[#7CE0C6] mb-2 flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              AI Recommended
            </div>
            <div 
              className="bg-[#1d4230] border border-[#2E9E83] rounded-md p-3 cursor-pointer hover:bg-[#204936] transition-colors"
              onClick={() => onSelectMeditation(recommendedMeditation)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">{recommendedMeditation.title}</div>
                  <div className="text-sm text-gray-300 line-clamp-1 mt-1">{recommendedMeditation.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-[#2E9E83]/20 text-[#7CE0C6] border-[#2E9E83]">
                      {recommendedMeditation.energyType}
                    </Badge>
                    <div className="flex items-center text-gray-400 text-xs">
                      <Timer size={12} className="mr-1" />
                      {Math.floor(recommendedMeditation.duration / 60)} min
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-[#2E9E83]" />
              </div>
            </div>
          </div>
        )}
        
        {/* List of all meditations by type */}
        {Object.entries(meditationsByType).map(([type, typeMeditations]) => (
          typeMeditations.length > 0 && (
            <div key={type} className="space-y-2">
              <h3 className="text-sm font-medium text-white capitalize">{type}</h3>
              {typeMeditations.map(meditation => (
                <div 
                  key={meditation.id}
                  className="bg-[#0A1A14] rounded-md p-3 cursor-pointer hover:bg-[#132920] transition-colors"
                  onClick={() => onSelectMeditation(meditation)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white">{meditation.title}</div>
                      <div className="flex items-center text-gray-400 text-xs mt-1">
                        <Timer size={12} className="mr-1" />
                        {Math.floor(meditation.duration / 60)} min
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-[#2E9E83]">
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
};

export default MeditationSelector;
