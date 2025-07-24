import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Label } from './ui/label';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
}

// Use the eslint-disable comment to bypass the no-explicit-any rule for this specific case
// Since Google Maps typings are complex and not essential to the core functionality
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function LocationInput({ value, onChange, id = "location", label = "Location" }: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const autocompleteRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const [manualInput, setManualInput] = useState(value);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  // Function to check if Google Maps API is available
  const isGoogleMapsAvailable = () => {
    return window.google && 
           window.google.maps && 
           window.google.maps.places && 
           typeof window.google.maps.places.Autocomplete === 'function';
  };

  // Function to initialize autocomplete - with built-in retry logic
  const initializeAutocomplete = (retry = 3, delay = 500) => {
    if (!inputRef.current) return;
    
    // If Google Maps is not available yet, retry a few times
    if (!isGoogleMapsAvailable()) {
      if (retry > 0) {
        console.log(`Google Maps not available yet, retrying in ${delay}ms. Attempts left: ${retry}`);
        setTimeout(() => initializeAutocomplete(retry - 1, delay * 1.5), delay);
      } else {
        console.error("Google Maps API not available after retries");
        setError("Location service unavailable. Please enter address manually.");
      }
      return;
    }
    
    try {
      console.log("Initializing Google Maps Autocomplete");
      
      // Destroy previous instance if it exists
      if (autocompleteRef.current) {
        // Google doesn't provide a direct way to destroy an autocomplete instance
        // so we'll just create a new one
        console.log("Replacing existing autocomplete instance");
        autocompleteRef.current = null;
      }
      
      // Create new autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'name', 'geometry', 'place_id']
      });
      
      // Store the instance in ref
      autocompleteRef.current = autocomplete;
      
      // Add place_changed listener
      autocomplete.addListener('place_changed', () => {
        try {
          const place = autocomplete.getPlace();
          console.log("Place selected:", place);
          
          // Check if we got a valid place with a place_id
          if (place && place.place_id) {
            // Prefer formatted_address, but fall back to name if needed
            const address = place.formatted_address || place.name || '';
            console.log("Setting location to:", address);
            setManualInput(address);
            onChange(address);
          } else {
            console.warn("Selected place has no place_id or is incomplete", place);
          }
        } catch (err) {
          console.error("Error in place_changed handler:", err);
        }
      });
      
      console.log("Autocomplete initialized successfully on:", inputRef.current);
      
    } catch (error) {
      console.error("Error initializing Google Maps Autocomplete:", error);
      setError("Error initializing location service. Please enter address manually.");
    }
  };

  // Check if Google Maps API is loaded on mount and listen for events
  useEffect(() => {
    console.log("LocationInput mounted, checking for Google Maps API");
    
    // Check if API is already available
    if (isGoogleMapsAvailable()) {
      console.log("Google Maps API already available on mount");
      setGoogleMapsLoaded(true);
      initializeAutocomplete();
      setError(null);
    }

    // Listen for successful loading
    const handleGoogleMapsLoaded = () => {
      console.log("Google Maps loaded event received");
      setGoogleMapsLoaded(true);
      initializeAutocomplete();
      setError(null);
    };

    // Listen for loading failure
    const handleGoogleMapsFailed = () => {
      console.error("Google Maps API failed to load");
      setGoogleMapsLoaded(false);
      setError("Location service unavailable. Please enter address manually.");
    };

    // Add event listeners
    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
    window.addEventListener('google-maps-failed', handleGoogleMapsFailed);

    // Cleanup event listeners and autocomplete instance
    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      window.removeEventListener('google-maps-failed', handleGoogleMapsFailed);
      
      // Clean up any debounce timers
      if (debounceTimeout !== null) {
        clearTimeout(debounceTimeout);
      }
      
      // No explicit cleanup needed for autocomplete as it's attached to the input element
      autocompleteRef.current = null;
    };
  }, []);

  // Re-initialize when the input changes or becomes available
  useEffect(() => {
    // Update local state when value prop changes
    if (value !== manualInput) {
      setManualInput(value);
    }
  }, [value]);

  // Handle manual text changes with debouncing to improve performance
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setManualInput(newValue);
    
    // Clear any existing timeout to debounce rapid typing
    if (debounceTimeout !== null) {
      clearTimeout(debounceTimeout);
    }
    
    // Debounce the onChange prop call
    const timeoutId = window.setTimeout(() => {
      onChange(newValue);
    }, 300);
    
    setDebounceTimeout(timeoutId);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={manualInput}
          placeholder="Enter location (e.g., 123 Main St, City)"
          className="pr-8"
          onChange={handleInputChange}
          onFocus={() => {
            // Try to initialize on focus in case it wasn't initialized earlier
            if (googleMapsLoaded && !autocompleteRef.current && inputRef.current) {
              console.log("Initializing autocomplete on focus");
              initializeAutocomplete();
            }
          }}
        />
        <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!googleMapsLoaded && !error && (
        <p className="text-xs text-amber-500">Loading location service...</p>
      )}
    </div>
  );
}