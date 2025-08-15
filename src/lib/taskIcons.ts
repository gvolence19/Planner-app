// Enhanced Fun Task Icons System
// src/lib/taskIcons.ts

export interface TaskIconMatch {
  icon: string;
  keywords: string[];
  category?: string;
  priority?: number; // Higher number = higher priority match
}

export const FUN_TASK_ICONS: TaskIconMatch[] = [
  // 🏥 Medical & Health
  { icon: '👨‍⚕️', keywords: ['doctor', 'physician', 'medical', 'checkup', 'physical'], category: 'health', priority: 10 },
  { icon: '🦷', keywords: ['dentist', 'dental', 'teeth', 'cleaning', 'cavity', 'orthodontist'], category: 'health', priority: 10 },
  { icon: '👁️', keywords: ['eye', 'vision', 'optometrist', 'glasses', 'contacts'], category: 'health', priority: 10 },
  { icon: '💊', keywords: ['medication', 'medicine', 'pills', 'prescription', 'pharmacy'], category: 'health', priority: 9 },
  { icon: '🩺', keywords: ['checkup', 'examination', 'health', 'wellness'], category: 'health', priority: 8 },
  { icon: '💉', keywords: ['vaccine', 'vaccination', 'shot', 'immunization'], category: 'health', priority: 9 },
  { icon: '🧪', keywords: ['blood test', 'lab work', 'test results'], category: 'health', priority: 8 },
  { icon: '🏥', keywords: ['hospital', 'clinic', 'emergency'], category: 'health', priority: 8 },

  // 💪 Fitness & Sports
  { icon: '💪', keywords: ['gym', 'workout', 'exercise', 'fitness', 'training', 'weights'], category: 'fitness', priority: 10 },
  { icon: '🏃', keywords: ['run', 'running', 'jog', 'jogging', 'marathon'], category: 'fitness', priority: 10 },
  { icon: '🧘', keywords: ['yoga', 'meditation', 'mindfulness', 'zen', 'pilates'], category: 'fitness', priority: 10 },
  { icon: '🚴', keywords: ['bike', 'biking', 'cycling', 'bicycle'], category: 'fitness', priority: 9 },
  { icon: '🏊', keywords: ['swim', 'swimming', 'pool', 'laps'], category: 'fitness', priority: 10 },
  { icon: '🎾', keywords: ['tennis', 'court', 'match', 'racquet'], category: 'fitness', priority: 9 },
  { icon: '⚽', keywords: ['soccer', 'football', 'sport', 'game'], category: 'fitness', priority: 8 },
  { icon: '🏀', keywords: ['basketball', 'hoops', 'court'], category: 'fitness', priority: 8 },
  { icon: '🥊', keywords: ['boxing', 'martial arts', 'fighting', 'kickboxing'], category: 'fitness', priority: 9 },
  { icon: '🏋️', keywords: ['weightlifting', 'powerlifting', 'strength training'], category: 'fitness', priority: 9 },
  { icon: '🧗', keywords: ['climbing', 'rock climbing', 'bouldering'], category: 'fitness', priority: 9 },

  // 💼 Work & Business
  { icon: '🤝', keywords: ['meeting', 'conference', 'discussion'], category: 'work', priority: 10 },
  { icon: '📞', keywords: ['call', 'phone', 'conference call'], category: 'work', priority: 9 },
  { icon: '📧', keywords: ['email', 'send email', 'reply'], category: 'work', priority: 8 },
  { icon: '📊', keywords: ['presentation', 'present', 'demo', 'pitch'], category: 'work', priority: 10 },
  { icon: '📋', keywords: ['report', 'document', 'paperwork'], category: 'work', priority: 8 },
  { icon: '💼', keywords: ['project', 'task', 'assignment'], category: 'work', priority: 7 },
  { icon: '⏰', keywords: ['deadline', 'urgent', 'due'], category: 'work', priority: 9 },
  { icon: '👥', keywords: ['interview', 'hiring', 'candidate'], category: 'work', priority: 10 },
  { icon: '📝', keywords: ['review', 'feedback', 'evaluation'], category: 'work', priority: 8 },
  { icon: '🎯', keywords: ['strategy', 'planning', 'goals'], category: 'work', priority: 8 },
  { icon: '📈', keywords: ['sales', 'revenue', 'growth'], category: 'work', priority: 8 },
  { icon: '💰', keywords: ['budget', 'finance', 'money'], category: 'work', priority: 8 },

  // ✈️ Travel & Transportation
  { icon: '✈️', keywords: ['flight', 'airplane', 'departure', 'arrival'], category: 'travel', priority: 10 },
  { icon: '🏨', keywords: ['hotel', 'accommodation', 'check-in', 'booking'], category: 'travel', priority: 10 },
  { icon: '🧳', keywords: ['pack', 'packing', 'luggage', 'suitcase'], category: 'travel', priority: 9 },
  { icon: '🗺️', keywords: ['trip', 'vacation', 'travel', 'journey'], category: 'travel', priority: 8 },
  { icon: '🚗', keywords: ['drive', 'car', 'road trip'], category: 'travel', priority: 8 },
  { icon: '🚂', keywords: ['train', 'railway', 'metro'], category: 'travel', priority: 8 },
  { icon: '🚌', keywords: ['bus', 'transport', 'public transport'], category: 'travel', priority: 7 },
  { icon: '🚕', keywords: ['taxi', 'uber', 'ride'], category: 'travel', priority: 7 },
  { icon: '📘', keywords: ['passport', 'visa', 'documents'], category: 'travel', priority: 9 },

  // 🛒 Shopping & Errands
  { icon: '🛒', keywords: ['grocery', 'groceries', 'shopping', 'supermarket'], category: 'shopping', priority: 10 },
  { icon: '🛍️', keywords: ['shop', 'shopping', 'buy', 'purchase'], category: 'shopping', priority: 9 },
  { icon: '📦', keywords: ['order', 'delivery', 'package', 'amazon'], category: 'shopping', priority: 9 },
  { icon: '💳', keywords: ['pay', 'payment', 'card', 'transaction'], category: 'shopping', priority: 8 },
  { icon: '🏪', keywords: ['store', 'retail', 'shop'], category: 'shopping', priority: 7 },
  { icon: '🎁', keywords: ['gift', 'present', 'birthday gift'], category: 'shopping', priority: 9 },
  { icon: '👕', keywords: ['clothes', 'clothing', 'fashion', 'outfit'], category: 'shopping', priority: 8 },
  { icon: '👟', keywords: ['shoes', 'sneakers', 'footwear'], category: 'shopping', priority: 8 },

  // 🏠 Home & Maintenance
  { icon: '🧹', keywords: ['clean', 'cleaning', 'tidy', 'housework'], category: 'home', priority: 10 },
  { icon: '👕', keywords: ['laundry', 'wash', 'clothes'], category: 'home', priority: 10 },
  { icon: '🍽️', keywords: ['dishes', 'wash dishes', 'kitchen'], category: 'home', priority: 9 },
  { icon: '📦', keywords: ['organize', 'declutter', 'sort'], category: 'home', priority: 8 },
  { icon: '🔧', keywords: ['repair', 'fix', 'maintenance'], category: 'home', priority: 9 },
  { icon: '🛠️', keywords: ['diy', 'project', 'build'], category: 'home', priority: 8 },
  { icon: '🌱', keywords: ['garden', 'plant', 'water plants'], category: 'home', priority: 9 },
  { icon: '🗑️', keywords: ['trash', 'garbage', 'waste'], category: 'home', priority: 8 },
  { icon: '💡', keywords: ['light', 'bulb', 'electricity'], category: 'home', priority: 7 },
  { icon: '🔌', keywords: ['plug', 'outlet', 'electrical'], category: 'home', priority: 7 },

  // 💰 Finance & Banking
  { icon: '🏦', keywords: ['bank', 'banking', 'atm'], category: 'finance', priority: 10 },
  { icon: '💳', keywords: ['pay bill', 'payment', 'credit card'], category: 'finance', priority: 10 },
  { icon: '📊', keywords: ['tax', 'taxes', 'filing'], category: 'finance', priority: 10 },
  { icon: '💰', keywords: ['money', 'cash', 'savings'], category: 'finance', priority: 8 },
  { icon: '📈', keywords: ['investment', 'stocks', 'portfolio'], category: 'finance', priority: 9 },
  { icon: '💵', keywords: ['budget', 'expense', 'spending'], category: 'finance', priority: 8 },
  { icon: '🏧', keywords: ['withdrawal', 'deposit', 'transfer'], category: 'finance', priority: 8 },

  // 🎓 Education & Learning
  { icon: '📚', keywords: ['study', 'homework', 'assignment'], category: 'education', priority: 10 },
  { icon: '✏️', keywords: ['write', 'essay', 'paper'], category: 'education', priority: 9 },
  { icon: '🎓', keywords: ['graduation', 'degree', 'university'], category: 'education', priority: 9 },
  { icon: '📝', keywords: ['exam', 'test', 'quiz'], category: 'education', priority: 10 },
  { icon: '🏫', keywords: ['school', 'class', 'lecture'], category: 'education', priority: 9 },
  { icon: '📖', keywords: ['read', 'reading', 'book'], category: 'education', priority: 8 },
  { icon: '🧮', keywords: ['math', 'calculate', 'numbers'], category: 'education', priority: 8 },
  { icon: '🔬', keywords: ['science', 'lab', 'experiment'], category: 'education', priority: 8 },
  { icon: '🖥️', keywords: ['computer', 'coding', 'programming'], category: 'education', priority: 8 },

  // 🍽️ Food & Cooking
  { icon: '👨‍🍳', keywords: ['cook', 'cooking', 'recipe'], category: 'food', priority: 10 },
  { icon: '🍽️', keywords: ['meal', 'dinner', 'lunch', 'breakfast'], category: 'food', priority: 9 },
  { icon: '🥗', keywords: ['meal prep', 'healthy', 'salad'], category: 'food', priority: 9 },
  { icon: '🍕', keywords: ['pizza', 'order food', 'takeout'], category: 'food', priority: 8 },
  { icon: '☕', keywords: ['coffee', 'cafe', 'drink'], category: 'food', priority: 7 },
  { icon: '🥪', keywords: ['sandwich', 'lunch', 'snack'], category: 'food', priority: 7 },
  { icon: '🍰', keywords: ['cake', 'dessert', 'baking'], category: 'food', priority: 8 },
  { icon: '🍷', keywords: ['wine', 'restaurant', 'dining'], category: 'food', priority: 7 },

  // 👨‍👩‍👧‍👦 Family & Social
  { icon: '🎂', keywords: ['birthday', 'celebration', 'party'], category: 'personal', priority: 10 },
  { icon: '💑', keywords: ['date', 'date night', 'romantic'], category: 'personal', priority: 10 },
  { icon: '👨‍👩‍👧‍👦', keywords: ['family', 'kids', 'children'], category: 'personal', priority: 9 },
  { icon: '👫', keywords: ['friend', 'friends', 'social'], category: 'personal', priority: 8 },
  { icon: '📞', keywords: ['call mom', 'call dad', 'call family'], category: 'personal', priority: 9 },
  { icon: '💐', keywords: ['anniversary', 'flowers', 'valentine'], category: 'personal', priority: 9 },
  { icon: '🎈', keywords: ['party', 'event', 'celebration'], category: 'personal', priority: 8 },
  { icon: '🎪', keywords: ['fun', 'entertainment', 'activity'], category: 'personal', priority: 7 },

  // 💅 Personal Care & Beauty
  { icon: '✂️', keywords: ['haircut', 'salon', 'hair'], category: 'personal', priority: 10 },
  { icon: '💅', keywords: ['manicure', 'nails', 'pedicure'], category: 'personal', priority: 9 },
  { icon: '🧴', keywords: ['spa', 'massage', 'facial'], category: 'personal', priority: 9 },
  { icon: '🪒', keywords: ['shave', 'grooming', 'beard'], category: 'personal', priority: 8 },
  { icon: '🦷', keywords: ['brush teeth', 'dental hygiene'], category: 'personal', priority: 7 },
  { icon: '🛁', keywords: ['bath', 'shower', 'relax'], category: 'personal', priority: 7 },

  // 🚗 Automotive
  { icon: '🚗', keywords: ['car wash', 'wash car', 'clean car'], category: 'automotive', priority: 10 },
  { icon: '⛽', keywords: ['gas', 'fuel', 'fill up'], category: 'automotive', priority: 9 },
  { icon: '🔧', keywords: ['oil change', 'maintenance', 'service'], category: 'automotive', priority: 10 },
  { icon: '🛞', keywords: ['tire', 'tires', 'rotation'], category: 'automotive', priority: 9 },
  { icon: '🚙', keywords: ['inspection', 'registration', 'dmv'], category: 'automotive', priority: 9 },
  { icon: '🔋', keywords: ['battery', 'jump start', 'electrical'], category: 'automotive', priority: 8 },

  // 🎨 Creative & Hobbies
  { icon: '🎨', keywords: ['art', 'paint', 'draw', 'creative'], category: 'personal', priority: 9 },
  { icon: '📸', keywords: ['photo', 'photography', 'camera'], category: 'personal', priority: 9 },
  { icon: '🎵', keywords: ['music', 'practice', 'instrument'], category: 'personal', priority: 8 },
  { icon: '📹', keywords: ['video', 'film', 'record'], category: 'personal', priority: 8 },
  { icon: '✍️', keywords: ['write', 'journal', 'blog'], category: 'personal', priority: 8 },
  { icon: '📖', keywords: ['read', 'book', 'novel'], category: 'personal', priority: 8 },
  { icon: '🧩', keywords: ['puzzle', 'game', 'hobby'], category: 'personal', priority: 7 },

  // 💻 Technology
  { icon: '💻', keywords: ['computer', 'laptop', 'tech'], category: 'work', priority: 8 },
  { icon: '📱', keywords: ['phone', 'mobile', 'smartphone'], category: 'work', priority: 7 },
  { icon: '💾', keywords: ['backup', 'save', 'data'], category: 'work', priority: 9 },
  { icon: '🔄', keywords: ['update', 'upgrade', 'install'], category: 'work', priority: 8 },
  { icon: '🔒', keywords: ['password', 'security', 'login'], category: 'work', priority: 8 },
  { icon: '🌐', keywords: ['website', 'online', 'internet'], category: 'work', priority: 7 },

  // 🎪 Special Occasions
  { icon: '🎄', keywords: ['christmas', 'holiday', 'xmas'], category: 'personal', priority: 10 },
  { icon: '🎃', keywords: ['halloween', 'costume', 'trick or treat'], category: 'personal', priority: 10 },
  { icon: '🦃', keywords: ['thanksgiving', 'turkey', 'family dinner'], category: 'personal', priority: 10 },
  { icon: '🎆', keywords: ['new year', 'fireworks', 'celebration'], category: 'personal', priority: 10 },
  { icon: '💝', keywords: ['valentine', 'love', 'romance'], category: 'personal', priority: 10 },
  { icon: '🎓', keywords: ['graduation', 'ceremony', 'achievement'], category: 'personal', priority: 10 },

  // 🌟 Miscellaneous Fun
  { icon: '☀️', keywords: ['morning', 'sunrise', 'early'], category: 'personal', priority: 5 },
  { icon: '🌙', keywords: ['night', 'evening', 'late'], category: 'personal', priority: 5 },
  { icon: '☕', keywords: ['coffee', 'break', 'caffeine'], category: 'personal', priority: 6 },
  { icon: '🍃', keywords: ['nature', 'outdoor', 'fresh air'], category: 'personal', priority: 6 },
  { icon: '⭐', keywords: ['important', 'special', 'priority'], category: 'personal', priority: 7 },
  { icon: '🚀', keywords: ['launch', 'start', 'begin'], category: 'work', priority: 7 },
  { icon: '🎯', keywords: ['goal', 'target', 'objective'], category: 'work', priority: 7 },
  { icon: '💡', keywords: ['idea', 'brainstorm', 'think'], category: 'work', priority: 7 },
];

