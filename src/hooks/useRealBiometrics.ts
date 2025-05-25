
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealBiometrics = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeFaceData = useCallback(async (imageData: string) => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('face-analysis', {
        body: { imageData }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Face analysis error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const analyzeVoiceData = useCallback(async (audioData: string, frequencyData: number[]) => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('voice-analysis', {
        body: { audioData, frequencyData }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Voice analysis error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateAIInsights = useCallback(async (biometricData: any, sessionHistory?: any) => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { biometricData, sessionHistory }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AI insights error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    analyzeFaceData,
    analyzeVoiceData,
    generateAIInsights,
    isProcessing
  };
};
