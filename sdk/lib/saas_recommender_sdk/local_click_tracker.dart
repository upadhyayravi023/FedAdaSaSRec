class LocalClickTracker {
  final List<int> _userHistory = [];
  final int maxHistoryLength = 50;

  void recordClick(int itemId) {
    _userHistory.add(itemId);
    // Keep only the most recent items based on max sequence length
    if (_userHistory.length > maxHistoryLength) {
      _userHistory.removeAt(0);
    }
  }

  List<int> getHistory() {
    return List.unmodifiable(_userHistory);
  }

  void clearHistory() {
    _userHistory.clear();
  }
}