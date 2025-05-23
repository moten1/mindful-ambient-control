
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';

interface MeditationHeaderProps {
  title: string;
  description: string;
}

const MeditationHeader: React.FC<MeditationHeaderProps> = ({
  title,
  description
}) => {
  return (
    <div className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-[#7CE0C6] text-lg">{title}</CardTitle>
        <Badge variant="outline" className="bg-[#2E9E83]/20 text-[#7CE0C6] border-[#2E9E83]">
          Free Session
        </Badge>
      </div>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
};

export default MeditationHeader;
