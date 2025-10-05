"use client";

import { useState } from "react";

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);

    try {
      // Replace this with your actual Eleven Labs API call
      const fakeTranslated = `🈶 Translation of: "${inputText}"`;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API latency
      setTranslatedText(fakeTranslated);
    } catch (error) {
      setTranslatedText("❌ Translation failed. Try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">Chinglish Translator</h1>

      <textarea
        className="w-full max-w-lg h-32 border border-gray-300 rounded p-3 mb-4"
        placeholder="Enter Chinglish here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        onClick={handleTranslate}
        disabled={isTranslating || inputText.trim() === ""}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded disabled:opacity-50 mb-4"
      >
        {isTranslating ? "Translating..." : "Translate"}
      </button>

      {translatedText && (
        <div className="w-full max-w-lg bg-gray-100 border border-gray-300 rounded p-4 text-left">
          <h2 className="font-semibold mb-2">Translated Output:</h2>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
}
