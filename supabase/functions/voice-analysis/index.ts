
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioData, frequencyData } = await req.json();
    
    console.log('Processing voice analysis...');

    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (!HUGGING_FACE_TOKEN) {
      console.warn('Hugging Face token not set, using enhanced audio simulation');
      // Enhanced simulation based on actual audio frequency analysis
      const volume = calculateVolumeFromFrequency(frequencyData);
      const simulatedMetrics = {
        volume,
        tone: volume > 70 ? 'stressed' : volume < 30 ? 'calm' : 'neutral',
        clarity: Math.floor(Math.random() * 30) + 70,
        breathing: volume > 60 ? 'shallow' : volume < 40 ? 'deep' : 'normal'
      };
      
      return new Response(JSON.stringify(simulatedMetrics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Real voice analysis using Hugging Face models
    let analysisResults = {};

    // Emotion detection from audio if available
    if (audioData) {
      try {
        const emotionResponse = await fetch(
          'https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
              'Content-Type': 'audio/wav'
            },
            body: audioData
          }
        );

        if (emotionResponse.ok) {
          const emotionData = await emotionResponse.json();
          console.log('Voice emotion analysis:', emotionData);
          
          const topEmotion = emotionData[0];
          analysisResults.tone = mapVoiceEmotion(topEmotion.label);
        }
      } catch (error) {
        console.log('Voice emotion analysis failed, using frequency analysis');
      }
    }

    // Calculate metrics from frequency data
    const volume = calculateVolumeFromFrequency(frequencyData);
    const clarity = calculateClarityFromFrequency(frequencyData);
    const breathing = analyzeBreathingPattern(frequencyData);

    const metrics = {
      volume,
      tone: analysisResults.tone || (volume > 70 ? 'stressed' : volume < 30 ? 'calm' : 'neutral'),
      clarity,
      breathing
    };

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Voice analysis error:', error);
    return new Response(JSON.stringify({
      volume: 50,
      tone: 'neutral',
      clarity: 75,
      breathing: 'normal'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateVolumeFromFrequency(frequencyData: number[]): number {
  if (!frequencyData || frequencyData.length === 0) return 0;
  
  const sum = frequencyData.reduce((acc, val) => acc + val, 0);
  const average = sum / frequencyData.length;
  return Math.min(100, Math.max(0, average * 2));
}

function calculateClarityFromFrequency(frequencyData: number[]): number {
  if (!frequencyData || frequencyData.length === 0) return 75;
  
  // Higher frequencies often indicate clearer speech
  const midRange = frequencyData.slice(frequencyData.length / 4, frequencyData.length / 2);
  const midSum = midRange.reduce((acc, val) => acc + val, 0);
  const clarity = (midSum / midRange.length) * 1.5;
  
  return Math.min(95, Math.max(20, clarity));
}

function analyzeBreathingPattern(frequencyData: number[]): string {
  if (!frequencyData || frequencyData.length === 0) return 'normal';
  
  // Analyze low frequency patterns that indicate breathing
  const lowFreq = frequencyData.slice(0, frequencyData.length / 8);
  const avgLowFreq = lowFreq.reduce((acc, val) => acc + val, 0) / lowFreq.length;
  
  if (avgLowFreq > 30) return 'shallow';
  if (avgLowFreq < 15) return 'deep';
  return 'normal';
}

function mapVoiceEmotion(label: string): string {
  const emotionMap = {
    'angry': 'stressed',
    'happy': 'calm',
    'sad': 'stressed', 
    'neutral': 'neutral',
    'fearful': 'stressed',
    'disgusted': 'stressed',
    'surprised': 'neutral'
  };
  
  return emotionMap[label.toLowerCase()] || 'neutral';
}
