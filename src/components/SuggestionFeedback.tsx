// src/components/SuggestionFeedback.tsx
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuggestionFeedbackProps {
  suggestion: SmartSuggestion;
  onFeedback: (suggestionId: string, feedback: 'positive' | 'negative') => void;
}

export const SuggestionFeedback: React.FC<SuggestionFeedbackProps> = ({
  suggestion,
  onFeedback
}) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  
  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    onFeedback(suggestion.id, type);
    
    // Hide feedback buttons after 2 seconds
    setTimeout(() => setFeedback(null), 2000);
  };
  
  if (feedback) {
    return (
      <div className="text-xs text-green-600 flex items-center">
        <ThumbsUp className="h-3 w-3 mr-1" />
        Thanks for your feedback!
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={() => handleFeedback('positive')}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0"
        onClick={() => handleFeedback('negative')}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
};