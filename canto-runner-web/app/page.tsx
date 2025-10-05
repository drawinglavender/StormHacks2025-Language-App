"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sun, Moon } from 'lucide-react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false); // Default to light mode

  // Theme classes matching translate page
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      {/* Header with NL logo and toggle */}
      <header className={`${cardBg} border-b ${borderColor} p-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
      </header>

      {/* Main content */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className={`${cardBg} border ${borderColor} rounded-3xl shadow-xl p-10 max-w-2xl w-full text-center`}>
          {/* Logo/Icon - Updated to match header colors */}
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#639BFF] to-[#326BD0] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">NL</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#639BFF] to-[#326BD0] bg-clip-text text-transparent">
            Native Leap
          </h1>
          
          {/* Subtitle */}
          <p className={`text-lg ${mutedColor} mb-8 leading-relaxed`}>
            Master Cantonese through interactive games, smart flashcards, and real-time translation with voice recognition.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/translate">
              <button className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-base h-12 px-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                Start Learning
              </button>
            </Link>
            <Link href="/game">
              <button className={`w-full sm:w-auto rounded-xl ${cardBg} border-2 ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 ${textColor} font-semibold text-base h-12 px-8 transition-all duration-300 hover:shadow-lg`}>
                Play Games
              </button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <h3 className={`font-semibold ${textColor} mb-2`}>Voice Recognition</h3>
              <p className={`text-sm ${mutedColor}`}>Speak naturally and get instant translations</p>
            </div>
            <div className="p-4">
              <h3 className={`font-semibold ${textColor} mb-2`}>Smart Flashcards</h3>
              <p className={`text-sm ${mutedColor}`}>Learn vocabulary with spaced repetition</p>
            </div>
            <div className="p-4">
              <h3 className={`font-semibent ${textColor} mb-2`}>Interactive Games</h3>
              <p className={`text-sm ${mutedColor}`}>Practice through fun mini-games</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

