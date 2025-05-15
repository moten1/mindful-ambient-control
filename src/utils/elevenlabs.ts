
// ElevenLabs Text-to-Speech API integration
import { toast } from '@/hooks/use-toast';

export type ElevenLabsVoice = {
  id: string;
  name: string;
};

// Default popular voices from ElevenLabs
export const defaultVoices: ElevenLabsVoice[] = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" }
];

// Configure default voice selection
export const defaultVoice = defaultVoices[0];

// Cache for generated audio to avoid unnecessary API calls
const audioCache: Record<string, string> = {};

export const textToSpeech = async (
  text: string, 
  voiceId: string = defaultVoice.id,
  apiKey?: string
): Promise<string | null> => {
  if (!apiKey) {
    toast({
      title: "API Key Missing",
      description: "Please provide an ElevenLabs API key in settings",
      variant: "destructive"
    });
    return null;
  }
  
  // Create a unique cache key based on voice and text
  const cacheKey = `${voiceId}-${text}`;
  
  // Return cached audio if available
  if (audioCache[cacheKey]) {
    return audioCache[cacheKey];
  }
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // High quality model
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('ElevenLabs API error:', error);
      toast({
        title: "Voice Generation Failed",
        description: error.detail?.message || "Please check your API key and try again",
        variant: "destructive"
      });
      return null;
    }
    
    // Convert the response to blob and create an object URL
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    
    // Cache the generated audio
    audioCache[cacheKey] = audioUrl;
    return audioUrl;
    
  } catch (error) {
    console.error('Error generating speech:', error);
    toast({
      title: "Speech Generation Error",
      description: "Failed to connect to ElevenLabs API",
      variant: "destructive"
    });
    return null;
  }
};

// Release object URLs to prevent memory leaks
export const releaseAudioUrl = (url: string): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// Find matching voice or return default
export const findVoiceById = (id: string): ElevenLabsVoice => {
  return defaultVoices.find(voice => voice.id === id) || defaultVoice;
};
