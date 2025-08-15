// src/components/AITaskService.ts
// AI Task Service - Similar to your grocery list AI service
export interface AITaskSuggestion {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  duration?: string;
  confidence: number;
  reason: string;
  estimatedTime?: string;
}

export class AITaskService {
  // Common task categories and patterns
  static taskPatterns = {
    'work': {
      keywords: ['meeting', 'project', 'deadline', 'presentation', 'report', 'email', 'call', 'review', 'planning', 'strategy'],
      suggestions: [
        { title: 'Review weekly reports', priority: 'medium', duration: '30', reason: 'Regular work task' },
        { title: 'Prepare for team meeting', priority: 'medium', duration: '45', reason: 'Common preparation task' },
        { title: 'Send follow-up emails', priority: 'low', duration: '15', reason: 'Routine communication' },
        { title: 'Update project status', priority: 'medium', duration: '20', reason: 'Project management' },
        { title: 'Schedule client call', priority: 'high', duration: '10', reason: 'Important business task' }
      ]
    },
    'personal': {
      keywords: ['birthday', 'anniversary', 'family', 'friend', 'personal', 'self-care', 'hobby', 'reading'],
      suggestions: [
        { title: 'Call family members', priority: 'medium', duration: '30', reason: 'Stay connected' },
        { title: 'Plan weekend activities', priority: 'low', duration: '15', reason: 'Personal planning' },
        { title: 'Read for 30 minutes', priority: 'low', duration: '30', reason: 'Personal development' },
        { title: 'Write in journal', priority: 'low', duration: '15', reason: 'Self-reflection' },
        { title: 'Plan birthday celebration', priority: 'medium', duration: '45', reason: 'Special occasion planning' }
      ]
    },
    'shopping': {
      keywords: ['buy', 'purchase', 'shop', 'store', 'pick up', 'order', 'online'],
      suggestions: [
        { title: 'Buy groceries for the week', priority: 'medium', duration: '60', location: 'grocery store', reason: 'Weekly essential' },
        { title: 'Pick up dry cleaning', priority: 'low', duration: '15', location: 'dry cleaner', reason: 'Routine errand' },
        { title: 'Order birthday gift', priority: 'medium', duration: '20', reason: 'Gift planning' },
        { title: 'Shop for work clothes', priority: 'low', duration: '90', location: 'mall', reason: 'Wardrobe update' },
        { title: 'Buy household supplies', priority: 'medium', duration: '30', reason: 'Home maintenance' }
      ]
    },
    'health': {
      keywords: ['doctor', 'dentist', 'appointment', 'medication', 'exercise', 'gym', 'workout', 'health'],
      suggestions: [
        { title: 'Schedule annual checkup', priority: 'high', duration: '15', location: 'doctor office', reason: 'Preventive care' },
        { title: 'Go for a 30-minute walk', priority: 'medium', duration: '30', reason: 'Daily exercise' },
        { title: 'Take daily vitamins', priority: 'low', duration: '5', reason: 'Health routine' },
        { title: 'Book dental cleaning', priority: 'medium', duration: '10', location: 'dental office', reason: 'Oral health' },
        { title: 'Complete workout routine', priority: 'medium', duration: '45', location: 'gym', reason: 'Fitness goal' }
      ]
    },
    'home': {
      keywords: ['clean', 'organize', 'repair', 'fix', 'maintenance', 'laundry', 'dishes', 'yard'],
      suggestions: [
        { title: 'Clean the kitchen', priority: 'medium', duration: '30', location: 'home', reason: 'Regular cleaning' },
        { title: 'Do laundry', priority: 'medium', duration: '20', location: 'home', reason: 'Weekly chore' },
        { title: 'Organize closet', priority: 'low', duration: '60', location: 'home', reason: 'Home organization' },
        { title: 'Water plants', priority: 'low', duration: '10', location: 'home', reason: 'Plant care' },
        { title: 'Take out trash', priority: 'medium', duration: '5', location: 'home', reason: 'Weekly task' }
      ]
    },
    'finance': {
      keywords: ['pay', 'bill', 'budget', 'bank', 'money', 'taxes', 'investment', 'savings'],
      suggestions: [
        { title: 'Pay monthly bills', priority: 'high', duration: '30', reason: 'Financial responsibility' },
        { title: 'Review bank statements', priority: 'medium', duration: '20', reason: 'Financial monitoring' },
        { title: 'Update budget spreadsheet', priority: 'medium', duration: '25', reason: 'Budget tracking' },
        { title: 'Set up automatic savings', priority: 'low', duration: '15', reason: 'Financial planning' },
        { title: 'File tax documents', priority: 'high', duration: '45', reason: 'Tax preparation' }
      ]
    }
  };

