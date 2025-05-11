
export interface MeditationScript {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  energyType: 'calming' | 'energizing' | 'balancing' | 'focusing';
  script: string[];
  recommendedFor: string[];
}
