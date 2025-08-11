// src/lib/pattern-learning.ts
export interface UserPattern {
  phrase: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  frequency: number;
  lastUsed: Date;
}

export class PatternLearningSystem {
  private static STORAGE_KEY = 'user-patterns';
  
  static getPatterns(): UserPattern[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  
  static savePatterns(patterns: UserPattern[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(patterns));
  }
  
  static learnFromTask(task: Task): void {
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
}