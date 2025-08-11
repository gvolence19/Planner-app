// src/components/SuggestionDropdown.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Zap, User, Calendar } from 'lucide-react';

interface SuggestionDropdownProps {
  suggestions: SmartSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: SmartSuggestion) => void;
  onClose: () => void;
  isLoading: boolean;
}

export const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({
  suggestions,
  selectedIndex,
  onSelect,
  onClose,
  isLoading
}) => {
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent': return <Clock className="h-3 w-3" />;
      case 'template': return <Star className="h-3 w-3" />;
      case 'completion': return <Zap className="h-3 w-3" />;
      case 'pattern': return <User className="h-3 w-3" />;
      case 'context': return <Calendar className="h-3 w-3" />;
      default: return null;
    }
  };
  
  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
      <CardContent className="p-0">
        {isLoading && (
          <div className="p-3 text-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
        
        {!isLoading && suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
              index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(suggestion)}
          >
            {/* Suggestion content */}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};