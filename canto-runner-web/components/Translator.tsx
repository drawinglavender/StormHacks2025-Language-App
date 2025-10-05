import { useState } from 'react';
import { translateAndSpeak } from '../utils/translator';

export default function Translator() {
  const [englishText, setEnglishText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!englishText) return;
    
    setIsLoading(true);
    try {
      const result = await translateAndSpeak(englishText, 'your-voice-id');
      setTranslation(result.translation);
      
      // Play the audio
      const audioBlob = new Blob([result.audio], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="english" className="block text-sm font-medium">
          English Text
        </label>
        <input
          id="english"
          type="text"
          value={englishText}
          onChange={(e) => setEnglishText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="Enter English text..."
        />
      </div>

      <button
        onClick={handleTranslate}
        disabled={isLoading || !englishText}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        {isLoading ? 'Translating...' : 'Translate to Cantonese'}
      </button>

      {translation && (
        <div className="mt-4">
          <h3 className="font-medium">Translation:</h3>
          <p className="mt-1">{translation}</p>
        </div>
      )}
    </div>
  );
}