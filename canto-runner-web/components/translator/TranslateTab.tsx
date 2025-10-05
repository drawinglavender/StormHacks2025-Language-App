import React from 'react';
import { Mic, Copy, Star, Download, Check, Volume2 } from 'lucide-react';

function parseTranslationOutput(text: string) {
  const sections = {
    translation: { chinese: '', jyutping: '' },
    keyWords: [] as Array<{ word: string; pronunciation: string; meaning: string }>,
    alternatives: [] as Array<{ type: string; chinese: string; jyutping: string }>
  };

  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section headers
    if (line === 'Translation' || line.startsWith('## Translation')) {
      currentSection = 'translation';
      continue;
    }
    if (line === 'Key Cantonese Words' || line.startsWith('## Key Cantonese Words')) {
      currentSection = 'keyWords';
      continue;
    }
    if (line === 'Alternative Expressions' || line.startsWith('## Alternative Expressions')) {
      currentSection = 'alternatives';
      continue;
    }

    // Parse translation section
    if (currentSection === 'translation') {
      if (line.startsWith('**Chinese:**')) {
        sections.translation.chinese = line.replace('**Chinese:**', '').trim();
      } else if (line.startsWith('**Jyutping:**')) {
        sections.translation.jyutping = line.replace('**Jyutping:**', '').trim();
      }
    }
    
    // Parse key words
    else if (currentSection === 'keyWords' && line.startsWith('•')) {
      const match = line.match(/• \*\*(.+?) \((.+?)\)\*\* - (.+)/);
      if (match) {
        sections.keyWords.push({
          word: match[1].trim(),
          pronunciation: match[2].trim(),
          meaning: match[3].trim()
        });
      }
    }
    
    // Parse alternatives
    else if (currentSection === 'alternatives') {
      if (line.match(/^\d+\.|###\s+\d+\./)) {
        const typeMatch = line.match(/(?:\d+\.\s+|###\s+\d+\.\s+)(.+)/);
        if (typeMatch && i + 2 < lines.length) {
          const chineseLine = lines[i + 1];
          const jyutpingLine = lines[i + 2];
          
          if (chineseLine.startsWith('**Chinese:**') && jyutpingLine.startsWith('**Jyutping:**')) {
            sections.alternatives.push({
              type: typeMatch[1].trim(),
              chinese: chineseLine.replace('**Chinese:**', '').trim(),
              jyutping: jyutpingLine.replace('**Jyutping:**', '').trim()
            });
          }
        }
      }
    }
  }

  return sections;
}

interface TranslateTabProps {
  transcribedText: string;
  setTranscribedText: (text: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  isTranslating: boolean;
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
  playAudio: (text: string) => Promise<void>;
  isPlayingAudio: boolean;
}

export default function TranslateTab({
  transcribedText,
  setTranscribedText,
  isRecording,
  isProcessing,
  isTranslating,
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
  toggleFavorite,
  playAudio,
  isPlayingAudio
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
      <div className={`${cardBg} rounded-2xl shadow-lg p-6 border ${borderColor} overflow-y-auto max-h-[600px]`}>
        {translation ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Analysis</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleFavorite(translation.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    translation.favorite 
                      ? 'text-yellow-500' 
                      : mutedColor
                  } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  title="Add to favorites"
                >
                  <Star className="w-5 h-5" fill={translation.favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => copyToClipboard(translation.translated)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                  title="Copy full analysis"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  onClick={exportTranslation}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                  title="Export as Markdown"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {(() => {
              const parsed = parseTranslationOutput(translation.translated);
              return (
                <div className="space-y-6">
                  
                  {/* Translation Card */}
                  {parsed.translation.chinese && (
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">Translation</h3>
                        <button
                          onClick={() => playAudio(parsed.translation.chinese)}
                          disabled={isPlayingAudio}
                          className={`p-2 rounded-lg transition-colors ${
                            isPlayingAudio 
                              ? 'text-blue-500 animate-pulse' 
                              : mutedColor
                          } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} disabled:cursor-not-allowed`}
                          title="Play Mandarin pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">{parsed.translation.chinese}</p>
                        {parsed.translation.jyutping && (
                          <p className={`${mutedColor} text-base`}>{parsed.translation.jyutping}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Words Card */}
                  {parsed.keyWords.length > 0 && (
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <h3 className="font-medium text-sm mb-3">Key Words</h3>
                      <div className="space-y-3">
                        {parsed.keyWords.map((word, index) => (
                          <div key={index} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-baseline gap-2">
                                <span className="font-medium text-base">{word.word}</span>
                                <span className={`${mutedColor} text-sm`}>({word.pronunciation})</span>
                              </div>
                              <button
                                onClick={() => playAudio(word.word)}
                                disabled={isPlayingAudio}
                                className={`p-1 rounded transition-colors ${
                                  isPlayingAudio 
                                    ? 'text-blue-500 animate-pulse' 
                                    : mutedColor
                                } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} disabled:cursor-not-allowed`}
                                title="Play Mandarin pronunciation"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className={`text-sm ${mutedColor}`}>{word.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternative Expressions Card */}
                  {parsed.alternatives.length > 0 && (
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <h3 className="font-medium text-sm mb-3">Alternatives</h3>
                      <div className="space-y-4">
                        {parsed.alternatives.map((alt, index) => (
                          <div key={index} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                            <h4 className="font-medium text-sm mb-2">{alt.type}</h4>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-base font-medium">{alt.chinese}</p>
                              <button
                                onClick={() => playAudio(alt.chinese)}
                                disabled={isPlayingAudio}
                                className={`p-1 rounded transition-colors ${
                                  isPlayingAudio 
                                    ? 'text-blue-500 animate-pulse' 
                                    : mutedColor
                                } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} disabled:cursor-not-allowed`}
                                title="Play Mandarin pronunciation"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className={`${mutedColor} text-sm`}>{alt.jyutping}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <p className={mutedColor}>
                {isTranslating ? 'Translating...' : 'Enter text to translate'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}