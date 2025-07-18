import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/translation_item.dart';

class HistoryService {
  static const String _historyKey = 'translation_history';
  static const int _maxHistoryItems = 100;

  static Future<List<TranslationItem>> getHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = prefs.getString(_historyKey);
      
      if (historyJson == null) return [];
      
      final historyList = jsonDecode(historyJson) as List<dynamic>;
      return historyList
          .map((item) => TranslationItem.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error loading history: $e');
      return [];
    }
  }

  static Future<void> addToHistory(TranslationItem item) async {
    try {
      final history = await getHistory();
      
      // Remove duplicates
      history.removeWhere((existing) => 
          existing.original.toLowerCase() == item.original.toLowerCase());
      
      // Add new item at the beginning
      history.insert(0, item);
      
      // Keep only the most recent items
      if (history.length > _maxHistoryItems) {
        history.removeRange(_maxHistoryItems, history.length);
      }
      
      await _saveHistory(history);
    } catch (e) {
      print('Error adding to history: $e');
    }
  }

  static Future<void> clearHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_historyKey);
    } catch (e) {
      print('Error clearing history: $e');
    }
  }

  static Future<void> removeFromHistory(String id) async {
    try {
      final history = await getHistory();
      history.removeWhere((item) => item.id == id);
      await _saveHistory(history);
    } catch (e) {
      print('Error removing from history: $e');
    }
  }

  static Future<void> _saveHistory(List<TranslationItem> history) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyJson = jsonEncode(history.map((item) => item.toJson()).toList());
      await prefs.setString(_historyKey, historyJson);
    } catch (e) {
      print('Error saving history: $e');
    }
  }
}