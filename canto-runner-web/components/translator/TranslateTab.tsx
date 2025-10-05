import React from 'react';
import { Mic, Copy, Star, Download, Check } from 'lucide-react';

interface TranslateTabProps {
  transcribedText: string;
  setTranscribedText: (text: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  isTranslating: boolean; // NEW: Separate translation loading state
  translation: any;
  copied: boolean;
  darkMode: boolean;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  startRecording: () => void;
  stopRecording: () => void;
  translateText: () => void;
  copyToClipboard: (text: string) => void;
  toggleFavorite: (id: number) => void;
}

export default function TranslateTab({
  transcribedText,
  setTranscribedText,
  isRecording,
  isProcessing,
  isTranslating, // NEW: Use this for translation button state
  translation,
  copied,
  darkMode,
  cardBg,
  textColor,
  mutedColor,
  borderColor,
  startRecording,
  stopRecording,
  translateText,
  copyToClipboard,
  toggleFavorite
}: TranslateTabProps) {
  const exportTranslation = () => {
    if (!translation) return;
    
    const content = `# Translation\n\n**Original:** ${translation.original}\n\n**Translated:** ${translation.translated}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className={`${cardBg} rounded-2xl shadow-lg p-6 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Voice Input</h2>
          <div className="flex space-x-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`p-2 rounded-lg transition-all ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTranscribedText('')}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
            >
              Clear
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="mb-4 text-center">
            <p className={`${mutedColor} animate-pulse`}>
              {isRecording ? 'Recording...' : 'Processing audio...'}
            </p>
          </div>
        )}
        
        <textarea
          value={transcribedText}
          onChange={(e) => setTranscribedText(e.target.value)}
          className={`w-full h-64 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none ${textColor} transition-colors`}
          placeholder="Speak or type your text here..."
        />
        
        <button
          onClick={translateText}
          disabled={!transcribedText.trim() || isTranslating || transcribedText.includes("failed")}
          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isTranslating ? 'Translating...' : 'Translate ✨'}
        </button>
      </div>

      {/* Output Section */}
      <div className={`${cardBg} rounded-2xl shadow-lg p-6 border ${borderColor}`}>
        {translation ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Translation</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFavorite(translation.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      translation.favorite 
                        ? 'text-yellow-500' 
                        : mutedColor
                    } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <Star className="w-5 h-5" fill={translation.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => copyToClipboard(translation.translated)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={exportTranslation}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-lg`}>
                {translation.translated}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎤</span>
              </div>
              <p className={mutedColor}>
                {isTranslating ? 'Translating...' : 'Record or type, then click translate'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}