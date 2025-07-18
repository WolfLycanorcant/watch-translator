import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:vibration/vibration.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/translation_service.dart';
import '../services/history_service.dart';
import '../models/translation_item.dart';
import '../widgets/history_list.dart';
import '../widgets/watch_button.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  
  bool _isListening = false;
  bool _isProcessing = false;
  String? _transcript;
  String? _translation;
  String? _error;
  List<TranslationItem> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeServices();
    _loadHistory();
  }

  Future<void> _initializeServices() async {
    try {
      // Request microphone permission
      final status = await Permission.microphone.request();
      if (status != PermissionStatus.granted) {
        setState(() {
          _error = 'Microphone permission required';
        });
        return;
      }

      // Initialize speech to text
      final available = await _speechToText.initialize(
        onError: (error) {
          setState(() {
            _error = error.errorMsg;
            _isListening = false;
            _isProcessing = false;
          });
        },
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            setState(() {
              _isListening = false;
            });
          }
        },
      );

      if (!available) {
        setState(() {
          _error = 'Speech recognition not available';
        });
      }

      // Initialize TTS
      await _flutterTts.setLanguage('en-US');
      await _flutterTts.setSpeechRate(0.8);
      await _flutterTts.setPitch(1.0);
    } catch (e) {
      setState(() {
        _error = 'Failed to initialize services: $e';
      });
    }
  }

  Future<void> _loadHistory() async {
    try {
      final history = await HistoryService.getHistory();
      setState(() {
        _history = history;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load history';
        _isLoading = false;
      });
    }
  }

  Future<void> _startListening() async {
    if (_isListening || _isProcessing) return;

    setState(() {
      _error = null;
      _transcript = null;
      _translation = null;
      _isListening = true;
    });

    try {
      await _vibrate();
      await _speechToText.listen(
        onResult: _onSpeechResult,
        localeId: 'tl-PH',
        listenMode: ListenMode.confirmation,
        cancelOnError: true,
        partialResults: false,
      );
    } catch (e) {
      setState(() {
        _error = 'Failed to start listening: $e';
        _isListening = false;
      });
    }
  }

  Future<void> _stopListening() async {
    if (!_isListening) return;

    await _speechToText.stop();
    setState(() {
      _isListening = false;
    });
  }

  void _onSpeechResult(result) async {
    if (result.finalResult) {
      final recognizedWords = result.recognizedWords as String;
      
      setState(() {
        _transcript = recognizedWords;
        _isProcessing = true;
        _isListening = false;
      });

      try {
        final translation = await TranslationService.translateText(recognizedWords);
        
        setState(() {
          _translation = translation;
          _isProcessing = false;
        });

        // Speak the translation
        await _flutterTts.speak(translation);
        await _vibrate();

        // Add to history
        final historyItem = TranslationItem(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          original: recognizedWords,
          translation: translation,
          timestamp: DateTime.now(),
        );

        await HistoryService.addToHistory(historyItem);
        await _loadHistory();
      } catch (e) {
        setState(() {
          _error = 'Translation failed: $e';
          _isProcessing = false;
        });
      }
    }
  }

  Future<void> _vibrate() async {
    try {
      if (await Vibration.hasVibrator() ?? false) {
        await Vibration.vibrate(duration: 100);
      }
    } catch (e) {
      // Vibration not supported, ignore
    }
  }

  void _reset() {
    setState(() {
      _error = null;
      _transcript = null;
      _translation = null;
    });
  }

  Future<void> _clearHistory() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear History'),
        content: const Text('Are you sure you want to clear all translation history?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Clear'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await HistoryService.clearHistory();
      await _loadHistory();
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isSmallScreen = screenWidth < 200;

    return Scaffold(
      appBar: isSmallScreen ? null : AppBar(
        title: const Text('Watch Translator'),
        actions: [
          IconButton(
            onPressed: _clearHistory,
            icon: const Icon(Icons.clear_all),
          ),
        ],
      ),
      body: GestureDetector(
        onDoubleTap: _isProcessing ? null : (_isListening ? _stopListening : _startListening),
        child: Padding(
          padding: EdgeInsets.all(isSmallScreen ? 8.0 : 16.0),
          child: Column(
            children: [
              // Status Container
              Container(
                width: double.infinity,
                height: isSmallScreen ? 80 : 120,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF2F2F2F),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: _buildStatusContent(isSmallScreen),
              ),
              
              const SizedBox(height: 16),
              
              // Control Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  WatchButton(
                    onPressed: _isProcessing ? null : (_isListening ? _stopListening : _startListening),
                    icon: _isListening ? Icons.stop : Icons.mic,
                    label: _isListening ? 'Stop' : 'Record',
                    color: _isListening ? Colors.red : const Color(0xFF9E7FFF),
                    isSmall: isSmallScreen,
                  ),
                  
                  if (_error != null)
                    WatchButton(
                      onPressed: _reset,
                      icon: Icons.refresh,
                      label: 'Reset',
                      color: Colors.grey,
                      isSmall: isSmallScreen,
                    ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // History Section
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Recent Translations',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: isSmallScreen ? 14 : 18,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: HistoryList(
                        history: _history,
                        isLoading: _isLoading,
                        isSmallScreen: isSmallScreen,
                        onRefresh: _loadHistory,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusContent(bool isSmallScreen) {
    if (_error != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            color: Colors.red,
            size: isSmallScreen ? 20 : 24,
          ),
          const SizedBox(height: 4),
          Text(
            _error!,
            style: TextStyle(
              color: Colors.red,
              fontSize: isSmallScreen ? 12 : 14,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }

    if (_isProcessing) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: isSmallScreen ? 20 : 24,
            height: isSmallScreen ? 20 : 24,
            child: const CircularProgressIndicator(
              color: Color(0xFF9E7FFF),
              strokeWidth: 2,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Processing...',
            style: TextStyle(
              color: Colors.white70,
              fontSize: isSmallScreen ? 12 : 14,
            ),
          ),
        ],
      );
    }

    if (_translation != null && _transcript != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            _transcript!,
            style: TextStyle(
              color: Colors.white70,
              fontSize: isSmallScreen ? 10 : 12,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            _translation!,
            style: TextStyle(
              color: Colors.white,
              fontSize: isSmallScreen ? 14 : 18,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      );
    }

    return Center(
      child: Text(
        isSmallScreen 
            ? 'Double tap to start' 
            : 'Tap Record or double tap to start',
        style: TextStyle(
          color: Colors.white70,
          fontSize: isSmallScreen ? 10 : 14,
          fontStyle: FontStyle.italic,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  @override
  void dispose() {
    _speechToText.cancel();
    _flutterTts.stop();
    super.dispose();
  }
}