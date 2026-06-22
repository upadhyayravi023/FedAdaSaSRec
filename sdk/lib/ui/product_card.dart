import 'package:flutter/material.dart';
import '../saas_recommender_sdk/saas_recommender.dart';
import 'detail_screen.dart';

class ProductCard extends StatelessWidget {
  final String productId;
  final String title;
  final String imageUrl;

  const ProductCard({
    super.key,
    required this.productId,
    required this.title,
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Record click to AI Memory
        SaaSRecommender().recordUserClick(productId);

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailScreen(productId: productId, title: title, imageUrl: imageUrl),
          ),
        );
      },
      child: Container(
        width: 140,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Colors.white,
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, spreadRadius: 1)
            ]),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: Image.network(imageUrl, fit: BoxFit.cover, width: double.infinity),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}