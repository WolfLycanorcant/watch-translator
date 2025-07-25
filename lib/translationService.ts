import { getCachedTranslation, cacheTranslation } from './cache';
import { API_CONFIG } from './constants';

// Optimized fallback dictionary with Map for O(1) lookups
const FALLBACK_DICTIONARY = new Map<string, string>([
  // Greetings
  ['kumusta', 'how are you'],
  ['kumusta ka', 'how are you'],
  ['magandang umaga', 'good morning'],
  ['magandang hapon', 'good afternoon'],
  ['magandang gabi', 'good evening'],
  ['hello', 'hello'],
  ['hi', 'hi'],
  
  // Basic needs
  ['gutom ako', 'I am hungry'],
  ['uhaw ako', 'I am thirsty'],
  ['pagod ako', 'I am tired'],
  ['saan ang banyo', 'where is the bathroom'],
  ['saan ang cr', 'where is the bathroom'],
  
  // Common expressions
  ['salamat', 'thank you'],
  ['salamat po', 'thank you'],
  ['walang anuman', 'you are welcome'],
  ['pasensya na', 'sorry'],
  ['paumanhin', 'excuse me'],
  ['paalam', 'goodbye'],
  ['ingat', 'take care'],
  
  // Questions
  ['ano ito', 'what is this'],
  ['saan ito', 'where is this'],
  ['kailan', 'when'],
  ['bakit', 'why'],
  ['paano', 'how'],
  ['sino', 'who'],
  ['magkano', 'how much'],
  
  // Numbers
  ['isa', 'one'],
  ['dalawa', 'two'],
  ['tatlo', 'three'],
  ['apat', 'four'],
  ['lima', 'five'],
  ['anim', 'six'],
  ['pito', 'seven'],
  ['walo', 'eight'],
  ['siyam', 'nine'],
  ['sampu', 'ten'],
  
  // Time
  ['ngayon', 'now'],
  ['mamaya', 'later'],
  ['kahapon', 'yesterday'],
  ['bukas', 'tomorrow'],
  ['umaga', 'morning'],
  ['tanghali', 'noon'],
  ['hapon', 'afternoon'],
  ['gabi', 'evening'],
  
  // Directions
  ['kanan', 'right'],
  ['kaliwa', 'left'],
  ['tuwid', 'straight'],
  ['malapit', 'near'],
  ['malayo', 'far'],
  ['dito', 'here'],
  ['doon', 'there'],
  
  // Emergency
  ['tulong', 'help'],
  ['emergency', 'emergency'],
  ['ospital', 'hospital'],
  ['pulis', 'police'],
  ['doktor', 'doctor'],
  ['sakit', 'pain'],
  ['masama ang pakiramdam', 'feeling sick'],
  
  // Additional common phrases
  ['oo', 'yes'],
  ['hindi', 'no'],
  ['pwede', 'can'],
  ['hindi pwede', 'cannot'],
  ['ayoko', 'I do not want'],
  ['gusto ko', 'I want'],
  ['kailangan ko', 'I need'],
  ['mahal kita', 'I love you'],
  ['miss kita', 'I miss you'],
  ['ingat ka', 'be careful'],
]);

// Fuzzy matching for partial phrase recognition
function findPartialMatch(text: string): string | null {
  const words = text.toLowerCase().split(' ');
  
  // Try to find exact matches first
  for (const [key, value] of FALLBACK_DICTIONARY) {
    if (text.includes(key)) {
      return value;
    }
  }
  
  // Try word-by-word matching
  for (const word of words) {
    const match = FALLBACK_DICTIONARY.get(word);
    if (match) {
      return match;
    }
  }
  
  return null;
}

// Main translation function with multiple fallback strategies
export const translateText = async (text: string): Promise<string> => {
  if (!text?.trim()) return '';
  
  const normalizedText = text.toLowerCase().trim();
  
  // 1. Check cache first (fastest)
  const cached = await getCachedTranslation(normalizedText);
  if (cached) return cached;
  
  // 2. Check exact match in fallback dictionary
  const exactMatch = FALLBACK_DICTIONARY.get(normalizedText);
  if (exactMatch) {
    await cacheTranslation(normalizedText, exactMatch);
    return exactMatch;
  }
  
  // 3. Try partial/fuzzy matching
  const partialMatch = findPartialMatch(normalizedText);
  if (partialMatch) {
    await cacheTranslation(normalizedText, partialMatch);
    return partialMatch;
  }
  
  // 4. Try online translation services
  try {
    const onlineTranslation = await translateOnline(normalizedText);
    if (onlineTranslation) {
      await cacheTranslation(normalizedText, onlineTranslation);
      return onlineTranslation;
    }
  } catch (error) {
    console.warn('Online translation failed:', error);
  }
  
  // 5. Last resort: return original text with indication
  return `[${text}]`;
};

// Online translation with multiple service fallbacks
async function translateOnline(text: string): Promise<string | null> {
  const services = [
    () => translateWithGoogle(text),
    () => translateWithLibreTranslate(text),
  ];
  
  for (const service of services) {
    try {
      const result = await service();
      if (result) return result;
    } catch (error) {
      console.warn('Translation service failed:', error);
      continue;
    }
  }
  
  return null;
}

// Google Translate API
async function translateWithGoogle(text: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TRANSLATION_TIMEOUT);
  
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tl&tl=en&dt=t&q=${encodeURIComponent(text)}`,
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WatchTranslator/1.0)'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Google Translate error: ${response.status}`);
    }
    
    const data = await response.json();
    return data?.[0]?.[0]?.[0] || null;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// LibreTranslate API (alternative service)
async function translateWithLibreTranslate(text: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TRANSLATION_TIMEOUT);
  
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'tl',
        target: 'en',
        format: 'text'
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`LibreTranslate error: ${response.status}`);
    }
    
    const data = await response.json();
    return data?.translatedText || null;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Utility function to get translation statistics
export function getTranslationStats() {
  return {
    dictionarySize: FALLBACK_DICTIONARY.size,
    supportedPhrases: Array.from(FALLBACK_DICTIONARY.keys()),
  };
}