// Category fallback icons
export const CATEGORY_ICONS = {
  'work': '💼',
  'personal': '👤',
  'shopping': '🛒',
  'health': '🏥',
  'fitness': '💪',
  'home': '🏠',
  'finance': '💰',
  'education': '📚',
  'travel': '✈️',
  'food': '🍽️',
  'automotive': '🚗',
  'default': '✨'
};

// Priority-based icons
export const PRIORITY_ICONS = {
  'high': '🔴',
  'medium': '🟡',
  'low': '🟢'
};

/**
 * Get the best matching fun icon for a task
 */
export function getFunTaskIcon(taskTitle?: string, category?: string, priority?: string): string {
  if (!taskTitle) {
    return category ? CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default : CATEGORY_ICONS.default;
  }

  const titleLower = taskTitle.toLowerCase();
  
  // Find all matching icons
  const matches = FUN_TASK_ICONS.filter(iconMatch => 
    iconMatch.keywords.some(keyword => 
      titleLower.includes(keyword.toLowerCase())
    )
  );

  if (matches.length === 0) {
    // No keyword matches, fall back to category
    return category ? CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default : CATEGORY_ICONS.default;
  }

  // Sort by priority and category match
  const sortedMatches = matches.sort((a, b) => {
    // Prefer category matches
    const aCategoryMatch = a.category === category ? 10 : 0;
    const bCategoryMatch = b.category === category ? 10 : 0;
    
    // Combine priority and category match score
    const aScore = (a.priority || 0) + aCategoryMatch;
    const bScore = (b.priority || 0) + bCategoryMatch;
    
    return bScore - aScore;
  });

  return sortedMatches[0].icon;
}

