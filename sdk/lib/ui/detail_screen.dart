import 'package:flutter/material.dart';

class DetailScreen extends StatelessWidget {
  final String productId;
  final String title;
  final String imageUrl;

  const DetailScreen({super.key, required this.productId, required this.title, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.network(imageUrl, width: double.infinity, height: 300, fit: BoxFit.cover),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text("Product ID: $productId", style: const TextStyle(color: Colors.grey)),
                  const SizedBox(height: 16),
                  const Text("This product was just recorded in the AI's short-term sequence memory. Navigate back and update recommendations to see the AI adapt!"),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}