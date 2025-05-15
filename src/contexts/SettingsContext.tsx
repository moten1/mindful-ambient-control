
import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultVoice, ElevenLabsVoice } from '@/utils/elevenlabs';

interface SettingsContextType {
  elevenLabsApiKey: string;
  setElevenLabsApiKey: (key: string) => void;
  selectedVoice: ElevenLabsVoice;
  setSelectedVoice: (voice: ElevenLabsVoice) => void;
  narrationEnabled: boolean;
  setNarrationEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage on component mount
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => {
    const saved = localStorage.getItem('elevenlabs-api-key');
    return saved || '';
  });
  
  const [selectedVoice, setSelectedVoice] = useState<ElevenLabsVoice>(() => {
    const saved = localStorage.getItem('elevenlabs-voice');
    return saved ? JSON.parse(saved) : defaultVoice;
  });
  
  const [narrationEnabled, setNarrationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('narration-enabled');
    return saved ? JSON.parse(saved) : true;
  });
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('elevenlabs-api-key', elevenLabsApiKey);
  }, [elevenLabsApiKey]);
  
  useEffect(() => {
    localStorage.setItem('elevenlabs-voice', JSON.stringify(selectedVoice));
  }, [selectedVoice]);
  
  useEffect(() => {
    localStorage.setItem('narration-enabled', JSON.stringify(narrationEnabled));
  }, [narrationEnabled]);
  
  return (
    <SettingsContext.Provider value={{
      elevenLabsApiKey,
      setElevenLabsApiKey,
      selectedVoice,
      setSelectedVoice,
      narrationEnabled,
      setNarrationEnabled,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
