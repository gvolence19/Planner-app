// src/lib/suggestion-cache.ts
export class SuggestionCache {
  private static cache = new Map<string, { suggestions: SmartSuggestion[]; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  static get(query: string): SmartSuggestion[] | null {
    const cached = this.cache.get(query.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.suggestions;
    }
    return null;
  }
  
  static set(query: string, suggestions: SmartSuggestion[]): void {
    this.cache.set(query.toLowerCase(), {
      suggestions,
      timestamp: Date.now()
    });
    
    // Clean old entries
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      entries.slice(0, 50).forEach(([key]) => this.cache.delete(key));
    }
  }
  
  static clear(): void {
    this.cache.clear();
  }
}