import { useEffect, useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { translateText } from '@/lib/translation';
import * as Haptics from 'expo-haptics';

interface VoiceInputState {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  transcript: string | null;
  translation: string | null;
}

export function useWatchVoiceInput() {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isProcessing: false,
    error: null,
    transcript: null,
    translation: null,
  });
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isUnmountedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updateState = useCallback((updates: Partial<VoiceInputState>) => {
    if (!isUnmountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const cleanupRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {
        console.warn('Error cleaning up recording:', error);
      }
      recordingRef.current = null;
    }
  }, []);

  const cleanupTempFiles = useCallback(async () => {
    try {
      const tempFiles = ['recording.flac', 'recording.m4a'];
      await Promise.all(
        tempFiles.map(async (file) => {
          const uri = FileSystem.cacheDirectory + file;
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists) {
            await FileSystem.deleteAsync(uri);
          }
        })
      );
    } catch (error) {
      console.warn('Error cleaning temp files:', error);
    }
  }, []);

  const parseSpeechResponse = useCallback((text: string): string | null => {
    try {
      // Handle multiple response formats
      const lines = text.split('\n').filter(line => line.trim());
      for (const line of lines) {
        if (line.includes('"result"')) {
          const parsed = JSON.parse(line);
          const transcript = parsed?.result?.[0]?.alternative?.[0]?.transcript;
          if (transcript) return transcript;
        }
      }
      return null;
    } catch (error) {
      console.warn('Error parsing speech response:', error);
      return null;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (state.isListening || state.isProcessing) return;

    try {
      updateState({ error: null, transcript: null, translation: null });
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission denied');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
      });

      recordingRef.current = recording;
      updateState({ isListening: true });
      
      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to start recording:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to start recording' 
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [state.isListening, state.isProcessing, updateState]);

  const stopListening = useCallback(async () => {
    if (!recordingRef.current || !state.isListening) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      updateState({ isProcessing: true, isListening: false });
      
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      if (!uri) {
        throw new Error('No recording found');
      }

      // Convert and process audio
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Use Web Speech API alternative
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const recognitionResponse = await fetch(
        'https://www.google.com/speech-api/v2/recognize?output=json&lang=tl-PH&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&client=chromium',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'audio/x-flac; rate=44100',
          },
          body: base64Audio,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!recognitionResponse.ok) {
        throw new Error(`Speech recognition failed: ${recognitionResponse.status}`);
      }

      const textData = await recognitionResponse.text();
      const recognizedText = parseSpeechResponse(textData);
      
      if (!recognizedText?.trim()) {
        throw new Error('No speech detected or unclear audio');
      }

      updateState({ transcript: recognizedText });
      
      const translatedText = await translateText(recognizedText);
      updateState({ translation: translatedText });
      
      // Speak translation with better options
      Speech.speak(translatedText, { 
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
      });
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      updateState({ error: errorMessage });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      updateState({ isProcessing: false });
      cleanupTempFiles();
    }
  }, [state.isListening, updateState, parseSpeechResponse, cleanupTempFiles]);

  const reset = useCallback(() => {
    updateState({
      error: null,
      transcript: null,
      translation: null,
    });
  }, [updateState]);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      cleanupRecording();
      cleanupTempFiles();
    };
  }, [cleanupRecording, cleanupTempFiles]);

  return { 
    ...state,
    startListening, 
    stopListening,
    reset,
  };
}
