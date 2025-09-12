// Advanced AI Task Service with Smart Auto-Population and Enhanced Icons
import { getFunTaskIcon } from '@/lib/taskIcons';

// UPDATE your interface to include icon field
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
  icon?: string;
  autoFillData?: {
    commonDuration?: string;
    typicalLocation?: string;
    recommendedTime?: string;
    preparationTasks?: string[];
    followUpTasks?: string[];
  };
}

export class AdvancedAITaskService {
  // Keep your existing taskIntelligence structure but UPDATE the suggestions with emojis
  static taskIntelligence = {
    // Medical & Health - UPDATE with enhanced emojis
    medical: {
      patterns: [
        'doctor', 'appointment', 'checkup', 'physical', 'dentist', 'dental', 
        'orthodontist', 'optometrist', 'eye exam', 'blood test', 'lab work',
        'vaccination', 'vaccine', 'shot', 'mri', 'ct scan', 'x-ray', 'ultrasound',
        'dermatologist', 'cardiologist', 'pediatrician', 'psychiatrist',
        'therapy', 'counseling', 'prescription', 'medication', 'pharmacy',
        'specialist', 'consultation', 'follow-up', 'surgery', 'procedure'
      ],
      suggestions: [
        {
          triggers: ['doctor', 'physician', 'medical', 'checkup', 'physical'],
          title: 'Schedule doctor appointment',
          duration: '60',
          location: 'Medical clinic',
          priority: 'high' as const,
          reason: 'Important for health maintenance 👨‍⚕️',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Doctor\'s office',
            recommendedTime: '10:00',
            preparationTasks: [
              '💳 Gather insurance cards and ID',
              '💊 List current medications and dosages',
              '📝 Write down symptoms and concerns',
              '❓ Prepare list of questions for doctor',
              '📋 Bring previous test results if available',
              '⏰ Arrive 15 minutes early for paperwork'
            ],
            followUpTasks: [
              '📅 Schedule follow-up appointment if needed',
              '💊 Pick up prescriptions from pharmacy',
              '📋 Update medical records',
              '🧪 Schedule any recommended tests',
              '✅ Follow prescribed treatment plan'
            ]
          }
        },
        {
          triggers: ['dentist', 'dental', 'teeth', 'cleaning', 'cavity'],
          title: 'Dental appointment',
          duration: '75',
          location: 'Dental office',
          priority: 'medium' as const,
          reason: 'Dental health maintenance 🦷',
          autoFill: {
            commonDuration: '75',
            typicalLocation: 'Dental clinic',
            recommendedTime: '14:00',
            preparationTasks: [
              '🪥 Brush and floss teeth thoroughly',
              '💳 Bring dental insurance card',
              '📝 List any dental concerns or pain',
              '🚫🍽️ Avoid eating 2 hours before appointment',
              '🎧 Bring headphones for comfort'
            ],
            followUpTasks: [
              '📅 Schedule next cleaning in 6 months',
              '📋 Follow post-treatment care instructions',
              '🛒 Purchase recommended dental products',
              '🗓️ Schedule any additional treatments needed'
            ]
          }
        },
        {
          triggers: ['eye', 'vision', 'optometrist', 'glasses', 'contacts'],
          title: 'Eye exam appointment',
          duration: '45',
          location: 'Eye care center',
          priority: 'medium' as const,
          reason: 'Vision health checkup 👁️',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Optometry office',
            recommendedTime: '11:00',
            preparationTasks: [
              '👓 Bring current glasses or contacts',
              '📝 List vision concerns or changes',
              '💳 Bring insurance information',
              '👁️ Remove contact lenses before exam'
            ],
            followUpTasks: [
              '👓 Order new glasses if needed',
              '📅 Schedule follow-up if required',
              '👁️ Update prescription contacts'
            ]
          }
        },
        {
          triggers: ['specialist', 'cardiologist', 'dermatologist'],
          title: 'Specialist consultation',
          duration: '90',
          location: 'Specialist office',
          priority: 'high' as const,
          reason: 'Specialized medical care 🏥',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Medical specialist office',
            recommendedTime: '09:00',
            preparationTasks: [
              '📋 Get referral from primary care doctor',
              '📄 Gather all relevant medical records',
              '📝 Prepare detailed symptom timeline',
              '🔍 Research specialist and clinic',
              '💳 Prepare insurance pre-authorization'
            ],
            followUpTasks: [
              '📅 Schedule follow-up appointments',
              '📧 Share results with primary care doctor',
              '✅ Begin recommended treatment plan'
            ]
          }
        }
      ]
    },

    // Sports & Fitness - UPDATE with enhanced emojis
    sports: {
      patterns: [
        'gym', 'workout', 'exercise', 'fitness', 'training', 'run', 'jog',
        'yoga', 'pilates', 'crossfit', 'basketball', 'tennis', 'soccer',
        'football', 'baseball', 'swimming', 'cycling', 'hiking', 'climbing',
        'martial arts', 'boxing', 'weightlifting', 'cardio', 'dance class',
        'personal trainer', 'spin class', 'zumba', 'strength training'
      ],
      suggestions: [
        {
          triggers: ['gym', 'workout', 'fitness', 'training', 'lift', 'weights'],
          title: 'Gym workout session',
          duration: '90',
          location: 'Fitness center',
          priority: 'medium' as const,
          reason: 'Health and fitness goal 💪',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Local gym',
            recommendedTime: '18:00',
            preparationTasks: [
              '🎒 Pack gym bag with workout clothes',
              '💧 Bring water bottle and towel',
              '📅 Check gym class schedule',
              '🎵 Prepare workout playlist',
              '🍌 Eat light snack 1 hour before',
              '📋 Bring phone charger for tracking'
            ],
            followUpTasks: [
              '📱 Log workout progress in app',
              '🧘 Stretch and cool down properly',
              '📅 Plan next workout session',
              '🔥 Track calories burned',
              '😴 Schedule rest day if needed'
            ]
          }
        },
        {
          triggers: ['run', 'running', 'jog', 'jogging', 'cardio'],
          title: 'Running session',
          duration: '45',
          location: 'Park or neighborhood',
          priority: 'medium' as const,
          reason: 'Cardiovascular health 🏃',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Local park',
            recommendedTime: '07:00',
            preparationTasks: [
              '☀️🌧️ Check weather conditions',
              '👟 Prepare running gear and shoes',
              '🗺️ Plan running route',
              '⌚ Charge fitness tracker',
              '🤸 Do dynamic warm-up exercises',
              '☀️ Apply sunscreen if sunny'
            ],
            followUpTasks: [
              '📊 Track distance and pace',
              '🧘 Stretch and cool down',
              '📱 Log run in fitness app',
              '💧🍌 Hydrate and refuel',
              '📅 Plan next running session'
            ]
          }
        },
        {
          triggers: ['yoga', 'meditation', 'mindfulness', 'zen'],
          title: 'Yoga class',
          duration: '75',
          location: 'Yoga studio',
          priority: 'low' as const,
          reason: 'Mental and physical wellness 🧘',
          autoFill: {
            commonDuration: '75',
            typicalLocation: 'Yoga studio',
            recommendedTime: '19:00',
            preparationTasks: [
              '🧘‍♀️ Bring yoga mat and towel',
              '👕 Wear comfortable, stretchy clothes',
              '🚫🍽️ Avoid heavy meals 2 hours before',
              '💧 Bring water bottle',
              '🕘 Arrive 10 minutes early'
            ],
            followUpTasks: [
              '🌬️ Practice breathing exercises',
              '📅 Schedule next yoga session',
              '💧 Maintain hydration',
              '📓 Journal about the experience'
            ]
          }
        },
        {
          triggers: ['tennis', 'court', 'match', 'racquet'],
          title: 'Tennis match',
          duration: '120',
          location: 'Tennis court',
          priority: 'medium' as const,
          reason: 'Sport and exercise 🎾',
          autoFill: {
            commonDuration: '120',
            typicalLocation: 'Tennis club',
            recommendedTime: '16:00',
            preparationTasks: [
              '🎾 Pack tennis gear and racquet',
              '📞 Confirm court booking',
              '☀️🌧️ Check weather conditions',
              '🎾💧 Bring extra balls and water',
              '🤸 Warm up before playing'
            ],
            followUpTasks: [
              '📊 Review game performance',
              '📅 Schedule next match',
              '🧹 Clean and store equipment',
              '💪 Track fitness progress'
            ]
          }
        },
        {
          triggers: ['swim', 'swimming', 'pool', 'laps'],
          title: 'Swimming workout',
          duration: '60',
          location: 'Swimming pool',
          priority: 'medium' as const,
          reason: 'Full-body exercise 🏊',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Community pool',
            recommendedTime: '08:00',
            preparationTasks: [
              '🩱 Pack swimwear and goggles',
              '🧴 Bring towel and shower essentials',
              '📅 Check pool schedule and hours',
              '☀️ Apply waterproof sunscreen',
              '📋 Plan swimming routine'
            ],
            followUpTasks: [
              '🚿 Shower and change clothes',
              '📊 Log distance swum',
              '💧 Hydrate thoroughly',
              '📅 Plan next swimming session'
            ]
          }
        }
      ]
    },

    // Business & Professional - UPDATE with enhanced emojis
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
          reason: 'Important business engagement 🤝',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Office conference room',
            recommendedTime: '10:00',
            preparationTasks: ['📋 Prepare agenda', '📚 Review client history', '📊 Gather materials'],
            followUpTasks: ['📧 Send meeting notes', '📅 Schedule follow-up actions']
          }
        },
        {
          triggers: ['interview', 'job interview'],
          title: 'Job interview',
          duration: '90',
          location: 'Company office',
          priority: 'high' as const,
          reason: 'Career opportunity 💼',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Company headquarters',
            recommendedTime: '14:00',
            preparationTasks: ['🔍 Research company', '❓ Prepare questions', '👔 Plan outfit', '📄 Print resume'],
            followUpTasks: ['📧 Send thank you email', '⏰ Follow up on timeline']
          }
        },
        {
          triggers: ['presentation', 'present', 'demo'],
          title: 'Business presentation',
          duration: '45',
          location: 'Meeting room',
          priority: 'high' as const,
          reason: 'Important business deliverable 📊',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Conference room',
            recommendedTime: '15:00',
            preparationTasks: ['📝 Finalize slides', '🎤 Practice presentation', '🖥️ Test equipment'],
            followUpTasks: ['📋 Gather feedback', '📤 Share presentation materials']
          }
        }
      ]
    },

    // Transportation & Travel - UPDATE with enhanced emojis
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
          reason: 'Travel schedule ✈️',
          autoFill: {
            commonDuration: '180',
            typicalLocation: 'Local airport',
            recommendedTime: '06:00',
            preparationTasks: ['📱 Check-in online', '🧳 Pack carry-on', '🚗 Check traffic to airport'],
            followUpTasks: ['🚕 Confirm ground transportation at destination']
          }
        },
        {
          triggers: ['hotel', 'check-in', 'accommodation'],
          title: 'Hotel check-in',
          duration: '30',
          location: 'Hotel',
          priority: 'medium' as const,
          reason: 'Travel accommodation 🏨',
          autoFill: {
            commonDuration: '30',
            typicalLocation: 'Hotel lobby',
            recommendedTime: '15:00',
            preparationTasks: ['📞 Confirm reservation', '🆔💳 Prepare ID and credit card'],
            followUpTasks: ['🏊‍♀️ Explore hotel amenities', '🗺️ Plan local activities']
          }
        }
      ]
    },

    // Personal Care & Lifestyle - UPDATE with enhanced emojis
    personal: {
      patterns: [
        'haircut', 'salon', 'spa', 'massage', 'manicure', 'pedicure',
        'grocery', 'shopping', 'errands', 'bank', 'post office',
        'dry cleaning', 'car wash', 'oil change', 'maintenance',
        'birthday', 'anniversary', 'date', 'dinner', 'lunch', 'date night',
        'romantic', 'celebration', 'special occasion', 'relationship'
      ],
      suggestions: [
        {
          triggers: ['date night', 'date', 'romantic', 'dinner date', 'evening out'],
          title: 'Date night',
          duration: '180',
          location: 'Restaurant',
          priority: 'medium' as const,
          reason: 'Quality time with partner 💑',
          autoFill: {
            commonDuration: '180',
            typicalLocation: 'Nice restaurant',
            recommendedTime: '19:00',
            preparationTasks: [
              '📞 Make restaurant reservation',
              '👗 Choose outfit and get ready',
              '💬 Plan conversation topics',
              '👶 Arrange childcare if needed',
              '⭐ Check restaurant menu and reviews',
              '🚗 Plan transportation or parking'
            ],
            followUpTasks: [
              '📸 Share photos and memories',
              '💕 Plan next date night',
              '⭐ Leave restaurant review',
              '🙏 Thank babysitter if applicable',
              '💭 Reflect on quality time together'
            ]
          }
        },
        {
          triggers: ['haircut', 'salon', 'hair appointment', 'hair'],
          title: 'Hair appointment',
          duration: '90',
          location: 'Hair salon',
          priority: 'low' as const,
          reason: 'Personal grooming ✂️',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Local salon',
            recommendedTime: '14:00',
            preparationTasks: [
              '📱 Bring reference photos for desired style',
              '⏰ Confirm appointment time',
              '🧴 Wash hair with clarifying shampoo',
              '⭐ Research stylist reviews',
              '👕 Plan outfit that\'s easy to change'
            ],
            followUpTasks: [
              '📅 Schedule next appointment in 6-8 weeks',
              '🛒 Purchase recommended hair products',
              '📸 Take photos of new style',
              '⭐ Leave review for stylist'
            ]
          }
        },
        {
          triggers: ['grocery', 'groceries', 'food shopping', 'supermarket'],
          title: 'Grocery shopping',
          duration: '60',
          location: 'Grocery store',
          priority: 'medium' as const,
          reason: 'Weekly essentials 🛒',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Local supermarket',
            recommendedTime: '10:00',
            preparationTasks: [
              '📝 Make detailed shopping list',
              '🕐 Check store hours and sales',
              '🛍️ Bring reusable bags',
              '🏠 Check pantry and fridge inventory',
              '🍽️ Plan meals for the week',
              '💳 Bring coupons and loyalty cards'
            ],
            followUpTasks: [
              '📋 Put away groceries properly',
              '🍽️ Plan meals for the week',
              '📱 Update shopping list app',
              '📅 Check expiration dates',
              '💰 Store receipts for budgeting'
            ]
          }
        },
        {
          triggers: ['birthday', 'anniversary', 'celebration', 'party'],
          title: 'Birthday celebration',
          duration: '240',
          location: 'Party venue',
          priority: 'high' as const,
          reason: 'Special occasion 🎂',
          autoFill: {
            commonDuration: '240',
            typicalLocation: 'Restaurant or home',
            recommendedTime: '18:00',
            preparationTasks: [
              '📧 Send invitations to guests',
              '🎂 Order birthday cake',
              '🎈 Plan party decorations',
              '🍽️ Organize food and drinks',
              '🎵 Prepare playlist or entertainment',
              '🎁 Buy birthday gift if needed'
            ],
            followUpTasks: [
              '🙏 Thank guests for attending',
              '📸 Share photos with everyone',
              '🧹 Clean up party area',
              '💌 Send thank you notes',
              '📅 Plan next celebration'
            ]
          }
        }
      ]
    },

    // Automotive & Maintenance - UPDATE with enhanced emojis
    automotive: {
      patterns: [
        'car', 'vehicle', 'auto', 'maintenance', 'oil change', 'tire',
        'inspection', 'registration', 'insurance', 'repair', 'service',
        'mechanic', 'garage', 'dealership', 'brake', 'engine', 'battery'
      ],
      suggestions: [
        {
          triggers: ['oil change', 'car maintenance', 'vehicle service'],
          title: 'Car oil change',
          duration: '60',
          location: 'Auto service center',
          priority: 'medium' as const,
          reason: 'Vehicle maintenance 🚗',
          autoFill: {
            commonDuration: '60',
            typicalLocation: 'Auto shop',
            recommendedTime: '09:00',
            preparationTasks: [
              '📊 Check current mileage',
              '📄 Gather car documents and registration',
              '⭐ Research service center reviews',
              '📋 Check service history records',
              '🧹 Remove personal items from car',
              '💳 Prepare payment method'
            ],
            followUpTasks: [
              '📅 Schedule next oil change',
              '📝 Update maintenance log',
              '📄 Save service receipt',
              '🔍 Check other fluid levels',
              '🛞 Inspect tire condition while there'
            ]
          }
        },
        {
          triggers: ['car inspection', 'vehicle inspection', 'emissions'],
          title: 'Vehicle inspection',
          duration: '45',
          location: 'Inspection station',
          priority: 'high' as const,
          reason: 'Legal requirement 📋',
          autoFill: {
            commonDuration: '45',
            typicalLocation: 'Inspection station',
            recommendedTime: '11:00',
            preparationTasks: [
              '💡 Check all lights and signals',
              '📄 Ensure registration is current',
              '📋 Verify insurance is up to date',
              '🧽 Clean windshield and mirrors',
              '🛞 Check tire tread depth',
              '📄 Bring required documents'
            ],
            followUpTasks: [
              '🏷️ Display new inspection sticker',
              '🔧 Schedule any needed repairs',
              '📋 Update vehicle records',
              '📅 Plan next year\'s inspection'
            ]
          }
        },
        {
          triggers: ['tire', 'tires', 'rotation', 'alignment'],
          title: 'Tire service',
          duration: '90',
          location: 'Tire shop',
          priority: 'medium' as const,
          reason: 'Safety and maintenance 🛞',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Tire service center',
            recommendedTime: '10:00',
            preparationTasks: [
              '🔍 Check tire pressure and tread',
              '📝 Note any unusual wear patterns',
              '💰 Research tire prices if replacement needed',
              '📄 Bring vehicle registration',
              '📋 Check warranty information'
            ],
            followUpTasks: [
              '🔍 Check tire pressure regularly',
              '📅 Schedule next rotation',
              '👀 Monitor tire wear patterns',
              '📝 Update maintenance records'
            ]
          }
        }
      ]
    },

    // Educational & Learning - UPDATE with enhanced emojis
    education: {
      patterns: [
        'class', 'lecture', 'course', 'study', 'exam', 'test', 'quiz',
        'homework', 'assignment', 'project', 'research', 'library',
        'tutor', 'tutoring', 'lesson', 'workshop', 'seminar', 'webinar',
        'school', 'university', 'college', 'student', 'academic'
      ],
      suggestions: [
        {
          triggers: ['class', 'course', 'lecture', 'school'],
          title: 'Attend class',
          duration: '90',
          location: 'Classroom',
          priority: 'high' as const,
          reason: 'Educational commitment 🏫',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'University campus',
            recommendedTime: '10:00',
            preparationTasks: [
              '📝 Review previous class notes',
              '📚 Prepare notebooks and materials',
              '📅 Check assignment due dates',
              '📖 Read assigned chapters',
              '❓ Prepare questions for professor',
              '📋 Charge laptop and bring charger'
            ],
            followUpTasks: [
              '📝 Review and organize class notes',
              '✅ Complete any new assignments',
              '📅 Schedule study sessions',
              '👥 Form study groups with classmates',
              '🏫 Visit professor during office hours if needed'
            ]
          }
        },
        {
          triggers: ['exam', 'test', 'quiz', 'midterm', 'final'],
          title: 'Take exam',
          duration: '120',
          location: 'Exam room',
          priority: 'high' as const,
          reason: 'Academic assessment 📝',
          autoFill: {
            commonDuration: '120',
            typicalLocation: 'Testing center',
            recommendedTime: '09:00',
            preparationTasks: [
              '📚 Complete final review session',
              '📝 Prepare required exam materials',
              '😴 Get good night\'s sleep',
              '🥞 Eat healthy breakfast',
              '⏰ Arrive 15 minutes early',
              '🆔 Bring ID and required supplies'
            ],
            followUpTasks: [
              '😌 Decompress and relax after exam',
              '⏳ Wait for results patiently',
              '📋 Review exam when returned',
              '📈 Plan improvements for next exam'
            ]
          }
        },
        {
          triggers: ['homework', 'assignment', 'project', 'paper'],
          title: 'Complete homework',
          duration: '120',
          location: 'Study area',
          priority: 'high' as const,
          reason: 'Academic requirement ✏️',
          autoFill: {
            commonDuration: '120',
            typicalLocation: 'Library or home',
            recommendedTime: '16:00',
            preparationTasks: [
              '📚 Gather all required materials',
              '🤫 Find quiet study space',
              '📋 Review assignment requirements',
              '📝 Create outline or plan',
              '📵 Eliminate distractions',
              '📖 Set up reference materials'
            ],
            followUpTasks: [
              '✏️ Proofread and edit work',
              '📤 Submit assignment on time',
              '💾 Save backup copies',
              '📋 Update assignment tracker',
              '📅 Prepare for next assignment'
            ]
          }
        },
        {
          triggers: ['study', 'review', 'prepare', 'cram'],
          title: 'Study session',
          duration: '90',
          location: 'Library',
          priority: 'medium' as const,
          reason: 'Academic preparation 📚',
          autoFill: {
            commonDuration: '90',
            typicalLocation: 'Quiet study area',
            recommendedTime: '15:00',
            preparationTasks: [
              '📚 Organize notes and materials',
              '📅 Create study schedule',
              '🤫 Find optimal study environment',
              '🥜 Prepare snacks and water',
              '🎯 Set study goals for session',
              '📵 Turn off phone notifications'
            ],
            followUpTasks: [
              '📝 Review what was learned',
              '📅 Plan next study session',
              '📝 Take practice quizzes',
              '👥 Form study groups if helpful',
              '🎉 Reward yourself for progress'
            ]
          }
        }
      ]
    }
  };

  // UPDATE your getSmartSuggestions method to include icons
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
            const category = this.mapDomainToCategory(domain, categories);

            suggestions.push({
              title: smartTitle,
              category,
              priority: suggestion.priority,
              location: suggestion.location,
              duration: suggestion.duration,
              confidence,
              reason,
              icon: getFunTaskIcon(smartTitle, category),
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

  // Keep your existing generateSmartTitle method exactly as is
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
      smartTitle = `🚨 URGENT: ${smartTitle}`;
    }

    return smartTitle;
  }

  // Keep your existing mapDomainToCategory method exactly as is
  static mapDomainToCategory(domain: string, categories: string[]): string {
    const domainMapping: { [key: string]: string[] } = {
      'medical': ['health', 'personal'],
      'sports': ['fitness', 'health', 'personal'],
      'business': ['work'],
      'travel': ['travel', 'personal'],
      'personal': ['personal'],
      'education': ['education', 'personal'],
      'automotive': ['personal', 'other']
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

  // Keep your existing suggestOptimalDate method exactly as is
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
      case 'automotive':
        // Car maintenance typically scheduled within a week
        suggestedDate.setDate(now.getDate() + Math.floor(Math.random() * 5) + 1);
        // Prefer weekdays for auto services
        while (suggestedDate.getDay() === 0 || suggestedDate.getDay() === 6) {
          suggestedDate.setDate(suggestedDate.getDate() + 1);
        }
        break;
      case 'education':
        // School activities typically next business day
        suggestedDate.setDate(now.getDate() + 1);
        // Skip weekends
        while (suggestedDate.getDay() === 0 || suggestedDate.getDay() === 6) {
          suggestedDate.setDate(suggestedDate.getDate() + 1);
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

  // UPDATE your getContextualSuggestions method to include icons
  static async getContextualSuggestions(input: string, existingTasks: string[], categories: string[]): Promise<AdvancedAITaskSuggestion[]> {
    const suggestions: AdvancedAITaskSuggestion[] = [];
    
    // Time-based suggestions
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // Morning health routine suggestions
    if (hour >= 6 && hour <= 9 && input.includes('workout')) {
      const category = 'fitness';
      suggestions.push({
        title: 'Morning workout routine',
        category,
        priority: 'medium',
        duration: '45',
        confidence: 0.8,
        reason: 'Perfect morning activity ☀️💪',
        icon: getFunTaskIcon('Morning workout routine', category),
        autoFillData: {
          recommendedTime: '07:00',
          preparationTasks: ['👕 Prepare workout clothes', '🍌 Have light breakfast'],
          followUpTasks: ['🧘 Post-workout stretch', '🥗 Healthy breakfast']
        }
      });
    }

    // Weekend activity suggestions
    if ((day === 0 || day === 6) && input.includes('fun')) {
      const category = 'personal';
      suggestions.push({
        title: 'Weekend recreational activity',
        category,
        priority: 'low',
        duration: '120',
        confidence: 0.7,
        reason: 'Weekend leisure time 🎪',
        icon: getFunTaskIcon('Weekend recreational activity', category),
        autoFillData: {
          recommendedTime: '14:00',
          preparationTasks: ['☀️🌧️ Check weather', '📅 Plan activity'],
          followUpTasks: ['📸 Share experience with friends']
        }
      });
    }

    // Workday meeting suggestions
    if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17 && input.includes('meet')) {
      const category = 'work';
      suggestions.push({
        title: 'Schedule team meeting',
        category,
        priority: 'high',
        duration: '60',
        confidence: 0.85,
        reason: 'Business hours meeting 🤝',
        icon: getFunTaskIcon('Schedule team meeting', category),
        autoFillData: {
          recommendedTime: '10:00',
          preparationTasks: ['📋 Prepare agenda', '🏢 Book conference room'],
          followUpTasks: ['📧 Send meeting summary', '✅ Track action items']
        }
      });
    }

    return suggestions;
  }

  // Keep your existing getTaskRecommendations method but ADD enhanced version
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

  // ADD this new enhanced method for better task recommendations
  static getEnhancedTaskRecommendations(taskTitle: string): { preparation: string[], followUp: string[], tips: string[] } {
    const titleLower = taskTitle.toLowerCase();
    
    // Find matching suggestion in our intelligence database
    for (const domain of Object.values(this.taskIntelligence)) {
      for (const suggestion of domain.suggestions) {
        if (suggestion.triggers.some(trigger => titleLower.includes(trigger))) {
          return {
            preparation: suggestion.autoFill?.preparationTasks || [],
            followUp: suggestion.autoFill?.followUpTasks || [],
            tips: this.getTaskTips(taskTitle)
          };
        }
      }
    }

    // Fallback suggestions based on common task types
    const fallbackSuggestions = this.getFallbackRecommendations(titleLower);
    return {
      ...fallbackSuggestions,
      tips: this.getTaskTips(taskTitle)
    };
  }

  // ADD this new method for fallback recommendations
  static getFallbackRecommendations(taskTitle: string): { preparation: string[], followUp: string[] } {
    const preparation: string[] = [];
    const followUp: string[] = [];

    // Meeting-related tasks
    if (taskTitle.includes('meeting') || taskTitle.includes('call')) {
      preparation.push('📋 Prepare agenda and talking points');
      preparation.push('💻 Test video conferencing setup');
      preparation.push('📱 Ensure phone is charged');
      followUp.push('📧 Send meeting summary');
      followUp.push('📅 Schedule follow-up actions');
    }

    // Shopping tasks
    if (taskTitle.includes('shop') || taskTitle.includes('buy') || taskTitle.includes('grocery')) {
      preparation.push('📝 Make detailed shopping list');
      preparation.push('💳 Bring payment method and coupons');
      preparation.push('🛍️ Bring reusable bags');
      followUp.push('📋 Put away items properly');
      followUp.push('💰 Update budget tracker');
    }

    // Appointment tasks
    if (taskTitle.includes('appointment')) {
      preparation.push('🆔 Bring required ID and insurance');
      preparation.push('📝 Prepare questions to ask');
      preparation.push('⏰ Plan to arrive 15 minutes early');
      followUp.push('📅 Schedule next appointment if needed');
      followUp.push('📋 Follow any given instructions');
    }

    // Exercise/fitness tasks
    if (taskTitle.includes('workout') || taskTitle.includes('gym') || taskTitle.includes('exercise')) {
      preparation.push('👕 Pack workout clothes and shoes');
      preparation.push('💧 Bring water bottle');
      preparation.push('🎵 Prepare motivating playlist');
      followUp.push('🧘 Stretch and cool down');
      followUp.push('📱 Log workout in fitness app');
    }

    // Travel tasks
    if (taskTitle.includes('flight') || taskTitle.includes('trip') || taskTitle.includes('travel')) {
      preparation.push('📘 Check passport/ID validity');
      preparation.push('🧳 Pack essentials and check weather');
      preparation.push('📱 Download offline maps and boarding passes');
      followUp.push('🏠 Unpack and do laundry');
      followUp.push('📸 Organize and share photos');
    }

    return { preparation, followUp };
  }

  // ADD this new method for task tips
  static getTaskTips(taskTitle: string): string[] {
    const titleLower = taskTitle.toLowerCase();
    const tips: string[] = [];

    if (titleLower.includes('workout') || titleLower.includes('exercise')) {
      tips.push('💡 Tip: Exercise releases endorphins that boost mood!');
      tips.push('⏰ Best time: Morning workouts can energize your entire day');
      tips.push('🎵 Music can increase workout performance by up to 15%');
    }

    if (titleLower.includes('meeting')) {
      tips.push('💡 Tip: Stand-up meetings are 34% shorter than sitting meetings');
      tips.push('🕐 Best time: Tuesday-Thursday, 2:30-3:30 PM for peak attention');
      tips.push('📱 Turn off notifications for better focus');
    }

    if (titleLower.includes('doctor') || titleLower.includes('dental')) {
      tips.push('💡 Tip: Morning appointments often run more on time');
      tips.push('📝 Writing down symptoms beforehand improves visit quality');
      tips.push('❓ Prepare 3 key questions to maximize your time');
    }

    if (titleLower.includes('study') || titleLower.includes('homework')) {
      tips.push('💡 Tip: Study in 25-minute focused sessions (Pomodoro Technique)');
      tips.push('🧠 Best time: Your brain is most alert 2-4 hours after waking');
      tips.push('📵 Remove distractions for better concentration');
    }

    if (titleLower.includes('grocery') || titleLower.includes('shopping')) {
      tips.push('💡 Tip: Shop the perimeter of the store for fresh foods first');
      tips.push('🕐 Best time: Early morning or late evening to avoid crowds');
      tips.push('📝 Stick to your list to avoid impulse purchases');
    }

    return tips;
  }
}

// UPDATE your existing icon function to use the new enhanced system
export const getTaskAIIcon = getFunTaskIcon;