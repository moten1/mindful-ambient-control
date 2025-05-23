
export interface MeditationScript {
  id: string;
  title: string;
  description: string;
  script: string[];
  duration: number; // in seconds
  energyType: 'calming' | 'energizing' | 'focusing' | 'balancing';
  audioSrc?: string; // URL for pre-recorded audio
  videoSrc?: string; // URL for background video
  voiceId?: string;
  recommendedFor?: string[] | {
    emotion?: string;
    heartRate?: number;
    energyLevel?: number;
    attentionLevel?: number;
  };
}
