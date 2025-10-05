import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateSpeech } from "./elevenlabs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function translateToCantonese(englishText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Translate the following English text to Cantonese (include both Chinese characters and jyutping romanization):
    English: "${englishText}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Translation Error:', error);
    throw error;
  }
}

export async function translateAndSpeak(englishText: string, voiceId: string) {
  try {
    const translation = await translateToCantonese(englishText);
    const audio = await generateSpeech(translation, voiceId);
    return {
      translation,
      audio
    };
  } catch (error) {
    console.error('Translation and Speech Error:', error);
    throw error;
  }
}