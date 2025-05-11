
// AI Engine for intelligent environment adaptation
type SensorData = {
  voice: {
    volume: number;
    tone: string;
    clarity: number;
    breathing: string;
  };
  face: {
    emotion: string;
    attentionLevel: number;
    eyeOpenness: number;
    faceDetected: boolean;
  };
  wearable: {
    heartRate: number;
    bodyTemperature: number;
    bloodOxygen: number;
    energyLevel: string;
  };
};

type EnvironmentRecommendation = {
  sound: number;
  temperature: number;
  vibration: number;
  light: number;
  brightness: number;
};

type InsightMessage = {
  message: string;
  type: 'info' | 'suggestion' | 'alert';
};

// Generate environment settings based on biometric data
export const generateEnvironmentSettings = (data: SensorData): EnvironmentRecommendation => {
  // Base settings
  const settings: EnvironmentRecommendation = {
    sound: 50,
    temperature: 50,
    vibration: 50,
    light: 50,
    brightness: 50,
  };
  
  // Adjust sound based on voice and heart rate
  if (data.voice.tone === 'stressed' || data.wearable.heartRate > 85) {
    settings.sound = Math.max(30, settings.sound - 20);
  } else if (data.voice.tone === 'calm' && data.wearable.heartRate < 70) {
    settings.sound = Math.min(70, settings.sound + 10);
  }
  
  // Adjust temperature based on body temperature
  if (data.wearable.bodyTemperature > 37) {
    settings.temperature = Math.max(30, settings.temperature - 15);
  } else if (data.wearable.bodyTemperature < 36.5) {
    settings.temperature = Math.min(70, settings.temperature + 15);
  }
  
  // Adjust vibration based on emotion and heart rate
  if (data.face.emotion === 'stressed' || data.face.emotion === 'sad') {
    settings.vibration = Math.max(20, settings.vibration - 30);
  } else if (data.face.emotion === 'happy' || data.face.emotion === 'relaxed') {
    settings.vibration = Math.min(80, settings.vibration + 10);
  }
  
  // Adjust light and brightness based on attention and eye openness
  if (data.face.attentionLevel < 60) {
    settings.light = Math.max(40, settings.light + 10);
    settings.brightness = Math.max(45, settings.brightness + 15);
  } else if (data.face.eyeOpenness < 70) {
    settings.light = Math.max(35, settings.light - 15);
    settings.brightness = Math.max(40, settings.brightness - 10);
  }
  
  return settings;
};

// Generate personalized insights based on collected data
export const generateInsights = (data: SensorData): InsightMessage[] => {
  const insights: InsightMessage[] = [];
  
  // Detect stress patterns
  if (data.voice.tone === 'stressed' && data.face.emotion === 'stressed') {
    insights.push({
      message: 'High stress detected. Consider deep breathing exercises.',
      type: 'suggestion'
    });
  }
  
  // Detect focus issues
  if (data.face.attentionLevel < 50 && data.face.emotion !== 'relaxed') {
    insights.push({
      message: 'Focus seems scattered. Adjusting light to help concentration.',
      type: 'info'
    });
  }
  
  // Detect physical issues
  if (data.wearable.heartRate > 90) {
    insights.push({
      message: 'Elevated heart rate detected. Adjusting environment for calming.',
      type: 'alert'
    });
  }
  
  if (data.wearable.bloodOxygen < 95) {
    insights.push({
      message: 'Blood oxygen slightly low. Consider deeper breathing patterns.',
      type: 'suggestion'
    });
  }
  
  // Detect positive states to reinforce
  if (data.face.emotion === 'relaxed' && data.voice.breathing === 'deep') {
    insights.push({
      message: 'Optimal relaxation state achieved. Maintaining current settings.',
      type: 'info'
    });
  }
  
  return insights;
};

// Generate overall session recommendation
export const generateSessionRecommendation = (data: SensorData): string => {
  // Determine dominant emotional state
  const emotionalState = determineEmotionalState(data);
  
  // Generate personalized recommendation
  switch(emotionalState) {
    case 'stressed':
      return "Your biometrics indicate elevated stress levels. A calming session with reduced stimuli is recommended.";
    case 'tired':
      return "Signs of fatigue detected. An energizing session with increased brightness may help restore energy.";
    case 'distracted':
      return "Attention metrics show distraction. A focused session with stable environment is recommended.";
    case 'balanced':
      return "Your metrics are well-balanced. A maintenance session to reinforce this state is recommended.";
    default:
      return "Based on your current readings, a balanced calibration session is recommended.";
  }
};

// Helper function to determine overall emotional state
const determineEmotionalState = (data: SensorData): 'stressed' | 'tired' | 'distracted' | 'balanced' => {
  // Stress indicators
  if (
    data.wearable.heartRate > 85 || 
    data.face.emotion === 'stressed' || 
    data.voice.tone === 'stressed'
  ) {
    return 'stressed';
  }
  
  // Fatigue indicators
  if (
    data.face.eyeOpenness < 70 || 
    data.wearable.energyLevel === 'low'
  ) {
    return 'tired';
  }
  
  // Distraction indicators
  if (data.face.attentionLevel < 60) {
    return 'distracted';
  }
  
  // Default to balanced
  return 'balanced';
};
