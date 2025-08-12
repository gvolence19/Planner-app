// src/lib/advanced-patterns.ts
export class AdvancedPatternRecognition {
  private static PHRASE_PATTERNS_KEY = 'phrase-patterns';
  private static TEMPORAL_PATTERNS_KEY = 'temporal-patterns';
  
  static analyzeTemporalPatterns(tasks: Task[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];
    const tasksByHour = new Map<number, Task[]>();
    
    // Group tasks by hour of creation
    tasks.forEach(task => {
      const hour = new Date(task.createdAt).getHours();
      if (!tasksByHour.has(hour)) {
        tasksByHour.set(hour, []);
      }
      tasksByHour.get(hour)!.push(task);
    });
    
    // Find common patterns
    tasksByHour.forEach((hourTasks, hour) => {
      const categories = this.getMostCommonCategories(hourTasks);
      const priorities = this.getMostCommonPriorities(hourTasks);
      
      if (hourTasks.length >= 3) { // Minimum threshold
        patterns.push({
          hour,
          commonCategories: categories,
          commonPriorities: priorities,
          frequency: hourTasks.length,
          confidence: Math.min(hourTasks.length / 10, 1) // Max confidence of 1.0
        });
      }
    });
    
    return patterns;
  }
  
  static generatePhraseBasedSuggestions(
    query: string, 
    patterns: UserPattern[]
  ): SmartSuggestion[] {
    const queryWords = query.toLowerCase().split(' ');
    const suggestions: SmartSuggestion[] = [];
    
    // Look for phrase patterns
    patterns.forEach(pattern => {
      const patternWords = pattern.phrase.toLowerCase().split(' ');
      const matchScore = this.calculateWordSimilarity(queryWords, patternWords);
      
      if (matchScore > 0.6) {
        suggestions.push({
          id: `phrase-${pattern.phrase}`,
          type: 'pattern',
          title: this.generateTitleFromPattern(query, pattern),
          category: pattern.category,
          priority: pattern.priority,
          location: pattern.location,
          confidence: matchScore * (pattern.frequency / 100),
          metadata: {
            pattern: pattern.phrase,
            usageCount: pattern.frequency
          }
        });
      }
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }
  
  private static calculateWordSimilarity(words1: string[], words2: string[]): number {
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    return intersection.length / union.length;
  }
  
  private static generateTitleFromPattern(query: string, pattern: UserPattern): string {
    // Smart title generation based on pattern and current query
    if (query.length > pattern.phrase.length) {
      return query.charAt(0).toUpperCase() + query.slice(1);
    }
    return pattern.phrase.charAt(0).toUpperCase() + pattern.phrase.slice(1);
  }
}

interface TemporalPattern {
  hour: number;
  commonCategories: string[];
  commonPriorities: string[];
  frequency: number;
  confidence: number;
}