import React from 'react';

interface SettingsTabProps {
  settings: {
    showJyutping: boolean;
    alternativeCount: number;
    speechLanguage: string;
  };
  setSettings: (settings: any) => void;
  darkMode: boolean;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export default function SettingsTab({
  settings,
  setSettings,
  darkMode,
  cardBg,
  textColor,
  mutedColor,
  borderColor
}: SettingsTabProps) {
  return (
    <div className={`${cardBg} rounded-2xl shadow-lg p-6 border ${borderColor} max-w-2xl mx-auto`}>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* Jyutping Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Display Jyutping</h3>
            <p className={`text-sm ${mutedColor}`}>Show romanization for Cantonese characters</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showJyutping}
              onChange={(e) => setSettings({...settings, showJyutping: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Alternative Count Slider */}
        <div>
          <h3 className="font-semibold mb-2">Alternative Suggestions</h3>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.alternativeCount}
            onChange={(e) => setSettings({...settings, alternativeCount: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
          />
          <p className={`text-sm ${mutedColor} mt-1`}>Show {settings.alternativeCount} alternative phrasings</p>
        </div>

        {/* Speech Language Selector */}
        <div>
          <h3 className="font-semibold mb-2">Speech Language</h3>
          <select
            value={settings.speechLanguage}
            onChange={(e) => setSettings({...settings, speechLanguage: e.target.value})}
            className={`w-full p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${textColor} border ${borderColor}`}
          >
            <option value="cantonese">Cantonese (粵語)</option>
            <option value="mandarin">Mandarin (普通話)</option>
            <option value="english">English</option>
          </select>
          <p className={`text-sm ${mutedColor} mt-1`}>Language for voice input recognition</p>
        </div>

        {/* Audio Quality Settings */}
        <div>
          <h3 className="font-semibold mb-2">Audio Quality</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="audioQuality"
                value="standard"
                defaultChecked
                className="mr-2 text-blue-500"
              />
              <span>Standard Quality (faster processing)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="audioQuality"
                value="high"
                className="mr-2 text-blue-500"
              />
              <span>High Quality (better accuracy)</span>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
          <h3 className="font-semibold mb-4">Data Management</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <button
              className={`py-2 px-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}
            >
              📥 Export History
            </button>
            <button
              className={`py-2 px-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}
            >
              🗑️ Clear History
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
          <h3 className="font-semibold mb-4">About</h3>
          <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <p className={`text-sm ${mutedColor} leading-relaxed mb-3`}>
              This Cantonese translator uses ElevenLabs for speech-to-text and Gemini AI for translation. 
              Record your voice to get instant Cantonese translations with vocabulary extraction.
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className={mutedColor}>Version 1.0.0</span>
              <span className={mutedColor}>Made with ❤️ for language learners</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
          <h3 className="font-semibold mb-4">Keyboard Shortcuts</h3>
          <div className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg space-y-2`}>
            <div className="flex justify-between">
              <span className={`text-sm ${mutedColor}`}>Start/Stop Recording</span>
              <kbd className={`px-2 py-1 text-xs ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded`}>Space</kbd>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${mutedColor}`}>Clear Text</span>
              <kbd className={`px-2 py-1 text-xs ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded`}>Ctrl + L</kbd>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${mutedColor}`}>Copy Translation</span>
              <kbd className={`px-2 py-1 text-xs ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded`}>Ctrl + C</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}