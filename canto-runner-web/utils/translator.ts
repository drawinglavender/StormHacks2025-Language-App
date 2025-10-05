import { generateText } from "./gemini";

export async function translateToCantonese(text: string): Promise<string> {
  const prompt = `You are a Cantonese-English translation assistant.

Here is a sentence that may be written in a mix of Cantonese, English, and other languages (Chinglish):
"${text}"

Your tasks:
1. Translate the sentence into fluent, natural Hong Kong-style Cantonese
2. Provide Traditional Chinese characters and Jyutping romanization
3. List key Cantonese words/particles used and explain their meanings
4. Suggest 2-3 alternative ways to say the sentence in Cantonese (formal, casual, playful)

Format your response exactly like this with proper spacing and clear sections:

## Translation
**Chinese:** [Traditional Chinese characters]
**Jyutping:** [jyutping romanization]

## Key Cantonese Words
• **[word]** - [meaning/explanation]
• **[word]** - [meaning/explanation]
• **[word]** - [meaning/explanation]

## Alternative Expressions

### 1. Formal
**Chinese:** [formal version in characters]
**Jyutping:** [formal jyutping]

### 2. Casual  
**Chinese:** [casual version in characters]
**Jyutping:** [casual jyutping]

### 3. Playful
**Chinese:** [playful version in characters]  
**Jyutping:** [playful jyutping]

Cantonese words may be in characters, Jyutping, or informal English spelling. Use your best judgment to interpret them.`;
  
  try {
    const translation = await generateText(prompt);
    return translation.trim();
  } catch (error) {
    console.error("Translation failed:", error);
    throw new Error("Translation service unavailable");
  }
}

// Simple translation function for TTS (Chinese characters only)
export async function translateToCantoneseSimple(text: string): Promise<string> {
  const prompt = `Translate the following text to Cantonese (Traditional Chinese). ` +
    `The input text may contain multiple languages mixed together. ` +
    `Translate all content into natural, conversational Hong Kong-style Cantonese. ` +
    `Use Traditional Chinese characters only. ` +
    `Return only the Chinese characters, no romanization or explanation needed. ` +
    `Preserve the original meaning and context. ` +
    `Text to translate: "${text}"`;
  
  try {
    const translation = await generateText(prompt);
    return translation.trim();
  } catch (error) {
    console.error("Simple translation failed:", error);
    throw new Error("Translation service unavailable");
  }
}

// Function to extract just Chinese characters from detailed translation
export function extractChineseFromDetailed(detailedTranslation: string): string {
  // Look for Chinese text after "**Chinese:**" 
  const chineseMatch = detailedTranslation.match(/\*\*Chinese:\*\*\s*([^\n]+)/);
  if (chineseMatch && chineseMatch[1]) {
    // Extract only Chinese characters from that line
    const chineseChars = chineseMatch[1].match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
    if (chineseChars) {
      return chineseChars.join('');
    }
  }
  
  // Fallback: Look for the first line after "## Translation"
  const translationMatch = detailedTranslation.match(/## Translation\s*\n\*\*Chinese:\*\*\s*([^\n]+)/);
  if (translationMatch && translationMatch[1]) {
    const chineseChars = translationMatch[1].match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
    if (chineseChars) {
      return chineseChars.join('');
    }
  }
  
  // Final fallback: extract all Chinese characters from the response
  const allChineseChars = detailedTranslation.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  return allChineseChars ? allChineseChars.join('') : detailedTranslation;
}

// Helper function to parse the formatted translation for display
export function parseFormattedTranslation(text: string) {
  const sections = {
    translation: { chinese: '', jyutping: '' },
    keyWords: [] as Array<{ word: string; meaning: string }>,
    alternatives: [] as Array<{ type: string; chinese: string; jyutping: string }>
  };

  // Extract main translation
  const chineseMatch = text.match(/## Translation\s*\n\*\*Chinese:\*\*\s*([^\n]+)\s*\n\*\*Jyutping:\*\*\s*([^\n]+)/);
  if (chineseMatch) {
    sections.translation.chinese = chineseMatch[1].trim();
    sections.translation.jyutping = chineseMatch[2].trim();
  }

  // Extract key words
  const keyWordsSection = text.match(/## Key Cantonese Words\s*\n((?:• \*\*[^*]+\*\* - [^\n]+\n?)+)/);
  if (keyWordsSection) {
    const keyWordMatches = keyWordsSection[1].matchAll(/• \*\*([^*]+)\*\* - ([^\n]+)/g);
    for (const match of keyWordMatches) {
      sections.keyWords.push({
        word: match[1].trim(),
        meaning: match[2].trim()
      });
    }
  }

  // Extract alternatives
  const altMatches = text.matchAll(/### \d+\. ([^\n]+)\s*\n\*\*Chinese:\*\*\s*([^\n]+)\s*\n\*\*Jyutping:\*\*\s*([^\n]+)/g);
  for (const match of altMatches) {
    sections.alternatives.push({
      type: match[1].trim(),
      chinese: match[2].trim(),
      jyutping: match[3].trim()
    });
  }

  return sections;
}