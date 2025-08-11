// src/lib/pattern-learning.ts
import { Task } from '@/types';

export interface UserPattern {
  phrase: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  frequency: number;
  lastUsed: Date;
}

interface TaskPattern {
  keywords: string[];
  category?: string;
  priority?: Task['priority'];
  location?: string;
  frequency: number;
}

interface UserPreferences {
  categoryPatterns: TaskPattern[];
  priorityPatterns: TaskPattern[];
  locationPatterns: TaskPattern[];
  timePatterns: { [key: string]: number };
}

class PatternLearningSystemClass {
  private static STORAGE_KEY = 'user-patterns';
  private static PREFERENCES_KEY = 'task-patterns';
  private preferences: UserPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
  }

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(PatternLearningSystemClass.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load task patterns:', error);
    }
    
    return {
      categoryPatterns: [],
      priorityPatterns: [],
      locationPatterns: [],
      timePatterns: {}
    };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(PatternLearningSystemClass.PREFERENCES_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save task patterns:', error);
    }
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5); // Limit to first 5 meaningful words
  }

  // Legacy methods for backward compatibility
  static getPatterns(): UserPattern[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  static savePatterns(patterns: UserPattern[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patterns));
  }
  
  static learnFromTask(task: Task): void {
    // Use the new instance method
    PatternLearningSystem.learnFromTask(task);
    
    // Also maintain legacy pattern storage
    const patterns = this.getPatterns();
    const words = task.title.toLowerCase().split(' ');
    
    words.forEach(word => {
      if (word.length > 2) {
        const existingPattern = patterns.find(p => p.phrase === word);
        
        if (existingPattern) {
          existingPattern.frequency++;
          existingPattern.lastUsed = new Date();
        } else {
          patterns.push({
            phrase: word,
            category: task.category || 'Personal',
            priority: task.priority,
            location: task.location,
            frequency: 1,
            lastUsed: new Date()
          });
        }
      }
    });
    
    this.savePatterns(patterns);
  }

  // New instance methods
  learnFromTask(task: Task): void {
    if (!task.title) return;

    const keywords = this.extractKeywords(task.title);
    if (keywords.length === 0) return;

    // Learn category patterns
    if (task.category) {
      this.updatePattern(this.preferences.categoryPatterns, keywords, {
        category: task.category
      });
    }

    // Learn priority patterns
    if (task.priority) {
      this.updatePattern(this.preferences.priorityPatterns, keywords, {
        priority: task.priority
      });
    }

    // Learn location patterns
    if (task.location) {
      this.updatePattern(this.preferences.locationPatterns, keywords, {
        location: task.location
      });
    }

    // Learn time patterns (hour of day when tasks are created)
    const hour = new Date(task.createdAt).getHours();
    this.preferences.timePatterns[hour] = (this.preferences.timePatterns[hour] || 0) + 1;

    this.savePreferences();
  }

  private updatePattern(patterns: TaskPattern[], keywords: string[], data: Partial<TaskPattern>): void {
    // Find existing pattern with similar keywords
    let existingPattern = patterns.find(pattern => 
      keywords.some(keyword => pattern.keywords.includes(keyword))
    );

    if (existingPattern) {
      // Update existing pattern
      keywords.forEach(keyword => {
        if (!existingPattern!.keywords.includes(keyword)) {
          existingPattern!.keywords.push(keyword);
        }
      });
      existingPattern.frequency += 1;
      
      // Update pattern data
      Object.assign(existingPattern, data);
    } else {
      // Create new pattern
      patterns.push({
        keywords: [...keywords],
        frequency: 1,
        ...data
      });
    }

    // Keep only top 50 patterns to avoid memory issues
    patterns.sort((a, b) => b.frequency - a.frequency);
    if (patterns.length > 50) {
      patterns.splice(50);
    }
  }

  predictCategory(taskTitle: string): string | undefined {
    const keywords = this.extractKeywords(taskTitle);
    if (keywords.length === 0) return undefined;

    let bestMatch: { pattern: TaskPattern; score: number } | null = null;

    for (const pattern of this.preferences.categoryPatterns) {
      const matchingKeywords = keywords.filter(keyword => 
        pattern.keywords.includes(keyword)
      );
      
      if (matchingKeywords.length > 0) {
        const score = (matchingKeywords.length / keywords.length) * pattern.frequency;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { pattern, score };
        }
      }
    }

    return bestMatch?.pattern.category;
  }

  predictPriority(taskTitle: string): Task['priority'] | undefined {
    const keywords = this.extractKeywords(taskTitle);
    if (keywords.length === 0) return undefined;

    let bestMatch: { pattern: TaskPattern; score: number } | null = null;

    for (const pattern of this.preferences.priorityPatterns) {
      const matchingKeywords = keywords.filter(keyword => 
        pattern.keywords.includes(keyword)
      );
      
      if (matchingKeywords.length > 0) {
        const score = (matchingKeywords.length / keywords.length) * pattern.frequency;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { pattern, score };
        }
      }
    }

    return bestMatch?.pattern.priority;
  }

  predictLocation(taskTitle: string): string | undefined {
    const keywords = this.extractKeywords(taskTitle);
    if (keywords.length === 0) return undefined;

    let bestMatch: { pattern: TaskPattern; score: number } | null = null;

    for (const pattern of this.preferences.locationPatterns) {
      const matchingKeywords = keywords.filter(keyword => 
        pattern.keywords.includes(keyword)
      );
      
      if (matchingKeywords.length > 0) {
        const score = (matchingKeywords.length / keywords.length) * pattern.frequency;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { pattern, score };
        }
      }
    }

    return bestMatch?.pattern.location;
  }

  getPreferredCreateTime(): number {
    const times = Object.entries(this.preferences.timePatterns);
    if (times.length === 0) return new Date().getHours();

    return parseInt(
      times.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    );
  }

  // Debug method to inspect learned patterns
  getPatterns(): UserPreferences {
    return { ...this.preferences };
  }

  // Method to clear all learned patterns
  clearPatterns(): void {
    this.preferences = {
      categoryPatterns: [],
      priorityPatterns: [],
      locationPatterns: [],
      timePatterns: {}
    };
    this.savePreferences();
  }
}

// Export a singleton instance
export const PatternLearningSystem = new PatternLearningSystemClass();