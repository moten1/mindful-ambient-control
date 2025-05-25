
import { useState, useCallback } from 'react';
import { useTensorFlowBiometrics } from './useTensorFlowBiometrics';

export const useRealBiometrics = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const tensorFlow = useTensorFlowBiometrics();

  const analyzeFaceData = useCallback(async (imageData: string) => {
    try {
      setIsProcessing(true);
      const result = await tensorFlow.analyzeFaceData(imageData);
      return result;
    } catch (error) {
      console.error('TensorFlow face analysis error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [tensorFlow]);

  const analyzeVoiceData = useCallback(async (audioData: string, frequencyData: number[]) => {
    try {
      setIsProcessing(true);
      const result = await tensorFlow.analyzeVoiceData(audioData, frequencyData);
      return result;
    } catch (error) {
      console.error('TensorFlow voice analysis error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [tensorFlow]);

  const generateAIInsights = useCallback(async (biometricData: any, sessionHistory?: any) => {
    try {
      setIsProcessing(true);
      const result = await tensorFlow.generateAIInsights(biometricData);
      return result;
    } catch (error) {
      console.error('TensorFlow AI insights error:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [tensorFlow]);

  return {
    analyzeFaceData,
    analyzeVoiceData,
    generateAIInsights,
    isProcessing: isProcessing || tensorFlow.isProcessing,
    isModelLoaded: tensorFlow.isModelLoaded,
    initializeModels: tensorFlow.initializeModels
  };
};
