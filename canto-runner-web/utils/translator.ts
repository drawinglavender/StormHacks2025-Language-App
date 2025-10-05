import { generateText } from "./gemini";

export async function translateToCantonese(text: string): Promise<string> {
  const prompt = `Translate the following text to Cantonese (Traditional Chinese). ` +
    `The input text may contain multiple languages mixed together. ` +
    `Translate all content into natural, conversational Hong Kong-style Cantonese. ` +
    `Use Traditional Chinese characters only in the first line. ` +
    `Include Jyutping romanization below line of Chinese character text. ` +
    `Preserve the original meaning and context. ` +
    `Return only the Cantonese translation with Jyutping (not ping yin), nothing else: "${text}"`;
  
  try {
    const translation = await generateText(prompt);
    return translation.trim();
  } catch (error) {
    console.error("Translation failed:", error);
    throw new Error("Translation service unavailable");
  }
}