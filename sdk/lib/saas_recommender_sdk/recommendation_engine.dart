import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:onnxruntime/onnxruntime.dart';

class RecommendationEngine {
  OrtSession? _session;
  bool isLoaded = false;
  final int maxVocabularySize = 12102;

  Future<void> initialize() async {
    try {
      OrtEnv.instance.init();

      // Hardware optimization for multithreading
      final sessionOptions = OrtSessionOptions()
        ..setIntraOpNumThreads(2)
        ..setInterOpNumThreads(2)
        ..setSessionGraphOptimizationLevel(GraphOptimizationLevel.ortEnableAll);

      const assetFileName = 'assets/ml/fedadasasrec_global_engine.onnx';
      final rawAssetFile = await rootBundle.load(assetFileName);
      final bytes = rawAssetFile.buffer.asUint8List();

      _session = OrtSession.fromBuffer(bytes, sessionOptions);
      isLoaded = true;
      print("✅ Engine: ONNX Loaded successfully.");
    } catch (e) {
      print("❌ Engine Error: $e");
      isLoaded = false;
    }
  }

  List<MapEntry<int, double>> runInference(List<int> history) {
    if (!isLoaded || _session == null) return [];

    try {
      // 1. Padding and Sanitization
      List<int> paddedHistory = List.filled(50, 0);
      int startIndex = 50 - history.length;

      for (int i = 0; i < history.length; i++) {
        int id = history[i];
        paddedHistory[startIndex + i] = (id >= maxVocabularySize || id < 0) ? 0 : id;
      }

      // 2. Tensor Creation
      final inputOrt = OrtValueTensor.createTensorWithDataList(
          Int64List.fromList(paddedHistory), [1, 50]);

      final runOptions = OrtRunOptions();
      final outputs = _session!.run(runOptions, {'user_sequence': inputOrt});

      // 3. Score Extraction from 3D Tensor
      final rawOutput = outputs[0]?.value;
      List<double> scores = [];

      if (rawOutput is List && rawOutput.isNotEmpty) {
        dynamic currentLevel = rawOutput;
        while (currentLevel is List && currentLevel.isNotEmpty && currentLevel.last is List) {
          currentLevel = currentLevel.last;
        }
        for (var val in currentLevel) {
          if (val is num) scores.add(val.toDouble());
        }
      }

      // Cleanup C++ Memory
      inputOrt.release();
      runOptions.release();
      for (var element in outputs) {
        element?.release();
      }

      // 4. Sorting
      List<MapEntry<int, double>> indexedScores = [];
      for (int i = 0; i < scores.length; i++) {
        if (i == 0) continue; // Skip padding ID
        indexedScores.add(MapEntry(i, scores[i]));
      }

      indexedScores.sort((a, b) => b.value.compareTo(a.value));
      return indexedScores;

    } catch (e) {
      print("❌ Inference Math Crash: $e");
      return [];
    }
  }
}