  static async getSuggestions(input: string, existingTasks: string[], categories: string[]): Promise<AITaskSuggestion[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const suggestions: AITaskSuggestion[] = [];
    const inputLower = input.toLowerCase().trim();
    
    if (inputLower.length === 0) return [];
    
    // Search through task patterns for matches
    Object.entries(this.taskPatterns).forEach(([category, patterns]) => {
      // Check if category exists in user's categories
      if (!categories.includes(category)) return;
      
      patterns.suggestions.forEach(suggestion => {
        if (!existingTasks.some(task => task.toLowerCase().includes(suggestion.title.toLowerCase()))) {
          let confidence = 0;
          let reason = suggestion.reason;
          
          // Check if input matches keywords
          if (patterns.keywords.some(keyword => inputLower.includes(keyword))) {
            confidence = 0.8;
            reason = `${suggestion.reason} (matches "${inputLower}")`;
          }
          // Check if input matches suggestion title
          else if (suggestion.title.toLowerCase().includes(inputLower)) {
            confidence = 0.9;
            reason = `${suggestion.reason} (similar to your input)`;
          }
          // Check if first letter matches
          else if (inputLower.length === 1 && suggestion.title.toLowerCase().charAt(0) === inputLower) {
            confidence = 0.4;
            reason = `${suggestion.reason} (starts with same letter)`;
          }
          
          if (confidence > 0) {
            suggestions.push({
              ...suggestion,
              category,
              confidence,
              reason
            });
          }
        }
      });
    });

    // Add context-aware suggestions based on existing tasks
    const contextSuggestions = this.getContextualSuggestions(inputLower, existingTasks);
    suggestions.push(...contextSuggestions);

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  }

  static getContextualSuggestions(input: string, existingTasks: string[]): AITaskSuggestion[] {
    const suggestions: AITaskSuggestion[] = [];
    
    // If user has many work tasks, suggest work-related follow-ups
    const workTaskCount = existingTasks.filter(task => 
      task.toLowerCase().includes('meeting') || 
      task.toLowerCase().includes('project') ||
      task.toLowerCase().includes('work')
    ).length;

    if (workTaskCount > 2 && input.includes('f')) {
      if (!existingTasks.some(task => task.toLowerCase().includes('follow'))) {
        suggestions.push({
          title: 'Follow up on pending items',
          category: 'work',
          priority: 'medium',
          duration: '20',
          confidence: 0.7,
          reason: 'You have many work tasks!'
        });
      }
    }

    // Health reminders based on patterns
    if (existingTasks.some(task => task.toLowerCase().includes('doctor')) && input.includes('s')) {
      suggestions.push({
        title: 'Schedule follow-up appointment',
        category: 'health',
        priority: 'medium',
        duration: '10',
        confidence: 0.75,
        reason: 'Good to schedule follow-ups!'
      });
    }

    return suggestions;
  }

  static async getSmartSuggestions(existingTasks: string[], categories: string[]): Promise<AITaskSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const suggestions: AITaskSuggestion[] = [];
    const existingLower = existingTasks.map(task => task.toLowerCase());
    
    // Weekly essentials that might be missing
    const weeklyEssentials = [
      { title: 'Plan weekly goals', category: 'personal', priority: 'medium' as const, duration: '20', reason: 'Weekly planning essential' },
      { title: 'Review completed tasks', category: 'personal', priority: 'low' as const, duration: '15', reason: 'Weekly reflection' },
      { title: 'Clean workspace', category: 'home', priority: 'medium' as const, duration: '25', reason: 'Productivity booster' },
      { title: 'Meal prep for the week', category: 'personal', priority: 'medium' as const, duration: '60', reason: 'Weekly meal planning' },
      { title: 'Schedule important calls', category: 'work', priority: 'high' as const, duration: '15', reason: 'Communication planning' }
    ];

    // Common forgotten tasks
    const forgottenTasks = [
      { title: 'Back up important files', category: 'work', priority: 'medium' as const, duration: '20', reason: 'Data protection' },
      { title: 'Update emergency contacts', category: 'personal', priority: 'low' as const, duration: '15', reason: 'Safety planning' },
      { title: 'Review subscription services', category: 'finance', priority: 'low' as const, duration: '30', reason: 'Budget optimization' },
      { title: 'Declutter digital photos', category: 'personal', priority: 'low' as const, duration: '45', reason: 'Digital organization' },
      { title: 'Check smoke detector batteries', category: 'home', priority: 'medium' as const, duration: '10', reason: 'Home safety' }
    ];

    // Daily routine suggestions
    const dailyRoutines = [
      { title: 'Morning stretching routine', category: 'health', priority: 'medium' as const, duration: '15', reason: 'Daily wellness' },
      { title: 'Evening wind-down time', category: 'personal', priority: 'low' as const, duration: '30', reason: 'Better sleep' },
      { title: 'Check tomorrow\'s schedule', category: 'work', priority: 'medium' as const, duration: '10', reason: 'Daily preparation' },
      { title: 'Tidy up workspace', category: 'home', priority: 'low' as const, duration: '15', reason: 'Daily organization' }
    ];

