import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LocationDisplayProps {
  location: string;
  compact?: boolean;
}

export default function LocationDisplay({ location, compact = false }: LocationDisplayProps) {
  const [mapThumbnail, setMapThumbnail] = useState<string | null>(null);

  // Helper function to determine if running on iOS
  const isIOS = () => {
    return typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  };
  
  // Create appropriate map URL based on platform
  const getMapUrl = () => {
    if (isIOS()) {
      return `https://maps.apple.com/?q=${encodeURIComponent(location)}`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
  };

  // Try to get a static map thumbnail
  useEffect(() => {
    if (!location) return;

    // For demonstration, we'll use Google Static Maps API
    // In a production environment, you would use your own API key
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=14&size=300x150&markers=color:red%7C${encodeURIComponent(location)}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`;
    
    // Check if the browser can load images
    if (typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => setMapThumbnail(staticMapUrl);
      img.onerror = () => setMapThumbnail(null);
      img.src = staticMapUrl;
    }
  }, [location]);

  if (!location) return null;

  if (compact) {
    return (
      <div className="flex items-center text-xs">
        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
        <a 
          href={getMapUrl()}
          className="text-blue-500 hover:underline truncate"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {location}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center text-sm">
        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
        <a 
          href={getMapUrl()}
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {location}
        </a>
      </div>
      
      {mapThumbnail && (
        <div className="mt-2 relative rounded-md overflow-hidden">
          <a 
            href={getMapUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <img 
              src={mapThumbnail} 
              alt={`Map of ${location}`} 
              className="w-full h-auto rounded-md hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
              <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                Open in {isIOS() ? 'Apple Maps' : 'Google Maps'}
              </span>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}