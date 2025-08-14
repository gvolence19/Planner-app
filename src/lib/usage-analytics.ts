// src/lib/usage-analytics.ts
export class UsageAnalytics {
  private static ANALYTICS_KEY = 'suggestion-analytics';
  
  static trackSuggestionUsage(suggestion: SmartSuggestion, action: 'viewed' | 'selected' | 'dismissed'): void {
    const analytics = this.getAnalytics();
    const key = `${suggestion.type}-${suggestion.title}`;
    
    if (!analytics[key]) {
      analytics[key] = {
        type: suggestion.type,
        title: suggestion.title,
        viewed: 0,
        selected: 0,
        dismissed: 0,
        lastInteraction: new Date()
      };
    }
    
    analytics[key][action]++;
    analytics[key].lastInteraction = new Date();
    
    this.saveAnalytics(analytics);
  }
  
  static getPopularSuggestions(): Array<{ title: string; score: number }> {
    const analytics = this.getAnalytics();
    
    return Object.values(analytics)
      .map(item => ({
        title: item.title,
        score: (item.selected / Math.max(item.viewed, 1)) * 100
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
  
  private static getAnalytics(): Record<string, any> {
    const stored = localStorage.getItem(this.ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  
  private static saveAnalytics(analytics: Record<string, any>): void {
    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(analytics));
  }
}