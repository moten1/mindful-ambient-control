import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import FreeMeditationSelector, { MeditationOption } from '@/components/FreeMeditationSelector';
import MeditationPlayer from '@/components/MeditationPlayer';

// Sample meditation data (in a real app, this would come from an API or database)
const sampleMeditations: MeditationOption[] = [
  {
    id: '1',
    title: 'Morning Calm',
    description: 'Start your day with a peaceful 10-minute meditation to set a positive tone.',
    duration: 600, // 10 minutes
    audioSrc: '', // No audio source to prevent errors - meditation can work visually
    videoSrc: 'https://youtu.be/7EJKDj6ELiM' // YouTube meditation video
  },
  {
    id: '2',
    title: 'Stress Relief',
    description: 'Release tension and find inner peace with this guided meditation.',
    duration: 600, // 10 minutes
    audioSrc: '', // No audio source to prevent errors
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1208-large.mp4' // Example video URL
  },
  {
    id: '3',
    title: 'Deep Relaxation',
    description: 'Unwind and let go of your day with this calming meditation practice.',
    duration: 600, // 10 minutes
    audioSrc: '', // No audio source to prevent errors
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4' // Example video URL
  }
];

const FreeMeditationPage: React.FC = () => {
  const [selectedMeditation, setSelectedMeditation] = useState<MeditationOption | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const navigate = useNavigate();
  
  const handleSelectMeditation = (meditation: MeditationOption) => {
    setSelectedMeditation(meditation);
    setShowPlayer(true);
  };
  
  const handleMeditationComplete = () => {
    setShowPlayer(false);
    setSelectedMeditation(null);
  };
  
  const handleClosePlayer = () => {
    setShowPlayer(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A14] to-[#132920] text-white flex flex-col items-center justify-center py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-[#7CE0C6] text-xl mb-2">Inner Current</h1>
        <h2 className="text-4xl md:text-5xl font-light mb-4">
          Begin your meditation journey
        </h2>
        <p className="text-gray-300 max-w-xl mx-auto">
          Choose from our selection of free guided meditations to help you relax, 
          focus, and find inner peace.
        </p>
      </div>
      
      <FreeMeditationSelector 
        meditations={sampleMeditations}
        onSelect={handleSelectMeditation}
      />
      
      <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
        <DialogContent className="bg-[#0A1A14] border-[#2E9E83] text-white p-0 max-w-3xl">
          {selectedMeditation && (
            <MeditationPlayer 
              title={selectedMeditation.title}
              description={selectedMeditation.description}
              audioSrc={selectedMeditation.audioSrc}
              videoSrc={selectedMeditation.videoSrc}
              duration={selectedMeditation.duration}
              onComplete={handleMeditationComplete}
              onClose={handleClosePlayer}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <div className="mt-12 text-center">
        <p className="text-[#7CE0C6]">
          Upgrade to premium for personalized AI-generated meditations
        </p>
        <Button 
          onClick={() => navigate('/premium')}
          className="mt-4 bg-[#2E9E83] hover:bg-[#39BF9D]"
        >
          Explore Premium Features
        </Button>
      </div>
    </div>
  );
};

export default FreeMeditationPage;
