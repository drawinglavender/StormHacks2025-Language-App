import React from 'react';
import { History, Star } from 'lucide-react';

interface HistoryTabProps {
  history: any[];
  darkMode: boolean;
  cardBg: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  toggleFavorite: (id: number) => void;
}

export default function HistoryTab({
  history,
  darkMode,
  cardBg,
  textColor,
  mutedColor,
  borderColor,
  toggleFavorite
}: HistoryTabProps) {
  return (
    <div className={`${cardBg} rounded-2xl shadow-lg p-6 border ${borderColor}`}>
      <h2 className="text-2xl font-bold mb-6">Translation History</h2>
      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className={`w-16 h-16 mx-auto mb-4 ${mutedColor}`} />
          <p className={mutedColor}>No translations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className={`text-sm ${mutedColor} mb-1`}>
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  <p className="font-medium mb-2">{item.original}</p>
                  <p className={mutedColor}>{item.translated}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`ml-2 p-2 rounded-lg ${item.favorite ? 'text-yellow-500' : mutedColor} hover:bg-gray-600 transition-colors`}
                >
                  <Star className="w-5 h-5" fill={item.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}