import React, { useEffect, useCallback, useMemo } from 'react';
import { 
  FlatList, 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  Alert,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { useWatchVoiceInput } from '@/hooks/useWatchVoiceInput';
import { useTranslationHistory } from '@/hooks/useTranslationHistory';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { WatchButton } from '@/components/WatchButton';
import { WatchGestureHandler } from '@/components/WatchGestureHandler';
import { HistoryItem } from '@/components/HistoryItem';
import { Mic, MicOff, RotateCcw } from 'lucide-react-native';
import { IS_SMALL_SCREEN } from '@/lib/constants';

export default function HomeScreen() {
  const { startRender, endRender } = usePerformanceMonitor('HomeScreen');

  const {
    isListening,
    isProcessing,
    error,
    transcript,
    translation,
    startListening,
    stopListening,
    reset
  } = useWatchVoiceInput();

  // Performance monitoring
  useEffect(() => {
    startRender();
    return () => endRender();
  });
  
  const { 
    recentItems, 
    isLoading, 
    error: historyError,
    addToHistory,
    clearHistory,
    refreshHistory
  } = useTranslationHistory();

  // Add translation to history when complete
  useEffect(() => {
    if (translation && transcript) {
      addToHistory({ 
        original: transcript, 
        translation,
        language: 'tl-PH' 
      });
    }
  }, [translation, transcript, addToHistory]);

  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all translation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearHistory 
        }
      ]
    );
  }, [clearHistory]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // Gesture handlers for watch
  const handleSwipeLeft = useCallback(() => {
    if (!isProcessing) {
      handleClearHistory();
    }
  }, [isProcessing, handleClearHistory]);

  const handleSwipeRight = useCallback(() => {
    if (!isProcessing) {
      refreshHistory();
    }
  }, [isProcessing, refreshHistory]);

  const handleDoubleTap = useCallback(() => {
    if (!isProcessing) {
      handleVoiceToggle();
    }
  }, [isProcessing, handleVoiceToggle]);

  // Memoized components for performance
  const statusContent = useMemo(() => {
    if (error) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <WatchButton
            label="Retry"
            onPress={handleReset}
            style={[styles.smallButton, { backgroundColor: '#ef4444' }]}
          />
        </View>
      );
    }

    if (isProcessing) {
      return (
        <View style={[styles.statusContainer, styles.processingContainer]}>
          <ActivityIndicator size="large" color="#9E7FFF" />
          <Text style={styles.statusText}>Processing...</Text>
        </View>
      );
    }

    if (translation) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.originalText}>{transcript}</Text>
          <Text style={styles.translationText}>{translation}</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.instructionText}>
          {IS_SMALL_SCREEN
            ? 'Double tap to start'
            : 'Tap the button or double tap to start recording'
          }
        </Text>
      </View>
    );
  }, [error, isProcessing, translation, transcript, handleReset, isSmallScreen]);

  const renderHistoryItem = useCallback(({ item }) => (
    <HistoryItem item={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const ListEmptyComponent = useMemo(() => (
    <Text style={styles.emptyText}>
      {isLoading ? 'Loading history...' : 'No translations yet'}
    </Text>
  ), [isLoading]);

  return (
    <WatchGestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onDoubleTap={handleDoubleTap}
    >
      <View style={styles.container}>
        {!IS_SMALL_SCREEN && (
          <View style={styles.header}>
            <Text style={styles.title}>Translator</Text>
            {isListening ? (
              <Mic color="#9E7FFF" size={24} />
            ) : (
              <MicOff color="#666" size={24} />
            )}
          </View>
        )}

        {statusContent}

        <View style={styles.buttonContainer}>
          <WatchButton
            label={isListening ? 'Stop' : 'Record'}
            onPress={handleVoiceToggle}
            style={[
              styles.mainButton,
              isListening && styles.listeningButton,
              isProcessing && styles.disabledButton
            ]}
            disabled={isProcessing}
          />
          
          {!IS_SMALL_SCREEN && error && (
            <WatchButton
              label="Reset"
              onPress={handleReset}
              variant="secondary"
              size="small"
            />
          )}
        </View>

        {historyError && (
          <Text style={styles.errorText}>{historyError}</Text>
        )}

        <Text style={styles.historyTitle}>Recent</Text>
        
        <FlatList
          data={recentItems}
          renderItem={renderHistoryItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshHistory}
              tintColor="#9E7FFF"
            />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      </View>
    </WatchGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: IS_SMALL_SCREEN ? 8 : 16,
    backgroundColor: '#171717',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: IS_SMALL_SCREEN ? 18 : 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginBottom: 16,
    minHeight: IS_SMALL_SCREEN ? 60 : 80,
    justifyContent: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  statusText: {
    color: '#A3A3A3',
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    textAlign: 'center',
    marginTop: 8,
  },
  instructionText: {
    color: '#A3A3A3',
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: IS_SMALL_SCREEN ? 14 : 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  originalText: {
    color: '#A3A3A3',
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  translationText: {
    color: '#FFFFFF',
    fontSize: IS_SMALL_SCREEN ? 16 : 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: IS_SMALL_SCREEN ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: IS_SMALL_SCREEN ? 14 : 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    color: '#A3A3A3',
    textAlign: 'center',
    marginTop: 16,
    fontSize: IS_SMALL_SCREEN ? 12 : 14,
  },
});