    const allSuggestions = [...weeklyEssentials, ...forgottenTasks, ...dailyRoutines];

    // Filter suggestions based on available categories and existing tasks
    allSuggestions.forEach(suggestion => {
      if (categories.includes(suggestion.category) && 
          !existingLower.some(existing => existing.includes(suggestion.title.toLowerCase()))) {
        suggestions.push({
          ...suggestion,
          confidence: 0.6
        });
      }
    });

    // Add time-based suggestions
    const hour = new Date().getHours();
    if (hour < 12) { // Morning suggestions
      suggestions.push({
        title: 'Review daily priorities',
        category: 'personal',
        priority: 'medium',
        duration: '10',
        confidence: 0.7,
        reason: 'Great way to start the day!'
      });
    } else if (hour > 17) { // Evening suggestions
      suggestions.push({
        title: 'Plan tomorrow\'s tasks',
        category: 'personal',
        priority: 'low',
        duration: '15',
        confidence: 0.7,
        reason: 'Evening planning for success!'
      });
    }

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }
}

// Fun task icons based on categories and task content
export const getTaskAIIcon = (category?: string, taskTitle?: string): string => {
  // First check for specific task content
  if (taskTitle) {
    const titleLower = taskTitle.toLowerCase();
    
    // Specific task icons
    const taskIcons: { [key: string]: string } = {
      // Work tasks
      'meeting': '🤝', 'call': '📞', 'presentation': '📊', 'report': '📋',
      'email': '📧', 'project': '💼', 'deadline': '⏰', 'review': '🔍',
      'planning': '📝', 'strategy': '🎯', 'budget': '💰', 'interview': '👥',
      
      // Personal tasks
      'birthday': '🎂', 'anniversary': '💒', 'family': '👨‍👩‍👧‍👦', 'friend': '👫',
      'reading': '📚', 'journal': '📖', 'hobby': '🎨', 'vacation': '🏖️',
      'meditation': '🧘', 'exercise': '💪', 'walk': '🚶', 'run': '🏃',
      
      // Shopping tasks
      'groceries': '🛒', 'shopping': '🛍️', 'buy': '💳', 'order': '📦',
      'pick up': '🚗', 'store': '🏪', 'mall': '🏬', 'online': '💻',
      
      // Health tasks
      'doctor': '👨‍⚕️', 'dentist': '🦷', 'appointment': '📅', 'medication': '💊',
      'vitamins': '💊', 'workout': '🏋️', 'gym': '🏃‍♂️', 'checkup': '🩺',
      
      // Home tasks
      'clean': '🧹', 'laundry': '👕', 'dishes': '🍽️', 'organize': '📦',
      'repair': '🔧', 'fix': '🛠️', 'garden': '🌱', 'plant': '🪴',
      'trash': '🗑️', 'vacuum': '🧹', 'mop': '🧽', 'dust': '🪶',
      
      // Finance tasks
      'pay': '💳', 'bill': '📄', 'bank': '🏦', 'tax': '📊',
      'savings': '💰', 'investment': '📈', 'budget': '💹',
      
      // Education tasks
      'study': '📖', 'homework': '✏️', 'course': '🎓', 'learn': '🧠',
      'class': '🏫', 'exam': '📝', 'assignment': '📋',
      
      // Travel tasks
      'flight': '✈️', 'hotel': '🏨', 'vacation': '🏖️', 'trip': '🧳',
      'book': '📱', 'pack': '🎒', 'passport': '📓',
      
      // Food tasks
      'cook': '👨‍🍳', 'meal': '🍽️', 'recipe': '📝', 'restaurant': '🍽️',
      'lunch': '🥪', 'dinner': '🍛', 'breakfast': '🥞',
      
      // Tech tasks
      'backup': '💾', 'update': '🔄', 'install': '⬇️', 'password': '🔒',
      'computer': '💻', 'phone': '📱', 'software': '💿',
      
      // Creative tasks
      'write': '✍️', 'draw': '🎨', 'design': '🎨', 'photo': '📸',
      'music': '🎵', 'video': '📹', 'create': '✨',
    };
    
    // Check for exact matches first
    for (const [keyword, icon] of Object.entries(taskIcons)) {
      if (titleLower.includes(keyword)) {
        return icon;
      }
    }
  }
  
  // Fallback to category icons
  const categoryIcons = {
    'work': '💼',
    'personal': '👤',
    'shopping': '🛒',
    'health': '🏥',
    'home': '🏠',
    'finance': '💰',
    'education': '🎓',
    'travel': '✈️',
    'food': '🍽️',
    'default': '✨'
  };
  
  return categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
};