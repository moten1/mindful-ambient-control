
import { MeditationScript } from '../types/meditation';

export const meditationScripts: MeditationScript[] = [
  {
    id: 'deep-relaxation',
    title: 'Deep Relaxation',
    description: 'A gentle meditation to release tension and find inner calm',
    duration: 600, // 10 minutes
    energyType: 'calming',
    script: [
      "Welcome to this guided meditation. Find a comfortable position and allow your body to be fully supported.",
      "Take a deep breath in through your nose, filling your lungs completely, and then exhale slowly through your mouth.",
      "With each breath, feel yourself becoming more relaxed, more at ease.",
      "Focus your attention on your breathing, noticing the natural rhythm of your inhales and exhales.",
      "Now bring your awareness to any tension in your body. With each exhale, release that tension.",
      "Imagine a warm, gentle light filling your body with each inhale, bringing relaxation and peace.",
      "As thoughts arise, simply acknowledge them and let them pass, returning your focus to your breath.",
      "Feel yourself becoming increasingly peaceful, your mind clear and calm.",
      "Allow yourself to rest in this space of tranquility for a few moments.",
      "When you're ready, slowly bring your awareness back to your surroundings, feeling refreshed and renewed."
    ],
    recommendedFor: ['stress reduction', 'anxiety relief', 'better sleep']
  },
  {
    id: 'energy-activation',
    title: 'Energy Activation',
    description: 'Awaken and stimulate your inner energy centers',
    duration: 480, // 8 minutes
    energyType: 'energizing',
    script: [
      "Welcome to this energizing meditation. Sit comfortably with your spine straight and shoulders relaxed.",
      "Take three deep breaths, feeling energy beginning to flow through your body.",
      "Visualize a bright, radiant sun just above your head, glowing with vibrant energy.",
      "With each inhale, draw this golden light into your body, filling you with vitality and clarity.",
      "Feel this energy circulating through your entire being, revitalizing each cell.",
      "As you exhale, release any stagnant or heavy energy that no longer serves you.",
      "Continue breathing dynamically, feeling more awake and alert with each breath.",
      "Imagine this energy expanding beyond your physical body, creating a field of vitality around you.",
      "Bring your palms together and rub them vigorously, creating warmth and energy.",
      "Place your warm hands over your face, feeling the energy transfer and awaken your senses."
    ],
    recommendedFor: ['morning practice', 'overcoming fatigue', 'mental clarity']
  },
  {
    id: 'focus-enhancement',
    title: 'Focus Enhancement',
    description: 'Sharpen your concentration and mental clarity',
    duration: 420, // 7 minutes
    energyType: 'focusing',
    script: [
      "Begin by finding a comfortable seated position, with your back straight and your body relaxed.",
      "Close your eyes and take a few deep breaths, clearing your mind of distractions.",
      "Now, bring your attention to a single point of focus: your breath as it enters and leaves your nostrils.",
      "Notice the sensation of the air as it passes through - cool on the inhale, warm on the exhale.",
      "If your mind begins to wander, gently guide it back to this one point of focus.",
      "With each breath, imagine your concentration becoming sharper, more refined.",
      "Visualize your thoughts as clouds passing by in a clear sky - acknowledge them, then let them drift away.",
      "Feel your mind becoming more clear, more centered, more present.",
      "Expand your awareness to include the sounds around you, while maintaining your inner focus.",
      "When you're ready, slowly open your eyes, carrying this focused awareness with you."
    ],
    recommendedFor: ['work preparation', 'study sessions', 'decision making']
  },
  {
    id: 'harmony-balance',
    title: 'Harmony & Balance',
    description: 'Restore equilibrium between mind, body and energy',
    duration: 540, // 9 minutes
    energyType: 'balancing',
    script: [
      "Begin this meditation by finding a comfortable position that allows your spine to be straight.",
      "Take a few deep breaths, allowing your body to relax and your mind to become still.",
      "Visualize your body as a vessel of energy, with different currents flowing through you.",
      "Notice if any areas feel blocked, depleted, or overly energized.",
      "Imagine breathing directly into these areas, restoring balance with each inhale and exhale.",
      "Feel the left and right sides of your body coming into harmony, neither side dominating.",
      "Now bring awareness to the balance between activity and rest in your life.",
      "Visualize a scale within you finding its perfect equilibrium point.",
      "Sense the balance between your inner and outer worlds, between giving and receiving.",
      "When you're ready, bring this sense of harmony with you as you return to your day."
    ],
    recommendedFor: ['emotional regulation', 'life transitions', 'general wellbeing']
  }
];

export const getMeditationById = (id: string): MeditationScript | undefined => {
  return meditationScripts.find(script => script.id === id);
};

export const getMeditationsByEnergyType = (type: MeditationScript['energyType']): MeditationScript[] => {
  return meditationScripts.filter(script => script.energyType === type);
};

export const getRecommendedMeditation = (metrics: {
  heartRate?: number,
  emotion?: string,
  energyLevel?: string,
  attentionLevel?: number
}): MeditationScript => {
  // Default to a balancing meditation
  let recommendedType: MeditationScript['energyType'] = 'balancing';
  
  // Determine the best type based on biometrics
  if (metrics.heartRate && metrics.heartRate > 80 || metrics.emotion === 'stressed') {
    recommendedType = 'calming';
  } else if (metrics.energyLevel === 'low' || metrics.emotion === 'sad') {
    recommendedType = 'energizing';
  } else if (metrics.attentionLevel && metrics.attentionLevel < 60) {
    recommendedType = 'focusing';
  }
  
  // Get all meditations of the recommended type
  const matchingMeditations = getMeditationsByEnergyType(recommendedType);
  
  // Return a random meditation from the matching ones
  return matchingMeditations[Math.floor(Math.random() * matchingMeditations.length)];
};
