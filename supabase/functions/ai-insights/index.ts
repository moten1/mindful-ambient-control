
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
    const { biometricData, sessionHistory } = await req.json();
    
    console.log('Generating AI insights...', biometricData);

    const HUGGING_FACE_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (!HUGGING_FACE_TOKEN) {
      console.warn('Hugging Face token not set, using rule-based insights');
      const insights = generateRuleBasedInsights(biometricData);
      return new Response(JSON.stringify(insights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create context for AI analysis
    const context = `
    User biometric data:
    - Face emotion: ${biometricData.face?.emotion || 'unknown'}
    - Attention level: ${biometricData.face?.attentionLevel || 0}%
    - Voice tone: ${biometricData.voice?.tone || 'unknown'}  
    - Voice volume: ${biometricData.voice?.volume || 0}%
    - Heart rate: ${biometricData.wearable?.heartRate || 0} BPM
    - Energy level: ${biometricData.wearable?.energyLevel || 'unknown'}
    
    Generate meditation insights and recommendations based on this data.
    `;

    // Use Hugging Face text generation for insights
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: context,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );

    let aiInsights = [];
    
    if (response.ok) {
      const data = await response.json();
      console.log('AI insights generated:', data);
      
      // Parse AI response into structured insights
      const aiText = data[0]?.generated_text || '';
      aiInsights = parseAIInsights(aiText, biometricData);
    }

    // Combine AI insights with rule-based insights
    const ruleBasedInsights = generateRuleBasedInsights(biometricData);
    const combinedInsights = [...aiInsights, ...ruleBasedInsights];

    const result = {
      insights: combinedInsights.slice(0, 5), // Limit to 5 insights
      adaptationScore: calculateAdaptationScore(biometricData),
      recommendation: generateRecommendation(biometricData),
      environmentSettings: generateEnvironmentSettings(biometricData)
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI insights error:', error);
    
    // Fallback to rule-based insights
    const fallbackInsights = generateRuleBasedInsights(req.json().biometricData || {});
    return new Response(JSON.stringify({
      insights: fallbackInsights,
      adaptationScore: 75,
      recommendation: "Continue with your current meditation practice.",
      environmentSettings: { sound: 50, temperature: 50, brightness: 50, vibration: 50, light: 50 }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateRuleBasedInsights(data: any) {
  const insights = [];
  
  // Face analysis insights
  if (data.face?.emotion === 'stressed') {
    insights.push({
      message: 'High stress detected in facial expression. Consider deep breathing exercises.',
      type: 'suggestion'
    });
  }
  
  if (data.face?.attentionLevel < 60) {
    insights.push({
      message: 'Attention seems scattered. Adjusting environment to improve focus.',
      type: 'info'
    });
  }

  // Voice analysis insights  
  if (data.voice?.tone === 'stressed' && data.voice?.volume > 70) {
    insights.push({
      message: 'Voice patterns indicate tension. Try lowering your speaking volume.',
      type: 'suggestion'
    });
  }

  // Wearable insights
  if (data.wearable?.heartRate > 90) {
    insights.push({
      message: 'Elevated heart rate detected. Calming meditation recommended.',
      type: 'alert'
    });
  }

  if (data.wearable?.energyLevel === 'low') {
    insights.push({
      message: 'Low energy detected. Consider an energizing breathing session.',
      type: 'suggestion'
    });
  }

  // Positive reinforcement
  if (data.face?.emotion === 'relaxed' && data.voice?.tone === 'calm') {
    insights.push({
      message: 'Excellent relaxation state achieved. Maintaining current settings.',
      type: 'info'
    });
  }

  return insights.slice(0, 3);
}

function parseAIInsights(aiText: string, biometricData: any) {
  // Simple parsing of AI-generated insights
  const sentences = aiText.split('.').filter(s => s.trim().length > 10);
  return sentences.slice(0, 2).map(sentence => ({
    message: sentence.trim() + '.',
    type: 'suggestion'
  }));
}

function calculateAdaptationScore(data: any): number {
  let score = 50;
  
  // Face metrics contribution
  if (data.face?.emotion === 'relaxed') score += 15;
  else if (data.face?.emotion === 'stressed') score -= 10;
  
  if (data.face?.attentionLevel > 80) score += 10;
  else if (data.face?.attentionLevel < 50) score -= 10;

  // Voice metrics contribution  
  if (data.voice?.tone === 'calm') score += 10;
  else if (data.voice?.tone === 'stressed') score -= 10;
  
  if (data.voice?.clarity > 80) score += 5;

  // Wearable metrics contribution
  if (data.wearable?.heartRate >= 60 && data.wearable?.heartRate <= 80) score += 15;
  else if (data.wearable?.heartRate > 90) score -= 15;

  if (data.wearable?.energyLevel === 'high') score += 10;
  else if (data.wearable?.energyLevel === 'low') score -= 5;

  return Math.min(100, Math.max(0, score));
}

function generateRecommendation(data: any): string {
  if (data.face?.emotion === 'stressed' || data.voice?.tone === 'stressed') {
    return "Your biometrics indicate elevated stress levels. A calming meditation session with reduced stimuli is recommended.";
  }
  
  if (data.face?.attentionLevel < 50) {
    return "Attention metrics show distraction. A focused mindfulness session would be beneficial.";
  }
  
  if (data.wearable?.energyLevel === 'low') {
    return "Low energy detected. An energizing breathing session may help restore vitality.";
  }
  
  return "Your metrics are well-balanced. Continue with your current meditation practice for optimal results.";
}

function generateEnvironmentSettings(data: any) {
  const settings = { sound: 50, temperature: 50, brightness: 50, vibration: 50, light: 50 };
  
  // Adjust based on stress levels
  if (data.face?.emotion === 'stressed' || data.voice?.tone === 'stressed') {
    settings.sound = Math.max(30, settings.sound - 20);
    settings.brightness = Math.max(30, settings.brightness - 20);
    settings.vibration = Math.max(20, settings.vibration - 30);
  }
  
  // Adjust based on attention
  if (data.face?.attentionLevel < 60) {
    settings.light = Math.min(80, settings.light + 20);
    settings.brightness = Math.min(70, settings.brightness + 15);
  }
  
  // Adjust based on energy
  if (data.wearable?.energyLevel === 'low') {
    settings.brightness = Math.min(80, settings.brightness + 30);
    settings.vibration = Math.min(70, settings.vibration + 20);
  }
  
  return settings;
}
