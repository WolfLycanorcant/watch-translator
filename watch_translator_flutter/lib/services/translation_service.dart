import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class TranslationService {
  static const String _cacheKey = 'translation_cache';
  static const int _cacheExpiryHours = 24;
  
  // Offline fallback dictionary
  static const Map<String, String> _fallbackDictionary = {
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
    'sino': 'who',
  };

  static Future<String> translateText(String text) async {
    if (text.trim().isEmpty) return '';
    
    final normalizedText = text.toLowerCase().trim();
    
    // Check cache first
    final cachedTranslation = await _getCachedTranslation(normalizedText);
    if (cachedTranslation != null) return cachedTranslation;
    
    // Check fallback dictionary
    final fallbackResult = _fallbackDictionary[normalizedText];
    if (fallbackResult != null) {
      await _setCachedTranslation(normalizedText, fallbackResult);
      return fallbackResult;
    }
    
    try {
      // Try Google Translate API
      final url = Uri.parse(
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=tl&tl=en&dt=t&q=${Uri.encodeComponent(normalizedText)}'
      );
      
      final response = await http.get(url).timeout(
        const Duration(seconds: 5),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final translation = data[0][0][0] as String? ?? '';
        
        if (translation.isNotEmpty) {
          await _setCachedTranslation(normalizedText, translation);
          return translation;
        }
      }
      
      throw Exception('Translation API failed');
    } catch (e) {
      print('Translation failed: $e');
      
      // Return partial matches from dictionary as last resort
      for (final entry in _fallbackDictionary.entries) {
        if (normalizedText.contains(entry.key) || entry.key.contains(normalizedText)) {
          return entry.value;
        }
      }
      
      return '[Unable to translate: $text]';
    }
  }
  
  static Future<String?> _getCachedTranslation(String text) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheJson = prefs.getString(_cacheKey);
      if (cacheJson == null) return null;
      
      final cache = jsonDecode(cacheJson) as Map<String, dynamic>;
      final cached = cache[text] as Map<String, dynamic>?;
      
      if (cached != null) {
        final timestamp = cached['timestamp'] as int;
        final translation = cached['translation'] as String;
        
        final now = DateTime.now().millisecondsSinceEpoch;
        final expiryTime = timestamp + (_cacheExpiryHours * 60 * 60 * 1000);
        
        if (now < expiryTime) {
          return translation;
        }
      }
      
      return null;
    } catch (e) {
      print('Cache read error: $e');
      return null;
    }
  }
  
  static Future<void> _setCachedTranslation(String original, String translation) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cacheJson = prefs.getString(_cacheKey) ?? '{}';
      final cache = jsonDecode(cacheJson) as Map<String, dynamic>;
      
      cache[original] = {
        'translation': translation,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      };
      
      await prefs.setString(_cacheKey, jsonEncode(cache));
    } catch (e) {
      print('Cache write error: $e');
    }
  }
}