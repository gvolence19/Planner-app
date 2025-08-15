// Advanced AI Task Service with Smart Auto-Population
export interface AdvancedAITaskSuggestion {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  duration?: string;
  startTime?: string;
  confidence: number;
  reason: string;
  estimatedTime?: string;
  suggestedDate?: Date;
  autoFillData?: {
    commonDuration?: string;
    typicalLocation?: string;
    recommendedTime?: string;
    preparationTasks?: string[];
    followUpTasks?: string[];
  };
}

export class AdvancedAITaskService {
  // Comprehensive task intelligence database
  static taskIntelligence = {
    // Medical & Health
    medical: {
      patterns: [
        'doctor', 'appointment', 'checkup', 'physical', 'dentist', 'dental', 
        'orthodontist', 'optometrist', 'eye exam', 'blood test', 'lab work',
        'vaccination', 'vaccine', 'shot', 'mri', 'ct scan', 'x-ray', 'ultrasound',
        'dermatologist', 'cardiologist', 'pediatrician', 'psychiatrist',
        'therapy', 'counseling', 'prescription', 'medication', 'pharmacy'
      ],
      suggestions: [
        {
          triggers: ['doctor', 'physician', 'medical', 'checkup'],
          title: 'Schedule doctor appointment',
          duration: '60',
          location: 'Doctor\'s office',
          priority: 'high' as const,
          reason: 'Important for health maintenance',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Medical clinic',
            recommendedTime: '10:00',
            preparationTasks: ['Gather insurance cards', 'List current medications', 'Write down symptoms'],
            followUpTasks: ['Schedule follow-up if needed', 'Pick up prescriptions']
          }
        },
        {
          triggers: ['dentist', 'dental', 'teeth', 'cleaning'],
          title: 'Dental appointment',
          duration: '90',
          location: 'Dental office',
          priority: 'medium' as const,
          reason: 'Dental health maintenance',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Dental clinic',
            recommendedTime: '14:00',
            preparationTasks: ['Brush teeth', 'Bring insurance card'],
            followUpTasks: ['Schedule next cleaning in 6 months']
          }
        },
        {
          triggers: ['eye', 'vision', 'optometrist', 'glasses', 'contacts'],
          title: 'Eye exam appointment',
          duration: '45',
          location: 'Eye care center',
          priority: 'medium' as const,
          reason: 'Vision health checkup',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Optometry office',
            recommendedTime: '11:00'
          }
        }
      ]
    },

    // Sports & Fitness
    sports: {
      patterns: [
        'gym', 'workout', 'exercise', 'fitness', 'training', 'run', 'jog',
        'yoga', 'pilates', 'crossfit', 'basketball', 'tennis', 'soccer',
        'football', 'baseball', 'swimming', 'cycling', 'hiking', 'climbing',
        'martial arts', 'boxing', 'weightlifting', 'cardio', 'dance class'
      ],
      suggestions: [
        {
          triggers: ['gym', 'workout', 'fitness', 'training'],
          title: 'Gym workout session',
          duration: '90',
          location: 'Fitness center',
          priority: 'medium' as const,
          reason: 'Health and fitness goal',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Local gym',
            recommendedTime: '18:00',
            preparationTasks: ['Pack gym bag', 'Bring water bottle', 'Check gym schedule'],
            followUpTasks: ['Log workout progress', 'Plan next session']
          }
        },
        {
          triggers: ['run', 'running', 'jog', 'jogging'],
          title: 'Running session',
          duration: '45',
          location: 'Park or neighborhood',
          priority: 'medium' as const,
          reason: 'Cardiovascular health',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Local park',
            recommendedTime: '07:00',
            preparationTasks: ['Check weather', 'Prepare running gear'],
            followUpTasks: ['Track distance and time', 'Stretch and cool down']
          }
        },
        {
          triggers: ['yoga', 'meditation', 'mindfulness'],
          title: 'Yoga class',
          duration: '75',
          location: 'Yoga studio',
          priority: 'low' as const,
          reason: 'Mental and physical wellness',
          autoFill: {
            commonDuration: '75',
            typicalLocation: 'Yoga studio',
            recommendedTime: '19:00',
            preparationTasks: ['Bring yoga mat', 'Wear comfortable clothes'],
            followUpTasks: ['Practice breathing exercises']
          }
        },
        {
          triggers: ['tennis', 'court', 'match'],
          title: 'Tennis match',
          duration: '120',
          location: 'Tennis court',
          priority: 'medium' as const,
          reason: 'Sport and exercise',
          autoFill: {
            commonDuration: '120',
            typicalLocation: 'Tennis club',
            recommendedTime: '16:00',
            preparationTasks: ['Pack tennis gear', 'Confirm court booking'],
            followUpTasks: ['Review game performance']
          }
        }
      ]
    },

    // Business & Professional
    business: {
      patterns: [
        'meeting', 'conference', 'presentation', 'interview', 'networking',
        'client', 'project', 'deadline', 'review', 'planning', 'strategy',
        'training', 'workshop', 'seminar', 'team building', 'standup',
        'one-on-one', 'performance review', 'budget meeting', 'sales call'
      ],
      suggestions: [
        {
          triggers: ['meeting', 'client meeting', 'business meeting'],
          title: 'Client meeting',
          duration: '60',
          location: 'Conference room',
          priority: 'high' as const,
          reason: 'Important business engagement',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Office conference room',
            recommendedTime: '10:00',
            preparationTasks: ['Prepare agenda', 'Review client history', 'Gather materials'],
            followUpTasks: ['Send meeting notes', 'Schedule follow-up actions']
          }
        },
        {
          triggers: ['interview', 'job interview'],
          title: 'Job interview',
          duration: '90',
          location: 'Company office',
          priority: 'high' as const,
          reason: 'Career opportunity',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Company headquarters',
            recommendedTime: '14:00',
            preparationTasks: ['Research company', 'Prepare questions', 'Plan outfit', 'Print resume'],
            followUpTasks: ['Send thank you email', 'Follow up on timeline']
          }
        },
        {
          triggers: ['presentation', 'present', 'demo'],
          title: 'Business presentation',
          duration: '45',
          location: 'Meeting room',
          priority: 'high' as const,
          reason: 'Important business deliverable',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Conference room',
            recommendedTime: '15:00',
            preparationTasks: ['Finalize slides', 'Practice presentation', 'Test equipment'],
            followUpTasks: ['Gather feedback', 'Share presentation materials']
          }
        }
      ]
    },

    // Transportation & Travel
    travel: {
      patterns: [
        'flight', 'airport', 'check-in', 'boarding', 'departure', 'arrival',
        'hotel', 'reservation', 'booking', 'vacation', 'trip', 'travel',
        'train', 'bus', 'uber', 'taxi', 'car rental', 'parking',
        'customs', 'immigration', 'visa', 'passport'
      ],
      suggestions: [
        {
          triggers: ['flight', 'airport', 'departure'],
          title: 'Flight departure',
          duration: '180',
          location: 'Airport',
          priority: 'high' as const,
          reason: 'Travel schedule',
          autoFill: {
            commonDuration: '180',
            typicalLocation: 'Local airport',
            recommendedTime: '06:00',
            preparationTasks: ['Check-in online', 'Pack carry-on', 'Check traffic to airport'],
            followUpTasks: ['Confirm ground transportation at destination']
          }
        },
        {
          triggers: ['hotel', 'check-in', 'accommodation'],
          title: 'Hotel check-in',
          duration: '30',
          location: 'Hotel',
          priority: 'medium' as const,
          reason: 'Travel accommodation',
          autoFill: {
            commonDuration: '30',
            typicalLocation: 'Hotel lobby',
            recommendedTime: '15:00',
            preparationTasks: ['Confirm reservation', 'Prepare ID and credit card'],
            followUpTasks: ['Explore hotel amenities', 'Plan local activities']
          }
        }
      ]
    },

    // Personal Care & Lifestyle
    personal: {
      patterns: [
        'haircut', 'salon', 'spa', 'massage', 'manicure', 'pedicure',
        'grocery', 'shopping', 'errands', 'bank', 'post office',
        'dry cleaning', 'car wash', 'oil change', 'maintenance',
        'birthday', 'anniversary', 'date', 'dinner', 'lunch'
      ],
      suggestions: [
        {
          triggers: ['haircut', 'salon', 'hair appointment'],
          title: 'Hair appointment',
          duration: '90',
          location: 'Hair salon',
          priority: 'low' as const,
          reason: 'Personal grooming',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Local salon',
            recommendedTime: '14:00',
            preparationTasks: ['Bring reference photos', 'Confirm appointment'],
            followUpTasks: ['Schedule next appointment in 6-8 weeks']
          }
        },
        {
          triggers: ['grocery', 'groceries', 'food shopping'],
          title: 'Grocery shopping',
          duration: '60',
          location: 'Grocery store',
          priority: 'medium' as const,
          reason: 'Weekly essentials',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Local supermarket',
            recommendedTime: '10:00',
            preparationTasks: ['Make shopping list', 'Check store hours', 'Bring reusable bags'],
            followUpTasks: ['Put away groceries', 'Plan meals for the week']
          }
        },
        {
          triggers: ['car', 'oil change', 'maintenance', 'service'],
          title: 'Car maintenance',
          duration: '120',
          location: 'Auto service center',
          priority: 'medium' as const,
          reason: 'Vehicle maintenance',
          autoFill: {
            commonDuration: '120',
            typicalLocation: 'Auto shop',
            recommendedTime: '09:00',
            preparationTasks: ['Check service history', 'Gather car documents'],
            followUpTasks: ['Schedule next service', 'Update maintenance log']
          }
        }
      ]
    },

    // Educational & Learning
    education: {
      patterns: [
        'class', 'lecture', 'course', 'study', 'exam', 'test', 'quiz',
        'homework', 'assignment', 'project', 'research', 'library',
        'tutor', 'tutoring', 'lesson', 'workshop', 'seminar', 'webinar'
      ],
      suggestions: [
        {
          triggers: ['class', 'course', 'lecture'],
          title: 'Attend class',
          duration: '120',
          location: 'Classroom',
          priority: 'high' as const,
          reason: 'Educational commitment',
          autoFill: {
            commonDuration: '120',
            typicalLocation: 'University campus',
            recommendedTime: '10:00',
            preparationTasks: ['Review previous notes', 'Prepare materials', 'Check assignment due dates'],
            followUpTasks: ['Review class notes', 'Complete any assignments']
          }
        },
        {
          triggers: ['exam', 'test', 'quiz'],
          title: 'Take exam',
          duration: '180',
          location: 'Exam room',
          priority: 'high' as const,
          reason: 'Academic assessment',
          autoFill: {
            commonDuration: '180',
            typicalLocation: 'Testing center',
            recommendedTime: '09:00',
            preparationTasks: ['Final review session', 'Prepare exam materials', 'Get good night sleep'],
            followUpTasks: ['Decompress after exam', 'Wait for results']
          }
        }
      ]
    }
  };

  // Enhanced suggestion algorithm
  static async getSmartSuggestions(input: string, existingTasks: string[], categories: string[]): Promise<AdvancedAITaskSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const suggestions: AdvancedAITaskSuggestion[] = [];
    const inputLower = input.toLowerCase().trim();
    
    if (inputLower.length < 2) return [];

    // Search through all task intelligence
    Object.entries(this.taskIntelligence).forEach(([domain, data]) => {
      data.suggestions.forEach(suggestion => {
        // Check if any trigger words match the input
        const triggerMatch = suggestion.triggers.some(trigger => 
          inputLower.includes(trigger) || trigger.includes(inputLower)
        );

        // Check if any patterns match
        const patternMatch = data.patterns.some(pattern =>
          inputLower.includes(pattern) || pattern.includes(inputLower)
        );

        if (triggerMatch || patternMatch) {
          // Don't suggest if similar task already exists
          const isDuplicate = existingTasks.some(task => 
            task.toLowerCase().includes(suggestion.title.toLowerCase()) ||
            suggestion.title.toLowerCase().includes(task.toLowerCase())
          );

          if (!isDuplicate) {
            let confidence = 0.7;
            let reason = suggestion.reason;

            // Boost confidence for exact trigger matches
            if (triggerMatch) {
              confidence = 0.9;
              reason = `${suggestion.reason} (detected: ${input})`;
            }

            // Generate smart title based on input
            const smartTitle = this.generateSmartTitle(input, suggestion.title);

            suggestions.push({
              title: smartTitle,
              category: this.mapDomainToCategory(domain, categories),
              priority: suggestion.priority,
              location: suggestion.location,
              duration: suggestion.duration,
              confidence,
              reason,
              autoFillData: suggestion.autoFill,
              suggestedDate: this.suggestOptimalDate(domain, suggestion.autoFill?.recommendedTime)
            });
          }
        }
      });
    });

    // Add contextual suggestions based on time and existing tasks
    const contextualSuggestions = await this.getContextualSuggestions(inputLower, existingTasks, categories);
    suggestions.push(...contextualSuggestions);

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  }

  // Generate smart titles based on user input
  static generateSmartTitle(input: string, baseTitle: string): string {
    const inputLower = input.toLowerCase();
    
    // Extract specific details from user input
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    const dateMatch = input.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)/i);
    const locationMatch = input.match(/(?:at|in|@)\s+([^,.\n]+)/i);
    const withMatch = input.match(/(?:with|for)\s+([^,.\n]+)/i);

    let smartTitle = baseTitle;

    // Personalize based on detected entities
    if (withMatch) {
      smartTitle = `${baseTitle} with ${withMatch[1].trim()}`;
    }

    if (locationMatch) {
      smartTitle = `${smartTitle} at ${locationMatch[1].trim()}`;
    }

    // Add urgency indicators
    if (inputLower.includes('urgent') || inputLower.includes('asap')) {
      smartTitle = `URGENT: ${smartTitle}`;
    }

    return smartTitle;
  }

  // Map AI domains to user categories
  static mapDomainToCategory(domain: string, categories: string[]): string {
    const domainMapping: { [key: string]: string[] } = {
      'medical': ['health', 'personal'],
      'sports': ['fitness', 'health', 'personal'],
      'business': ['work'],
      'travel': ['travel', 'personal'],
      'personal': ['personal'],
      'education': ['education', 'personal']
    };

    const possibleCategories = domainMapping[domain] || ['personal'];
    
    // Find the first matching category the user has
    for (const category of possibleCategories) {
      const match = categories.find(c => c.toLowerCase() === category);
      if (match) return match;
    }

    // Fallback to first available category
    return categories[0] || 'personal';
  }

  // Suggest optimal dates and times
  static suggestOptimalDate(domain: string, recommendedTime?: string): Date {
    const now = new Date();
    let suggestedDate = new Date(now);

    // Different domains have different optimal scheduling patterns
    switch (domain) {
      case 'medical':
        // Medical appointments typically scheduled 1-7 days out
        suggestedDate.setDate(now.getDate() + Math.floor(Math.random() * 7) + 1);
        break;
      case 'business':
        // Business meetings typically next business day
        suggestedDate.setDate(now.getDate() + 1);
        // Skip weekends
        if (suggestedDate.getDay() === 0) suggestedDate.setDate(suggestedDate.getDate() + 1);
        if (suggestedDate.getDay() === 6) suggestedDate.setDate(suggestedDate.getDate() + 2);
        break;
      case 'sports':
        // Sports activities often same day or next day
        if (now.getHours() < 18) {
          // If it's before 6 PM, suggest today
          suggestedDate = new Date(now);
        } else {
          // Otherwise suggest tomorrow
          suggestedDate.setDate(now.getDate() + 1);
        }
        break;
      default:
        suggestedDate.setDate(now.getDate() + 1);
    }

    // Set recommended time if provided
    if (recommendedTime) {
      const [hours, minutes] = recommendedTime.split(':');
      suggestedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return suggestedDate;
  }

  // Get contextual suggestions based on user patterns
  static async getContextualSuggestions(input: string, existingTasks: string[], categories: string[]): Promise<AdvancedAITaskSuggestion[]> {
    const suggestions: AdvancedAITaskSuggestion[] = [];
    
    // Time-based suggestions
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Morning health routine suggestions
    if (hour >= 6 && hour <= 9 && input.includes('workout')) {
      suggestions.push({
        title: 'Morning workout routine',
        category: 'fitness',
        priority: 'medium',
        duration: '45',
        confidence: 0.8,
        reason: 'Perfect morning activity',
        autoFillData: {
          recommendedTime: '07:00',
          preparationTasks: ['Prepare workout clothes', 'Have light breakfast'],
          followUpTasks: ['Post-workout stretch', 'Healthy breakfast']
        }
      });
    }

    // Weekend activity suggestions
    if ((day === 0 || day === 6) && input.includes('fun')) {
      suggestions.push({
        title: 'Weekend recreational activity',
        category: 'personal',
        priority: 'low',
        duration: '120',
        confidence: 0.7,
        reason: 'Weekend leisure time',
        autoFillData: {
          recommendedTime: '14:00',
          preparationTasks: ['Check weather', 'Plan activity'],
          followUpTasks: ['Share experience with friends']
        }
      });
    }

    // Workday meeting suggestions
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17 && input.includes('meet')) {
      suggestions.push({
        title: 'Schedule team meeting',
        category: 'work',
        priority: 'high',
        duration: '60',
        confidence: 0.85,
        reason: 'Business hours meeting',
        autoFillData: {
          recommendedTime: '10:00',
          preparationTasks: ['Prepare agenda', 'Book conference room'],
          followUpTasks: ['Send meeting summary', 'Track action items']
        }
      });
    }

    return suggestions;
  }

  // Get preparation and follow-up suggestions
  static getTaskRecommendations(taskTitle: string): { preparation: string[], followUp: string[] } {
    const titleLower = taskTitle.toLowerCase();
    
    // Find matching suggestion in our intelligence database
    for (const domain of Object.values(this.taskIntelligence)) {
      for (const suggestion of domain.suggestions) {
        if (suggestion.triggers.some(trigger => titleLower.includes(trigger))) {
          return {
            preparation: suggestion.autoFill?.preparationTasks || [],
            followUp: suggestion.autoFill?.followUpTasks || []
          };
        }
      }
    }

    return { preparation: [], followUp: [] };
  }
}