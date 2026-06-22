import 'package:flutter/material.dart';
import '../saas_recommender_sdk/saas_recommender.dart';
import 'product_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<String> aiRecommendations = [];
  bool _isInitializing = true;

  final Map<String, Map<String, String>> mockDatabase = {
    "B000052YV4": {"title": "Revlon Super Lustrous Lipstick", "img": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300"},
    "B000142C1A": {"title": "Olay Regenerist Face Cream", "img": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300"},
    "B00067Y2A4": {"title": "L'Oreal Paris Mascara", "img": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300"},
    "B00185123A": {"title": "Neutrogena Makeup Remover", "img": "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=300"},
  };

  @override
  void initState() {
    super.initState();
    _startUp();
  }

  Future<void> _startUp() async {
    await SaaSRecommender().initialize();
    await _loadAI();
    if (mounted) setState(() => _isInitializing = false);
  }

  Future<void> _loadAI() async {
    final recs = await SaaSRecommender().getPersonalizedRecommendations(count: 5);
    if (mounted) setState(() => aiRecommendations = recs);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text("BeautyBox Store", style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isInitializing
          ? const Center(child: CircularProgressIndicator(color: Colors.pinkAccent))
          : RefreshIndicator(
        onRefresh: _loadAI,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text("Trending Catalog", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            SizedBox(
              height: 220,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: mockDatabase.entries.map((entry) {
                  return ProductCard(
                    productId: entry.key,
                    title: entry.value["title"]!,
                    imageUrl: entry.value["img"]!,
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 32),
            const Text("✨ Recommended For You", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.pinkAccent)),
            const SizedBox(height: 12),
            aiRecommendations.isEmpty
                ? const SizedBox(height: 100, child: Center(child: Text("Tap products above to train your AI!")))
                : SizedBox(
              height: 220,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: aiRecommendations.map((id) {
                  final title = mockDatabase[id]?["title"] ?? "Beauty Item ($id)";
                  final img = mockDatabase[id]?["img"] ?? "https://via.placeholder.com/150";
                  return ProductCard(productId: id, title: title, imageUrl: img);
                }).toList(),
              ),
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.pinkAccent, foregroundColor: Colors.white),
              onPressed: _loadAI,
              icon: const Icon(Icons.psychology),
              label: const Text("Force Update AI Recommendations"),
            )
          ],
        ),
      ),
    );
  }
}