class TranslationItem {
  final String id;
  final String original;
  final String translation;
  final DateTime timestamp;
  final String language;

  TranslationItem({
    required this.id,
    required this.original,
    required this.translation,
    required this.timestamp,
    this.language = 'tl-PH',
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'original': original,
      'translation': translation,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'language': language,
    };
  }

  factory TranslationItem.fromJson(Map<String, dynamic> json) {
    return TranslationItem(
      id: json['id'] as String,
      original: json['original'] as String,
      translation: json['translation'] as String,
      timestamp: DateTime.fromMillisecondsSinceEpoch(json['timestamp'] as int),
      language: json['language'] as String? ?? 'tl-PH',
    );
  }
}