// src/components/SuggestionSkeleton.tsx
import React from 'react';

export const SuggestionSkeleton: React.FC = () => (
  <div className="animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="p-3 border-b last:border-b-0">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-3 w-3 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="flex space-x-2">
          <div className="h-5 w-12 bg-gray-200 rounded"></div>
          <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);