/**
 * Get icon for AI suggestions with enhanced matching
 */
export function getAITaskIcon(taskTitle: string, category?: string): string {
  return getFunTaskIcon(taskTitle, category);
}

/**
 * Get a random fun icon for variety
 */
export function getRandomFunIcon(): string {
  const randomIndex = Math.floor(Math.random() * FUN_TASK_ICONS.length);
  return FUN_TASK_ICONS[randomIndex].icon;
}

/**
 * Get icon suggestions based on partial input
 */
export function getIconSuggestions(input: string, limit = 5): Array<{ icon: string; reason: string }> {
  const inputLower = input.toLowerCase();
  const suggestions: Array<{ icon: string; reason: string; score: number }> = [];

  FUN_TASK_ICONS.forEach(iconMatch => {
    iconMatch.keywords.forEach(keyword => {
      if (keyword.includes(inputLower) || inputLower.includes(keyword)) {
        const score = keyword === inputLower ? 10 : (iconMatch.priority || 0);
        suggestions.push({
          icon: iconMatch.icon,
          reason: `Matches "${keyword}"`,
          score
        });
      }
    });
  });

  // Remove duplicates and sort by score
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.icon === suggestion.icon)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return uniqueSuggestions.map(({ icon, reason }) => ({ icon, reason }));
}

// Export for backward compatibility
export const getTaskAIIcon = getFunTaskIcon;