import React from 'react';
import { BookOpen } from 'lucide-react';

interface FlashcardsTabProps {
  flashcards: any[];
  settings: {
    showJyutping: boolean;
    alternativeCount: number;
    speechLanguage: string;
  };
  darkMode: boolean;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export default function FlashcardsTab({
  flashcards,
  settings,
  darkMode,
  cardBg,
  textColor,
  mutedColor,
  borderColor
}: FlashcardsTabProps) {
  return (
    <div className={`${cardBg} rounded-2xl shadow-lg p-6 border ${borderColor}`}>
      <h2 className="text-2xl font-bold mb-6">Vocabulary Flashcards</h2>
      
      {flashcards.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className={`w-16 h-16 mx-auto mb-4 ${mutedColor}`} />
          <p className={mutedColor}>No flashcards saved yet</p>
          <p className={`text-sm ${mutedColor} mt-2`}>
            Vocabulary extraction coming soon! This feature will automatically create flashcards from your translations.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((card) => (
            <div key={card.id} className={`p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-center hover:shadow-md transition-shadow`}>
              <p className="text-3xl font-bold mb-2">{card.cantonese}</p>
              {settings.showJyutping && card.jyutping && (
                <p className={`text-sm ${mutedColor} mb-3`}>{card.jyutping}</p>
              )}
              <p className="text-lg text-blue-500 font-medium">{card.english}</p>
              {card.example && (
                <p className={`text-sm ${mutedColor} mt-2 italic`}>"{card.example}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Study Mode Section */}
      <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-4">Study Options</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            disabled={flashcards.length === 0}
            className="py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Study Mode
          </button>
          <button
            disabled={flashcards.length === 0}
            className="py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Quiz Mode
          </button>
        </div>
        <p className={`text-sm ${mutedColor} mt-2 text-center`}>
          {flashcards.length === 0 
            ? "Add some flashcards to start studying!" 
            : `Ready to study ${flashcards.length} flashcard${flashcards.length === 1 ? '' : 's'}`
          }
        </p>
      </div>
    </div>
  );
}