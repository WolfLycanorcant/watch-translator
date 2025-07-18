import AsyncStorage from '@react-native-async-storage/async-storage';

interface TranslationDictionary {
  [key: string]: string;
}

interface CachedTranslation {
  text: string;
  timestamp: number;
}

const FALLBACK_DICTIONARY: TranslationDictionary = {
  'kumusta': 'how are you',
  'salamat': 'thank you',
  'magandang umaga': 'good morning',
  'magandang hapon': 'good afternoon',
  'magandang gabi': 'good evening',
  'paalam': 'goodbye',
  'oo': 'yes',
  'hindi': 'no',
  'pakiusap': 'please',
  'tulong': 'help',
  'bahay': 'house',
  'kain': 'eat',
  'tulog': 'sleep',
  'mahal kita': 'I love you',
  'ingat': 'take care',
  'ano pangalan mo': 'what is your name',
  'saan ang banyo': 'where is the bathroom',
  'gutom ako': 'I am hungry',
  'pagod ako': 'I am tired',
  'magkano': 'how much',
  'nasaan': 'where is',
  'kailan': 'when',
  'bakit': 'why',
  'paano': 'how',
  'sino': 'who'
};

const CACHE_KEY = '@WatchTranslator/cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const translationCache = new Map<string, CachedTranslation>();

const loadCache = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      Object.entries(data).forEach(([key, value]) => {
        translationCache.set(key, value as CachedTranslation);
      });
    }
  } catch (error) {
    console.warn('Failed to load translation cache:', error);
  }
};

const saveCache = async () => {
  try {
    const cacheObject = Object.fromEntries(translationCache);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
  } catch (error) {
    console.warn('Failed to save translation cache:', error);
  }
};

const getCachedTranslation = (text: string): string | null => {
  const cached = translationCache.get(text);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.text;
  }
  return null;
};

const setCachedTranslation = (original: string, translated: string) => {
  translationCache.set(original, {
    text: translated,
    timestamp: Date.now()
  });
  saveCache(); // Fire and forget
};

export const translateText = async (text: string): Promise<string> => {
  if (!text?.trim()) return '';
  
  const normalizedText = text.toLowerCase().trim();
  
  // Check cache first
  const cached = getCachedTranslation(normalizedText);
  if (cached) return cached;
  
  // Check fallback dictionary
  const fallbackResult = FALLBACK_DICTIONARY[normalizedText];
  if (fallbackResult) {
    setCachedTranslation(normalizedText, fallbackResult);
    return fallbackResult;
  }
  
  try {
    // Try Google Translate API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tl&tl=en&dt=t&q=${encodeURIComponent(normalizedText)}`,
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WatchTranslator/1.0)'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    const translation = data?.[0]?.[0]?.[0] || '';
    
    if (translation) {
      setCachedTranslation(normalizedText, translation);
      return translation;
    }
    
    throw new Error('Empty translation response');
  } catch (error) {
    console.warn('Google Translate failed:', error);
    
    // Return partial matches from dictionary as last resort
    const partialMatch = Object.entries(FALLBACK_DICTIONARY).find(([key]) => 
      normalizedText.includes(key) || key.includes(normalizedText)
    );
    
    return partialMatch?.[1] || `[Unable to translate: ${text}]`;
  }
};

// Initialize cache on module load
loadCache();
