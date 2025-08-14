// src/__tests__/pattern-learning.test.ts
import { PatternLearningSystem } from '../lib/pattern-learning';
import { Task } from '../types';

describe('PatternLearningSystem', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should learn patterns from tasks', () => {
    const task: Task = {
      id: '1',
      title: 'Buy groceries',
      category: 'Shopping',
      priority: 'medium',
      completed: false,
      createdAt: new Date()
    };
    
    PatternLearningSystem.learnFromTask(task);
    const patterns = PatternLearningSystem.getPatterns();
    
    expect(patterns).toHaveLength(2); // 'buy' and 'groceries'
    expect(patterns[0].phrase).toBe('buy');
    expect(patterns[0].category).toBe('Shopping');
  });
});