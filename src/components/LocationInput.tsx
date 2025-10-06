import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Label } from './ui/label';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface MapboxSuggestion {
  place_name: string;
  center: [number, number];
}

export default function LocationInput({ 
  value, 
  onChange, 
  id = "location", 
  label = "Location", 
  disabled = false,
  placeholder = "Enter location (e.g., 123 Main St, City)"
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mapbox Access Token - Get yours free at https://account.mapbox.com/
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ3ZvbGVuY2UiLCJhIjoiY21nZmlyNnZnMDY2ejJsb3B5OWZjaTF4cCJ9.mPaWj5EJCD1m8Rd_X84RLw';
  
  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,place&limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } else {
        console.error('Mapbox API error:', response.statusText);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: MapboxSuggestion) => {
    onChange(suggestion.place_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
          autoComplete="off"
        />
        <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Searching...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors text-sm border-b last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>{suggestion.place_name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {!MAPBOX_TOKEN.includes('your') && (
        <p className="text-xs text-muted-foreground">
          Location autocomplete powered by Mapbox
        </p>
      )}
      {MAPBOX_TOKEN.includes('your') && (
        <p className="text-xs text-amber-600">
          ⚠️ Add your Mapbox token to enable autocomplete
        </p>
      )}
    </div>
  );
}