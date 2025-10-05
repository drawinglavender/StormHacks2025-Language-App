import { GoogleGenAI } from "@google/genai";

// Get API key from environment
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not set in environment variables");
}

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey });

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });
    
    // Add null checking and fallbacks
    if (response.text) {
      return response.text;
    }
    
    // If response.text is undefined, try other possible structures
    if ((response as any).candidates?.[0]?.content?.parts?.[0]?.text) {
      return (response as any).candidates[0].content.parts[0].text;
    }
    
    // If still no text, log the response structure for debugging
    console.log("Unexpected response structure:", JSON.stringify(response, null, 2));
    throw new Error("No text content found in response");
    
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

// Keep the old export name for compatibility
export { generateText as getGeminiResponse };