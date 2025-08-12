// src/lib/context-engine.ts
export class ContextEngine {
  static generateContextualSuggestions(query: string, userContext: UserContext): SmartSuggestion[] {
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = [0, 6].includes(now.getDay());
    
    const suggestions: SmartSuggestion[] = [];
    
    // Time-based suggestions
    if (hour >= 9 && hour <= 17 && !isWeekend) {
      // Work hours - suggest work-related tasks
      if (query.toLowerCase().includes('meet')) {
        suggestions.push({
          type: 'context',
          title: 'Schedule team meeting',
          category: 'Work',
          priority: 'medium',
          confidence: 0.7
        });
      }
    }
   
   // Location-based suggestions (if geolocation available)
   if (userContext.location?.includes('store') || userContext.location?.includes('market')) {
     if (query.toLowerCase().includes('buy')) {
       suggestions.push({
         type: 'context',
         title: `Buy ${query.replace('buy', '').trim()}`,
         category: 'Shopping',
         priority: 'medium',
         location: userContext.location,
         confidence: 0.8
       });
     }
   }
   
   // Calendar-based suggestions
   if (userContext.upcomingEvents?.length > 0) {
     const nextEvent = userContext.upcomingEvents[0];
     if (query.toLowerCase().includes('prepare')) {
       suggestions.push({
         type: 'context',
         title: `Prepare for ${nextEvent.title}`,
         category: 'Work',
         priority: 'high',
         confidence: 0.75
       });
     }
   }
   
   return suggestions;
 }
}

interface UserContext {
 location?: string;
 upcomingEvents?: Array<{ title: string; startTime: Date }>;
 recentTasks?: Task[];
 preferences?: {
   defaultCategory?: string;
   defaultPriority?: string;
 };
}