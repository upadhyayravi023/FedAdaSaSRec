import 'local_click_tracker.dart';
import 'recommendation_decoder.dart';
import 'recommendation_engine.dart';

class SaaSRecommender {
  // Singleton Setup
  static final SaaSRecommender _instance = SaaSRecommender._internal();
  factory SaaSRecommender() => _instance;
  SaaSRecommender._internal();

  final LocalClickTracker _tracker = LocalClickTracker();
  final RecommendationDecoder _decoder = RecommendationDecoder();
  final RecommendationEngine _engine = RecommendationEngine();

  Future<void> initialize() async {
    print("🚀 Booting SaaS Recommender SDK...");
    await _decoder.loadDictionaries();
    await _engine.initialize();
  }

  void recordUserClick(String asin) {
    int? id = _decoder.getId(asin);
    if (id != null && id < _engine.maxVocabularySize && id >= 0) {
      _tracker.recordClick(id);
    } else {
      // Fallback for testing UI with unmapped mock products
      int fallbackId = _decoder.getFallbackId();
      _tracker.recordClick(fallbackId);
      print("⚠️ SDK: Used Fallback ID $fallbackId for $asin");
    }
    print("📝 SDK Memory: ${_tracker.getHistory()}");
  }

  List<int> get currentMemory => _tracker.getHistory();

  void clearHistory() {
    _tracker.clearHistory();
    print("🧹 SDK: Memory Cleared.");
  }

  Future<List<String>> getPersonalizedRecommendations({int count = 5}) async {
    print("🧠 SDK: Running Inference...");

    // Pass the history to the engine to get mathematical rankings
    final List<MapEntry<int, double>> rankedScores = _engine.runInference(_tracker.getHistory());

    // Decode math IDs back to Amazon ASIN strings
    List<String> finalRecommendations = [];
    for (var entry in rankedScores) {
      String? asin = _decoder.getAsin(entry.key);
      if (asin != null) {
        finalRecommendations.add(asin);
        if (finalRecommendations.length >= count) break;
      }
    }

    print("✅ SDK: Generated ${finalRecommendations.length} recommendations.");
    return finalRecommendations;
  }
}