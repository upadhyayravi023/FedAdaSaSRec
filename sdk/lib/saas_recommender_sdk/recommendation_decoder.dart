import 'dart:convert';
import 'package:flutter/services.dart';

class RecommendationDecoder {
  final Map<int, String> _idToAsinMap = {};
  final Map<String, int> _asinToIdMap = {};

  Future<void> loadDictionaries() async {
    try {
      final jsonString = await rootBundle.loadString('assets/ml/item_translation_map.json');
      final Map<String, dynamic> rawMap = jsonDecode(jsonString);

      rawMap.forEach((key, value) {
        String stringAsin = "";
        int intId = 0;

        // SCENARIO A: JSON is {"B000052YV4": 1}
        if (value is int) {
          stringAsin = key;
          intId = value;
        }
        // SCENARIO B: JSON is {"1": "B000052YV4"} (Your likely format)
        else if (int.tryParse(key) != null) {
          intId = int.parse(key);
          stringAsin = value.toString();
        }
        // SCENARIO C: Fallback
        else {
          intId = int.tryParse(value.toString()) ?? 0;
          stringAsin = key;
        }

        // Only map valid IDs to prevent memory corruption
        if (intId > 0 && intId < 12102) {
          _idToAsinMap[intId] = stringAsin;
          _asinToIdMap[stringAsin] = intId;
        }
      });

      print("📚 Decoder: Safely loaded ${_idToAsinMap.length} products.");
      if (_idToAsinMap.isNotEmpty) {
        print("🔍 Quick Check: Valid ID ${_idToAsinMap.keys.first} is ASIN ${_idToAsinMap.values.first}");
      }
    } catch (e) {
      print("❌ Decoder Error: $e");
    }
  }

  String? getAsin(int id) => _idToAsinMap[id];

  int? getId(String asin) => _asinToIdMap[asin];

  // Safely grab a valid ID (under 12102) for testing UI mock items
  int getFallbackId() {
    if (_idToAsinMap.isNotEmpty) {
      return _idToAsinMap.keys.firstWhere((k) => k > 0 && k < 12102, orElse: () => 1);
    }
    return 1;
  }
}