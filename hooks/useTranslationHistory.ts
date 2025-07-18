import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TranslationItem {
  id: string;
  timestamp: number;
  original: string;
  translation: string;
  language?: string;
}

interface HistoryState {
  items: TranslationItem[];
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = '@WatchTranslator/history';
const MAX_HISTORY_ITEMS = 100;
const BATCH_SIZE = 10;

export function useTranslationHistory() {
  const [state, setState] = useState<HistoryState>({
    items: [],
    isLoading: true,
    error: null,
  });

  const updateState = useCallback((updates: Partial<HistoryState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate and sanitize data
        const validItems = Array.isArray(parsed) 
          ? parsed.filter(item => 
              item && 
              typeof item.id === 'string' && 
              typeof item.timestamp === 'number' &&
              typeof item.original === 'string' &&
              typeof item.translation === 'string'
            ).slice(0, MAX_HISTORY_ITEMS)
          : [];
        
        updateState({ items: validItems });
      } else {
        updateState({ items: [] });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      updateState({ 
        error: 'Failed to load translation history',
        items: [] 
      });
    } finally {
      updateState({ isLoading: false });
    }
  }, [updateState]);

  const saveHistory = useCallback(async (items: TranslationItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save history:', error);
      updateState({ error: 'Failed to save translation' });
    }
  }, [updateState]);

  const addToHistory = useCallback(async (item: Omit<TranslationItem, 'id' | 'timestamp'>) => {
    if (!item.original?.trim() || !item.translation?.trim()) {
      return; // Don't save empty translations
    }

    try {
      const newItem: TranslationItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        language: item.language || 'tl-PH',
      };
      
      // Remove duplicates and keep most recent
      const filteredHistory = state.items.filter(
        existing => existing.original.toLowerCase() !== item.original.toLowerCase()
      );
      
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      
      updateState({ items: newHistory });
      await saveHistory(newHistory);
    } catch (error) {
      console.error('Failed to add to history:', error);
      updateState({ error: 'Failed to save translation' });
    }
  }, [state.items, updateState, saveHistory]);

  const removeFromHistory = useCallback(async (id: string) => {
    try {
      const newHistory = state.items.filter(item => item.id !== id);
      updateState({ items: newHistory });
      await saveHistory(newHistory);
    } catch (error) {
      console.error('Failed to remove from history:', error);
      updateState({ error: 'Failed to remove translation' });
    }
  }, [state.items, updateState, saveHistory]);

  const clearHistory = useCallback(async () => {
    try {
      updateState({ items: [] });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      updateState({ error: 'Failed to clear history' });
    }
  }, [updateState]);

  const searchHistory = useCallback((query: string) => {
    if (!query.trim()) return state.items;
    
    const lowercaseQuery = query.toLowerCase();
    return state.items.filter(item => 
      item.original.toLowerCase().includes(lowercaseQuery) ||
      item.translation.toLowerCase().includes(lowercaseQuery)
    );
  }, [state.items]);

  // Memoized recent items for performance
  const recentItems = useMemo(() => 
    state.items.slice(0, BATCH_SIZE), 
    [state.items]
  );

  const todayItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.items.filter(item => item.timestamp >= today.getTime());
  }, [state.items]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history: state.items,
    recentItems,
    todayItems,
    isLoading: state.isLoading,
    error: state.error,
    addToHistory,
    removeFromHistory,
    clearHistory,
    searchHistory,
    refreshHistory: loadHistory,
  };
}
