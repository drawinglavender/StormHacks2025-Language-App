"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Copy, Star, Download, History, BookOpen, Sun, Moon, Check, ArrowLeft } from 'lucide-react';
import { speechToText } from "../../utils/elevenlabs";
import { translateToCantonese } from "../../utils/translator";
// Fixed paths - go up 2 levels from app/translate/ to root, then into components/translator/
import TranslateTab from "../../components/translator/TranslateTab";
import HistoryTab from "../../components/translator/HistoryTab";
import FlashcardsTab from "../../components/translator/FlashcardsTab";
import SettingsTab from "../../components/translator/SettingsTab";

const brand = {
    lightBlue: '#639BFF',
    midBlue: '#326BD0',
    deepBlue: '#12387D',
    white: '#FFFFFF',
  };
  
export default function TranslatePage() {
  // Core state - KEEP THESE
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false); // NEW: separate state for translation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // UI state for styling only
  const [activeTab, setActiveTab] = useState('translate');
  const [translation, setTranslation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({
    showJyutping: true,
    alternativeCount: 3,
    speechLanguage: 'cantonese',
    audioQuality: 'standard'
  });
  const [copied, setCopied] = useState(false);

  // Recording functions - KEEP THESE
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: settings.audioQuality === 'high' ? 48000 : 24000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setTranscribedText("Recording failed: " + errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });

        setIsProcessing(true);
        try {
          const text = await speechToText(audioBlob);
          setTranscribedText(text);
          // REMOVED: Auto-translation - now user must click translate button
        } catch (error) {
          console.error("Transcription failed:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          setTranscribedText("Transcription failed: " + errorMessage);
        } finally {
          setIsProcessing(false);
        }

        if (mediaRecorderRef.current?.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // REMOVED: Auto-translate useEffect - now manual only
  // useEffect(() => {
  //   if (transcribedText && transcribedText.trim() && !transcribedText.includes("failed")) {
  //     translateText();
  //   }
  // }, [transcribedText]);

  // Translation function - MODIFIED: Now only runs when button is clicked
  const translateText = async () => {
    if (!transcribedText.trim() || transcribedText.includes("failed")) return;

    setIsTranslating(true); // Use separate translation loading state
    try {
      const translatedText = await translateToCantonese(transcribedText);
      
      const newTranslation = {
        id: Date.now(),
        original: transcribedText,
        translated: translatedText,
        timestamp: new Date().toISOString(),
        vocabulary: [],
        alternatives: [],
        favorite: false,
        tags: []
      };

      setTranslation(newTranslation);
      setHistory(prev => [newTranslation, ...prev]);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslation({
        id: Date.now(),
        original: transcribedText,
        translated: "Translation failed. Please try again.",
        timestamp: new Date().toISOString(),
        vocabulary: [],
        alternatives: [],
        favorite: false,
        tags: []
      });
    } finally {
      setIsTranslating(false); // Reset translation loading state
    }
  };

  // Audio playback function
  const playAudio = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      
      // Filter to only Chinese characters (removes jyutping, parentheses, etc.)
      const chineseOnly = text.replace(/\([^)]*\)/g, '') // Remove anything in parentheses
                            .replace(/[a-zA-Z0-9\s\-_]/g, '') // Remove Latin letters, numbers, spaces, dashes
                            .trim();
      
      console.log('Original text:', text);
      console.log('Playing Mandarin audio for Chinese only:', chineseOnly);
      
      if (!chineseOnly) {
        console.log('No Chinese characters found to read');
        setIsPlayingAudio(false);
        return;
      }
      
      // Use a Chinese-optimized voice ID
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/onwK4e9ZLuTAKqWW03F9', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
        },
        body: JSON.stringify({
          text: chineseOnly, // Only send Chinese characters
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error('ElevenLabs TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      await audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlayingAudio(false);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlayingAudio(false);
      };
      
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlayingAudio(false);
    }
  };

  // UI helper functions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (id: number) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
    if (translation?.id === id) {
      setTranslation((prev: any) => ({ ...prev, favorite: !prev.favorite }));
    }
  };

  // Keyboard shortcuts handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Space bar for recording
    if (event.code === 'Space' && event.target === document.body) {
      event.preventDefault();
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
    
    // Ctrl + L to clear text
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      setTranscribedText('');
    }
    
    // Ctrl + C to copy translation
    if (event.ctrlKey && event.key === 'c' && translation) {
      event.preventDefault();
      copyToClipboard(translation.translated);
    }
  }, [isRecording, stopRecording, startRecording, translation, copyToClipboard]);

  // Add useEffect for keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Data management functions
  const exportHistory = () => {
    if (history.length === 0) {
      alert('No history to export');
      return;
    }
    
    const historyData = {
      exportDate: new Date().toISOString(),
      translations: history.map(item => ({
        original: item.original,
        translated: item.translated,
        timestamp: item.timestamp,
        favorite: item.favorite
      }))
    };
    
    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cantonese-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([]);
      setTranslation(null);
      alert('History cleared successfully');
    }
  };

  // Theme classes
// Theme classes 
const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50'; const cardBg = darkMode ? 'bg-gray-800' : 'bg-white'; const textColor = darkMode ? 'text-gray-100' : 'text-gray-900'; const mutedColor = darkMode ? 'text-gray-400' : 'text-gray-600'; const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardBg} border-b ${borderColor} sticky top-0 z-50 backdrop-blur-lg bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#639BFF] to-[#326BD0] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">NL</span>
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#639BFF] to-[#326BD0] bg-clip-text text-transparent">
            NativeLeap
            </h1>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {['translate', 'saved', 'flashcards', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-all ${
                activeTab === tab
                    ? `border-b-2 ${
                        darkMode
                            ? 'border-[#639BFF] text-[#639BFF]'
                            : 'border-[#326BD0] text-[#326BD0]'
                        }`
                    : mutedColor
                      
                }`}
              >
                {tab === 'translate' && 'Translate'}
                {tab === 'saved' && 'History'}
                {tab === 'flashcards' && 'Flashcards'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'translate' && (
          <TranslateTab
            transcribedText={transcribedText}
            setTranscribedText={setTranscribedText}
            isRecording={isRecording}
            isProcessing={isProcessing}
            isTranslating={isTranslating} // NEW: Pass separate translation state
            translation={translation}
            copied={copied}
            darkMode={darkMode}
            cardBg={cardBg}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
            startRecording={startRecording}
            stopRecording={stopRecording}
            translateText={translateText}
            copyToClipboard={copyToClipboard}
            toggleFavorite={toggleFavorite}
            playAudio={playAudio} // ADD THIS
            isPlayingAudio={isPlayingAudio} // ADD THIS
          />
        )}

        {activeTab === 'saved' && (
          <HistoryTab
            history={history}
            darkMode={darkMode}
            cardBg={cardBg}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
            toggleFavorite={toggleFavorite}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsTab
            flashcards={flashcards}
            settings={settings}
            darkMode={darkMode}
            cardBg={cardBg}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
            darkMode={darkMode}
            cardBg={cardBg}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
            exportHistory={exportHistory}
            clearHistory={clearHistory}
          />
        )}

        {/* Back Button - ADD THIS */}
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => window.location.href = '/'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-[#639BFF] border border-gray-600 hover:border-[#639BFF]' 
                : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-[#326BD0] border border-gray-200 hover:border-[#326BD0]'
            } hover:shadow-xl hover:scale-105`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>
      </main>
    </div>
  );
}
